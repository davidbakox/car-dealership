import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });
loadEnv();

type CheckResult = {
  name: string;
  ok: boolean;
  detail?: string;
};

const results: CheckResult[] = [];

function ok(name: string, detail?: string) {
  results.push({ name, ok: true, detail });
  console.log(`✅ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name: string, error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  results.push({ name, ok: false, detail });
  console.log(`❌ ${name} — ${detail}`);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function redact(value: string) {
  if (value.length <= 10) return "***";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function publicUrlForKey(baseUrl: string, key: string) {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${cleanBase}/${encodedKey}`;
}

async function checkSupabase() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  ok("Supabase env variables present", `url=${url}, anon=${redact(anonKey)}, service=${redact(serviceKey)}`);

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { count, error: readError } = await supabase
    .from("cars")
    .select("id", { count: "exact", head: true });

  if (readError) throw new Error(`cars table read failed: ${readError.message}`);
  ok("Supabase cars table readable", `${count ?? 0} rows visible`);

  const marker = `__connection_test_${Date.now()}__`;
  let insertedId: string | null = null;

  try {
    const { data, error: insertError } = await supabase
      .from("cars")
      .insert({
        title: marker,
        make: "Connection",
        model: "Test",
        year: 2026,
        mileage: 1,
        fuel_type: "petrol",
        transmission: "manual",
        price: 1,
        currency: "EUR",
        description: "Temporary row created by npm run check:connections",
        status: "available",
        images: [],
        is_featured: false,
      })
      .select("id")
      .single();

    if (insertError) throw new Error(`insert failed: ${insertError.message}`);
    insertedId = data.id;
    ok("Supabase cars table writable", `temporary row id=${insertedId}`);
  } finally {
    if (insertedId) {
      const { error: deleteError } = await supabase
        .from("cars")
        .delete()
        .eq("id", insertedId);
      if (deleteError) {
        throw new Error(
          `temporary row inserted but cleanup failed: ${deleteError.message}`
        );
      }
      ok("Supabase cleanup completed", "temporary row deleted");
    }
  }
}

async function checkR2() {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const bucket = requireEnv("R2_BUCKET_NAME");
  const publicUrl = requireEnv("NEXT_PUBLIC_R2_PUBLIC_URL");

  ok(
    "R2 env variables present",
    `account=${redact(accountId)}, bucket=${bucket}, public=${publicUrl}`
  );

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const key = `_healthcheck/${Date.now()}-${randomUUID()}.txt`;
  let uploaded = false;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: new TextEncoder().encode("dennis-cars-r2-healthcheck"),
        ContentType: "text/plain; charset=utf-8",
        CacheControl: "no-store",
      })
    );
    uploaded = true;
    ok("R2 bucket writable", key);

    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    ok("R2 uploaded object readable via API", key);

    const url = publicUrlForKey(publicUrl, key);
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error(`public URL returned HTTP ${response.status}: ${url}`);
    }
    ok("R2 public URL works", url);
  } finally {
    if (uploaded) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      ok("R2 cleanup completed", "temporary object deleted");
    }
  }
}

async function main() {
  console.log("\nDennis Cars connection check\n");

  try {
    await checkSupabase();
  } catch (error) {
    fail("Supabase check failed", error);
  }

  try {
    await checkR2();
  } catch (error) {
    fail("R2 check failed", error);
  }

  const failed = results.filter((result) => !result.ok);
  console.log("\nSummary");
  console.log("-------");
  console.log(`${results.length - failed.length}/${results.length} checks passed`);

  if (failed.length > 0) {
    console.log("\nFailed checks:");
    for (const result of failed) {
      console.log(`- ${result.name}: ${result.detail}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("\nEverything is connected correctly.");
}

main().catch((error) => {
  fail("Unexpected script error", error);
  process.exitCode = 1;
});
