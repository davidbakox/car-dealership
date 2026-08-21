/**
 * Guard against a corrupted Cloudflare/Vercel build before it is deployed.
 *
 * On 2026-08-21 a native-Windows `vercel build` silently emitted an output tree
 * where 25 routes collapsed into 7 function directories with mismatched names:
 * `_not-found.func` actually contained the admin sell-requests page, so every
 * public sub-route redirected visitors to the admin login. Nothing failed; the
 * build reported success. This script makes that failure loud.
 *
 *   node scripts/verify-build.mjs
 *
 * Exits non-zero if the output is unsafe to deploy.
 */
import { readdirSync, readFileSync, existsSync, lstatSync, realpathSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = ".vercel/output/functions";
const problems = [];
const notes = [];

if (!existsSync(OUT)) {
  console.error(`x No build output at ${OUT} — run the Cloudflare build first.`);
  process.exit(1);
}

/** Every *.func entry, with whether it is a real directory or a symlink. */
function collect(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.name.endsWith(".func")) {
      acc.push({ path: full, isLink: lstatSync(full).isSymbolicLink() });
    } else if (entry.isDirectory()) {
      collect(full, acc);
    }
  }
  return acc;
}

const funcs = collect(OUT);
if (funcs.length === 0) {
  console.error("x No .func entries found — the build produced nothing.");
  process.exit(1);
}

/** functions/[locale]/cars.func -> "[locale]/cars" */
const routeOf = (p) =>
  relative(OUT, p).split(sep).join("/").replace(/\.func$/, "");

// `.rsc` variants are legitimate aliases of their base route.
const isRscAlias = (route) => route.endsWith(".rsc");

for (const { path, isLink } of funcs) {
  const route = routeOf(path);
  if (isRscAlias(route)) continue;

  const configPath = join(path, ".vc-config.json");
  if (!existsSync(configPath)) {
    problems.push(`${route}: no .vc-config.json (broken function directory)`);
    continue;
  }

  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (err) {
    problems.push(`${route}: unreadable .vc-config.json (${err.message})`);
    continue;
  }

  // Prerendered assets (icon.svg, robots.txt) legitimately carry no name.
  if (!config.name) {
    notes.push(`${route}: no "name" field (prerendered asset — ok)`);
    continue;
  }

  // The decisive check: a function must describe the route it is served at.
  if (config.name !== route) {
    problems.push(
      `${route}: serves the WRONG page — .vc-config.json says "${config.name}"` +
        (isLink ? ` (symlink -> ${realpathSync(path).split(sep).pop()})` : "")
    );
  }
}

const real = funcs.filter((f) => !f.isLink).length;
console.log(
  `Checked ${funcs.length} function entries (${real} real directories, ` +
    `${funcs.length - real} symlinks).`
);
for (const n of notes) console.log(`  - ${n}`);

if (problems.length > 0) {
  console.error(`\nBUILD IS CORRUPT — DO NOT DEPLOY. ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  x ${p}`);
  console.error(
    "\nNative Windows builds are known to produce this. Build on Linux " +
      "(Cloudflare CI or WSL) instead — see README section 1."
  );
  process.exit(1);
}

console.log("\nOK — every function serves the route it is mapped to. Safe to deploy.");
