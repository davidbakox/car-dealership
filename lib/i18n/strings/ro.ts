import type { en } from "./en";

// Romanian overrides. Any key omitted here falls back to English via
// getDictionary(). Values are typed as plain strings (not the English literal
// types) so translations can differ. Fill these in over time.
export const ro: Partial<Record<keyof typeof en, string>> = {
  tagline: "Mașini second-hand de calitate și licitații live",
  nav_home: "Acasă",
  nav_cars: "Mașini",
  nav_auctions: "Licitații",
  car_send_inquiry: "Trimite o cerere",
  auction_submit_offer: "Trimite ofertă",
  form_name: "Nume complet",
  form_phone: "Telefon",
  form_email: "Email",
  form_submit: "Trimite",
};
