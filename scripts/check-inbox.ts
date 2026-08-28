/**
 * Checks the rules that decide which `offers` rows belong in the admin inbox.
 *
 * Every public form writes into one table, so a wrong predicate here either
 * hides a customer's message or lets a sell request be deleted from the wrong
 * screen. Runs against synthetic rows — the production database is never
 * touched.
 *
 *   npm run check:inbox
 */
import {
  INBOX_SELECT,
  LEGACY_SELL_REQUEST_MARKER,
  isInboxRow,
  isSellRequestMessage,
  stripSellRequestMarker,
  toInboxMessage,
  type InboxRow,
} from "../lib/inbox";
import {
  CONTACT_MESSAGE_MARKER,
  SELL_REQUEST_MARKER,
} from "../lib/contact";

let passed = 0;
const failures: string[] = [];

function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed++;
    console.log(`  ok  ${label}`);
  } else {
    failures.push(`${label}\n      expected ${e}\n      actual   ${a}`);
    console.log(`  X   ${label}`);
  }
}

const base = {
  buyer_name: "Test Person",
  buyer_phone: "+40700000000",
  buyer_email: "test@example.com",
  created_at: "2026-08-28T10:00:00.000Z",
  auction_id: null,
  car_id: null,
  car: null,
} satisfies Omit<InboxRow, "id" | "message">;

const contactMessage: InboxRow = {
  ...base,
  id: "1",
  buyer_email: CONTACT_MESSAGE_MARKER,
  message: "Salut, aveți program sâmbătă?",
};

const carInquiry: InboxRow = {
  ...base,
  id: "2",
  car_id: "car-1",
  car: { id: "car-1", title: "MERCEDES-BENZ ML 300 CDI" },
  message: "Mai este disponibilă?",
};

const carInquiryNoMessage: InboxRow = {
  ...base,
  id: "3",
  car_id: "car-1",
  car: { id: "car-1", title: "MERCEDES-BENZ ML 300 CDI" },
  message: null,
};

const sellRequest: InboxRow = {
  ...base,
  id: "4",
  message: `${SELL_REQUEST_MARKER} VW Passat, 2010, 250000 km`,
};

const legacySellRequest: InboxRow = {
  ...base,
  id: "5",
  message: `${LEGACY_SELL_REQUEST_MARKER} VW Passat, 2010`,
};

const auctionOffer: InboxRow = {
  ...base,
  id: "6",
  auction_id: "auction-1",
  message: "Ofer 5000",
};

console.log("\nInbox membership\n");
check("contact message is an inbox row", isInboxRow(contactMessage), true);
check("car inquiry is an inbox row", isInboxRow(carInquiry), true);
check("car inquiry without a message still counts", isInboxRow(carInquiryNoMessage), true);
check("sell request is NOT an inbox row", isInboxRow(sellRequest), false);
check("legacy sell request is NOT an inbox row", isInboxRow(legacySellRequest), false);
check("auction offer is NOT an inbox row", isInboxRow(auctionOffer), false);
check(
  "an auction row whose message looks like a sell request is still excluded",
  isInboxRow({ ...auctionOffer, message: `${SELL_REQUEST_MARKER} x` }),
  false
);

console.log("\nSell-request markers\n");
check("new marker detected", isSellRequestMessage(sellRequest.message), true);
check("legacy marker detected", isSellRequestMessage(legacySellRequest.message), true);
check("null message is not a sell request", isSellRequestMessage(null), false);
check("ordinary message is not a sell request", isSellRequestMessage("Bună ziua"), false);
check(
  "marker is stripped for display",
  stripSellRequestMarker(sellRequest.message!),
  "VW Passat, 2010, 250000 km"
);
check(
  "legacy marker is stripped for display",
  stripSellRequestMarker(legacySellRequest.message!),
  "VW Passat, 2010"
);
check("a message without a marker is left alone", stripSellRequestMarker("Bună"), "Bună");

console.log("\nRow -> inbox message\n");
const contactView = toInboxMessage(contactMessage);
check("contact row is tagged as contact", contactView.source, "contact");
check("contact marker never reaches the screen", contactView.email, "—");
check("contact phone is kept", contactView.phone, "+40700000000");
check("contact row has no car", contactView.car, null);

const inquiryView = toInboxMessage(carInquiry);
check("car row is tagged as an inquiry", inquiryView.source, "inquiry");
check("inquiry keeps its e-mail", inquiryView.email, "test@example.com");
check("inquiry carries the car it is about", inquiryView.car, {
  id: "car-1",
  title: "MERCEDES-BENZ ML 300 CDI",
});
check("a null message renders as empty, not 'null'", toInboxMessage(carInquiryNoMessage).message, "");
check(
  "a contact row that used the phone marker also hides it",
  toInboxMessage({
    ...contactMessage,
    buyer_email: "someone@example.com",
    buyer_phone: CONTACT_MESSAGE_MARKER,
  }).phone,
  "—"
);

console.log("\nQuery shape\n");
check("select asks for the car relation", INBOX_SELECT.includes("car:cars(id, title)"), true);
check("select asks for auction_id so it can be excluded", INBOX_SELECT.includes("auction_id"), true);

console.log("\n================================");
if (failures.length === 0) {
  console.log(`ALL ${passed} CHECKS PASSED`);
} else {
  console.log(`${passed} passed, ${failures.length} FAILED:\n`);
  for (const f of failures) console.log("  x " + f);
  process.exitCode = 1;
}
