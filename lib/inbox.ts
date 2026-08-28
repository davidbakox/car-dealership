import {
  CONTACT_MESSAGE_MARKER,
  SELL_REQUEST_MARKER,
} from "@/lib/contact";

// Every public form writes into the same `offers` table; what distinguishes the
// kinds is a marker or a foreign key, not a column. This module is the one
// place that decides which of those rows belong in the admin inbox, so the
// dashboard, the inbox page and the delete action can never disagree.
//
//   contact form  -> buyer_email (or buyer_phone) === CONTACT_MESSAGE_MARKER
//   car inquiry   -> car_id set, no auction, no amount
//   sell request  -> message starts with the sell marker  (own admin page)
//   auction offer -> auction_id set                       (own admin page)

// Sell requests submitted before the marker was introduced.
export const LEGACY_SELL_REQUEST_MARKER = "[VÂNZARE]";

export type InboxSource = "contact" | "inquiry";

export interface InboxRow {
  id: string;
  buyer_name: string;
  buyer_phone: string | null;
  buyer_email: string | null;
  message: string | null;
  created_at: string;
  auction_id?: string | null;
  car_id?: string | null;
  car?: { id: string; title: string } | null;
}

export interface InboxMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  created_at: string;
  car: { id: string; title: string } | null;
  source: InboxSource;
}

/** Columns the inbox needs, including the car a question was asked about. */
export const INBOX_SELECT =
  "id, buyer_name, buyer_phone, buyer_email, message, created_at, car_id, auction_id, car:cars(id, title)";

export function isSellRequestMessage(message: string | null): boolean {
  if (!message) return false;
  return (
    message.startsWith(SELL_REQUEST_MARKER) ||
    message.startsWith(LEGACY_SELL_REQUEST_MARKER)
  );
}

export function stripSellRequestMarker(message: string): string {
  if (message.startsWith(SELL_REQUEST_MARKER)) {
    return message.slice(SELL_REQUEST_MARKER.length).trim();
  }
  if (message.startsWith(LEGACY_SELL_REQUEST_MARKER)) {
    return message.slice(LEGACY_SELL_REQUEST_MARKER.length).trim();
  }
  return message;
}

/**
 * True for anything the owner should read as a message: a contact-page
 * submission or a question asked about a specific car. Sell requests and
 * auction offers are excluded — they have their own screens.
 */
export function isInboxRow(row: InboxRow): boolean {
  if (row.auction_id) return false;
  return !isSellRequestMessage(row.message);
}

export function toInboxMessage(row: InboxRow): InboxMessage {
  const isContact =
    row.buyer_email === CONTACT_MESSAGE_MARKER ||
    row.buyer_phone === CONTACT_MESSAGE_MARKER;
  const clean = (value: string | null) =>
    !value || value === CONTACT_MESSAGE_MARKER ? "—" : value;

  return {
    id: row.id,
    name: row.buyer_name,
    phone: clean(row.buyer_phone),
    email: clean(row.buyer_email),
    message: row.message ?? "",
    created_at: row.created_at,
    car: row.car ?? null,
    source: isContact ? "contact" : "inquiry",
  };
}
