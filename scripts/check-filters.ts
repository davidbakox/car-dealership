/**
 * Exhaustive check of the public catalogue filtering, sorting and paging.
 *
 * Runs against synthetic cars rather than the live catalogue, so every filter
 * branch can be exercised (the real stock is a handful of cars and would leave
 * most facets untested) and so the production database is never written to.
 *
 *   npm run check:filters
 */
import {
  filterCars,
  sortCars,
  parseSort,
  parsePage,
  modelsByMake,
  activeFilterCount,
  isNewInStock,
  one,
  many,
  PAGE_SIZE,
} from "../lib/car-filters";
import type { Car } from "../lib/types";

let passed = 0;
const failures: string[] = [];

function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed++;
  } else {
    failures.push(`${label}\n    expected ${e}\n    actual   ${a}`);
  }
}

const day = 24 * 60 * 60 * 1000;
let seq = 0;
function car(over: Partial<Car> & { id: string }): Car {
  seq++;
  return {
    title: over.id,
    make: "Volkswagen",
    model: "Golf",
    year: 2015,
    mileage: 100_000,
    fuel_type: "diesel",
    transmission: "manual",
    price: 10_000,
    currency: "EUR",
    description: "",
    status: "available",
    images: [],
    is_featured: false,
    created_at: new Date(Date.now() - seq * 30 * day).toISOString(),
    body_type: "sedan",
    drivetrain: "fwd",
    euro_norm: "euro5",
    engine: "2.0 TDI",
    seats: 5,
    is_consignment: false,
    has_home_delivery: false,
    features: [],
    ...over,
  } as Car;
}

// A spread that exercises every facet at least twice.
const cars: Car[] = [
  car({ id: "a", make: "Audi", model: "A4", year: 2010, mileage: 200_000, price: 6_000,
        fuel_type: "petrol", transmission: "automatic", body_type: "wagon",
        drivetrain: "awd", euro_norm: "euro4", seats: 5, engine: "1.8 TFSI",
        features: ["abs_esp_airbag", "navigation"] }),
  car({ id: "b", make: "Volkswagen", model: "Passat", year: 2018, mileage: 50_000, price: 15_000,
        fuel_type: "diesel", transmission: "manual", body_type: "sedan",
        drivetrain: "fwd", euro_norm: "euro6", seats: 5, is_consignment: true,
        features: ["abs_esp_airbag"] }),
  car({ id: "c", make: "Volkswagen", model: "Golf", year: 2021, mileage: 20_000, price: 22_000,
        fuel_type: "electric", transmission: "automatic", body_type: "hatchback",
        drivetrain: "rwd", euro_norm: "euro6", seats: 4, has_home_delivery: true,
        features: ["navigation", "heated_seats"] }),
  car({ id: "d", make: "Kia", model: "Sportage", year: 2013, mileage: 220_000, price: 8_500,
        fuel_type: "lpg", transmission: "manual", body_type: "suv",
        drivetrain: "fwd", euro_norm: "euro5", seats: 7, is_consignment: true,
        features: [] }),
  car({ id: "e", make: "Ford", model: "Transit", year: 2016, mileage: 180_000, price: 12_000,
        fuel_type: "diesel", transmission: "manual", body_type: "van",
        drivetrain: "rwd", euro_norm: "euro5", seats: 9, status: "sold" }),
  car({ id: "f", make: "Audi", model: "A5", year: 2019, mileage: 90_000, price: 18_000,
        fuel_type: "hybrid", transmission: "automatic", body_type: "coupe",
        drivetrain: "awd", euro_norm: "euro6", seats: 4, status: "reserved" }),
];

const ids = (f: Parameters<typeof filterCars>[1]) =>
  filterCars(cars, f).map((c) => c.id).sort();

console.log("Filtering\n---------");

// --- single-value facets ---------------------------------------------------
check("make=Audi", ids({ make: "Audi" }), ["a", "f"]);
check("make=Kia", ids({ make: "Kia" }), ["d"]);
check("model=Golf", ids({ model: "Golf" }), ["c"]);
check("make+model together", ids({ make: "Audi", model: "A4" }), ["a"]);
check("make+model mismatch", ids({ make: "Kia", model: "A4" }), []);
check("seats=4", ids({ seats: "4" }), ["c", "f"]);
check("seats=9", ids({ seats: "9" }), ["e"]);
check("seats no match", ids({ seats: "2" }), []);

// --- every body type -------------------------------------------------------
for (const [b, expect] of [
  ["sedan", ["b"]], ["suv", ["d"]], ["wagon", ["a"]], ["hatchback", ["c"]],
  ["coupe", ["f"]], ["van", ["e"]], ["minibus", []],
] as const) {
  check(`body=${b}`, ids({ body: b }), expect);
}
check("body multi (suv+van)", ids({ body: ["suv", "van"] }), ["d", "e"]);

// --- every fuel type -------------------------------------------------------
for (const [f, expect] of [
  ["petrol", ["a"]], ["diesel", ["b", "e"]], ["hybrid", ["f"]],
  ["electric", ["c"]], ["lpg", ["d"]],
] as const) {
  check(`fuel=${f}`, ids({ fuel: f }), expect);
}
check("fuel multi (petrol+lpg)", ids({ fuel: ["petrol", "lpg"] }), ["a", "d"]);

// --- transmission / drivetrain / euro --------------------------------------
check("transmission=manual", ids({ transmission: "manual" }), ["b", "d", "e"]);
check("transmission=automatic", ids({ transmission: "automatic" }), ["a", "c", "f"]);
check("drivetrain=fwd", ids({ drivetrain: "fwd" }), ["b", "d"]);
check("drivetrain=rwd", ids({ drivetrain: "rwd" }), ["c", "e"]);
check("drivetrain=awd", ids({ drivetrain: "awd" }), ["a", "f"]);
check("drivetrain multi", ids({ drivetrain: ["fwd", "awd"] }), ["a", "b", "d", "f"]);
check("euro=euro4", ids({ euro: "euro4" }), ["a"]);
check("euro=euro5", ids({ euro: "euro5" }), ["d", "e"]);
check("euro=euro6", ids({ euro: "euro6" }), ["b", "c", "f"]);
check("euro=euro3 (none)", ids({ euro: "euro3" }), []);

// --- sale type -------------------------------------------------------------
check("sale=consignment", ids({ sale: "consignment" }), ["b", "d"]);
check("sale=own", ids({ sale: "own" }), ["a", "c", "e", "f"]);
check("sale='' (all)", ids({ sale: "" }), ["a", "b", "c", "d", "e", "f"]);

// --- features use AND semantics --------------------------------------------
check("feature abs", ids({ features: "abs_esp_airbag" }), ["a", "b"]);
check("feature navigation", ids({ features: "navigation" }), ["a", "c"]);
check("features abs AND nav", ids({ features: ["abs_esp_airbag", "navigation"] }), ["a"]);
check("features nav AND heated", ids({ features: ["navigation", "heated_seats"] }), ["c"]);
check("feature nobody has", ids({ features: "tow_bar" }), []);

// --- numeric ranges --------------------------------------------------------
check("minYear=2016", ids({ minYear: "2016" }), ["b", "c", "e", "f"]);
check("maxYear=2013", ids({ maxYear: "2013" }), ["a", "d"]);
check("year window 2015-2019", ids({ minYear: "2015", maxYear: "2019" }), ["b", "e", "f"]);
check("minPrice=12000", ids({ minPrice: "12000" }), ["b", "c", "e", "f"]);
check("maxPrice=8500", ids({ maxPrice: "8500" }), ["a", "d"]);
check("price window", ids({ minPrice: "8000", maxPrice: "15000" }), ["b", "d", "e"]);
check("maxMileage=100000", ids({ maxMileage: "100000" }), ["b", "c", "f"]);
check("maxMileage=50000", ids({ maxMileage: "50000" }), ["b", "c"]);
check("legacy priceRange 5000-9999", ids({ priceRange: "5000-9999" }), ["a", "d"]);
check("legacy priceRange 20000-", ids({ priceRange: "20000-" }), ["c"]);

// --- free-text search ------------------------------------------------------
check("q=passat (title/model)", ids({ q: "passat" }), ["b"]);
check("q=audi (make)", ids({ q: "audi" }), ["a", "f"]);
check("q=TDI (engine)", ids({ q: "tdi" }), ["b", "c", "d", "e", "f"]);
check("q case-insensitive", ids({ q: "SPORTAGE" }), ["d"]);
check("q no match", ids({ q: "zzzz" }), []);

// --- combinations ----------------------------------------------------------
check("audi + automatic", ids({ make: "Audi", transmission: "automatic" }), ["a", "f"]);
check("euro6 + awd", ids({ euro: "euro6", drivetrain: "awd" }), ["f"]);
check("diesel + manual + maxPrice", ids({ fuel: "diesel", transmission: "manual", maxPrice: "13000" }), ["e"]);
check("contradictory filters", ids({ make: "Kia", fuel: "electric" }), []);

// --- empty filters return everything ---------------------------------------
check("no filters", ids({}), ["a", "b", "c", "d", "e", "f"]);
check("blank strings ignored", ids({ make: "", fuel: "", body: "", q: "  " }),
  ["a", "b", "c", "d", "e", "f"]);

console.log("Sorting\n-------");

const order = (s: Parameters<typeof sortCars>[1]) => sortCars(cars, s).map((c) => c.id);
// available (a,b,c,d) first, then reserved (f), then sold (e)
check("newest: available first, reserved, sold last",
  order("newest"), ["a", "b", "c", "d", "f", "e"]);
check("price_asc within status", order("price_asc"), ["a", "d", "b", "c", "f", "e"]);
check("price_desc within status", order("price_desc"), ["c", "b", "d", "a", "f", "e"]);
check("year_desc within status", order("year_desc"), ["c", "b", "d", "a", "f", "e"]);
check("mileage_asc within status", order("mileage_asc"), ["c", "b", "a", "d", "f", "e"]);
check("sort does not drop cars", order("price_asc").length, cars.length);

check("parseSort valid", parseSort("price_desc"), "price_desc");
check("parseSort garbage falls back", parseSort("; drop table"), "newest");
check("parseSort undefined falls back", parseSort(undefined), "newest");

console.log("Paging\n------");
check("PAGE_SIZE", PAGE_SIZE, 12);
check("page clamped low", parsePage("0", 5), 1);
check("page clamped high", parsePage("99", 5), 5);
check("page garbage", parsePage("abc", 5), 1);
check("page negative", parsePage("-3", 5), 1);
check("page valid", parsePage("3", 5), 3);

console.log("Helpers\n-------");
check("one() trims", one("  Audi "), "Audi");
check("one() blank -> undefined", one("   "), undefined);
check("one() takes first of array", one(["a", "b"]), "a");
check("many() splits csv", many("a,b , c"), ["a", "b", "c"]);
check("many() array", many(["a", "b"]), ["a", "b"]);
check("many() undefined", many(undefined), []);
check("activeFilterCount", activeFilterCount({ make: "Audi", fuel: ["diesel"], q: "" }), 2);
check("activeFilterCount empty", activeFilterCount({}), 0);
check("modelsByMake", modelsByMake(cars).Audi, ["A4", "A5"]);
check("isNewInStock fresh", isNewInStock({ created_at: new Date().toISOString() }), true);
check("isNewInStock old",
  isNewInStock({ created_at: new Date(Date.now() - 40 * day).toISOString() }), false);

console.log("\n================================");
if (failures.length === 0) {
  console.log(`ALL ${passed} CHECKS PASSED`);
} else {
  console.log(`${passed} passed, ${failures.length} FAILED:\n`);
  for (const f of failures) console.log("  x " + f);
  process.exitCode = 1;
}
