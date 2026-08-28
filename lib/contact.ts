// Single source of truth for business and legal contact details.
export const LEGAL_NAME = "DENISRENTCAR SRL";
export const TRADE_NAME = "Dennis Cars Carei";
export const CUI = "RO47863725";
export const TRADE_REGISTER_NUMBER = "J2023000311309";
export const EUID = "ROONRC.J2023000311309";
export const INCORPORATION_DATE = "22.03.2023";
// Legea 31/1990 art. 74 requires an SRL to publish its subscribed share capital
// alongside the other identification data. Fill this in from the company excerpt
// (certificat constatator) — e.g. "200 RON". While it is empty the bullet is
// simply omitted rather than showing an invented figure.
export const SHARE_CAPITAL: string = "500 RON";

export const REGISTERED_OFFICE =
  "Sat Căpleni nr. 99, cod poștal 447080, jud. Satu Mare, România";

export const PRIMARY_CONTACT_NAME = "Kovács Zsolt";
export const PHONE = "+40 757 058 890";
export const PHONE_HREF = "tel:+40757058890";

export const SECONDARY_CONTACT_NAME = "Kovács Nóra";
export const SECONDARY_PHONE = "+40 751 801 134";
export const SECONDARY_PHONE_HREF = "tel:+40751801134";
export const EMAIL = "kowacsnora@gmail.com";
export const EMAIL_HREF = "mailto:kowacsnora@gmail.com";

// City shown on car cards (single showroom — see CarCard).
export const CITY = "Carei";

export const ADDRESS =
  "Str. Mihai Viteazu nr. 57, Carei, jud. Satu Mare, România";

// Contact-form submissions share the existing leads table. This internal value
// distinguishes them from car inquiries and sell-your-car requests.
export const CONTACT_MESSAGE_MARKER = "__contact_form__";
export const SELL_REQUEST_MARKER = "__sell_request__";

// Google Maps embed (plain iframe, no API key required). Centered on the address.
export const MAPS_EMBED_SRC =
  "https://www.google.com/maps?q=" +
  encodeURIComponent("Strada Mihai Viteazu 57, Carei, Romania") +
  "&output=embed";
