import type { en } from "./en";

// Hungarian strings for the ADMIN panel (the public site uses next-intl instead).
// getDictionary() merges these over English, so any missing key falls back to EN.
// DEFAULT_LOCALE is "hu" (see config.ts) — the admin UI is Hungarian only.
export const hu: Partial<Record<keyof typeof en, string>> = {
  siteName: "Dennis Cars",

  // shell / nav
  admin_dashboard: "Vezérlőpult",
  admin_cars: "Autók",
  admin_auctions: "Árverések",
  admin_offers: "Ajánlatok / Érdeklődők",
  admin_sell_requests: "Konszignációs kérelmek",
  admin_messages: "Üzenetek",
  admin_logout: "Kijelentkezés",

  // login
  admin_login_title: "Admin bejelentkezés",
  admin_email: "Email",
  admin_password: "Jelszó",
  admin_signin: "Bejelentkezés",
  admin_signing_in: "Bejelentkezés…",
  admin_login_failed: "Hibás email vagy jelszó.",
  admin_rate_limited: "Túl sok próbálkozás. Próbáld később.",

  // dashboard
  stat_cars_listed: "Meghirdetett autók",
  stat_open_auctions: "Nyitott árverések",
  stat_new_offers: "Új ajánlatok (7 nap)",
  recent_offers: "Legutóbbi ajánlatok",
  recent_messages: "Legutóbbi üzenetek",
  recent_sell_requests: "Legutóbbi konszignációs kérelmek",

  // cars
  admin_new_car: "Új autó",
  admin_edit_car: "Autó szerkesztése",
  admin_delete: "Törlés",
  admin_save: "Mentés",
  admin_saving: "Mentés…",
  admin_cancel: "Mégse",
  admin_confirm_delete: "Véglegesen törlöd?",
  admin_images: "Képek",
  admin_upload_hint: "JPG, PNG, WebP vagy AVIF · max. 20 MB · automatikus optimalizálás · húzással átrendezhető",
  admin_mark_featured: "Kiemelt",
  admin_status: "Állapot",

  // auctions
  admin_new_auction: "Új árverés",
  admin_from_car: "Meglévő autóból",
  admin_standalone: "Önálló",
  admin_close_auction: "Árverés lezárása",
  admin_offers_for: "Ajánlatok",
  admin_sorted_by_amount: "Összeg szerint rendezve",

  // offers / messages
  admin_export_csv: "CSV export",
  col_date: "Dátum",
  col_name: "Név",
  col_phone: "Telefon",
  col_email: "Email",
  col_amount: "Összeg",
  col_item: "Autó / Árverés",
  col_message: "Üzenet",
  col_subject: "Tárgy",
  msg_from_contact_form: "Kapcsolati űrlap",
  msg_from_car_inquiry: "Autó iránti érdeklődés",
  admin_no_offers: "Még nincs bejegyzés.",
  admin_no_messages: "Még nincs üzenet.",
  admin_no_sell_requests: "Még nincs konszignációs kérelem.",

  // status + specs (used in admin lists/forms)
  status_available: "Elérhető",
  status_sold: "Eladva",
  status_reserved: "Lefoglalva",
  spec_year: "Évjárat",
  spec_mileage: "Futásteljesítmény",
  spec_fuel: "Üzemanyag",
  spec_transmission: "Váltó",
  spec_make: "Márka",
  spec_model: "Modell",
  car_description: "Leírás",
};
