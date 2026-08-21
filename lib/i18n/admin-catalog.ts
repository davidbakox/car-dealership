// Hungarian labels for the catalogue attributes shown in the ADMIN car form.
// The admin panel is Hungarian-only and does not run next-intl, so the public
// site's labels (messages/ro.json + messages/hu.json) can't be reused here —
// these are the admin-side mirror of those files. Every key in CAR_FEATURES /
// CAR_COLORS must have an entry, otherwise the checkbox renders unlabelled.

export const BODY_LABELS: Record<string, string> = {
  sedan: "Szedán",
  suv: "SUV",
  wagon: "Kombi",
  hatchback: "Ferdehátú",
  coupe: "Kupé",
  van: "Haszongépjármű",
  minibus: "Kisbusz",
};

export const DRIVETRAIN_LABELS: Record<string, string> = {
  fwd: "Első kerék (2x4)",
  rwd: "Hátsó kerék (2x4)",
  awd: "Összkerék (4x4)",
};

export const COLOR_LABELS: Record<string, string> = {
  white: "Fehér",
  black: "Fekete",
  silver: "Ezüst",
  gray: "Szürke",
  blue: "Kék",
  red: "Piros",
  bordeaux: "Bordó",
  green: "Zöld",
  brown: "Barna",
  beige: "Bézs",
  yellow: "Sárga",
  orange: "Narancssárga",
  gold: "Arany",
  purple: "Lila",
  other: "Egyéb",
};

export const FEATURE_GROUP_LABELS: Record<string, string> = {
  safety: "Biztonság és asszisztensek",
  comfort: "Kényelem",
  multimedia: "Multimédia",
  exterior: "Külső",
  condition: "Dokumentumok és állapot",
};

export const FEATURE_LABELS: Record<string, string> = {
  // biztonság és asszisztensek
  abs_esp_airbag: "ABS / ESP / Légzsák",
  isofix: "ISOFIX",
  parking_sensors: "Tolatóradar (hátsó)",
  parking_sensors_front: "Parkolóradar (első)",
  rear_camera: "Tolatókamera",
  camera_360: "360°-os kamera",
  park_assist: "Parkolóasszisztens (automata)",
  blind_spot_assist: "Holttér-figyelő",
  lane_assist: "Sávtartó asszisztens",
  traffic_sign_recognition: "Táblafelismerés",
  emergency_brake_assist: "Vészfék-asszisztens",
  adaptive_cruise_control: "Adaptív tempomat",
  tire_pressure_monitor: "Guminyomás-ellenőrzés",
  hill_start_assist: "Hegymeneti elindulássegítő",
  alarm: "Riasztó",
  central_locking: "Központi zár",
  immobilizer: "Indításgátló",
  // kényelem
  air_conditioning: "Klíma (manuális)",
  climate_control: "Digitális klíma",
  multizone_climate: "Többzónás klíma",
  heated_seats: "Fűthető ülések",
  ventilated_seats: "Szellőztetett ülések",
  electric_seats: "Elektromos ülésállítás",
  memory_seats: "Memóriás ülések",
  leather_seats: "Bőrbelső",
  heated_steering_wheel: "Fűthető kormány",
  electric_mirrors: "Elektromos tükrök",
  heated_mirrors: "Fűthető tükrök",
  folding_mirrors: "Behajtható tükrök",
  electric_windows: "Elektromos ablakok",
  cruise_control: "Tempomat",
  keyless_entry: "Kulcs nélküli nyitás",
  keyless_start: "Indítógomb (Start/Stop)",
  rain_sensor: "Esőszenzor",
  light_sensor: "Fényszenzor",
  auto_dimming_mirror: "Automata sötétedő tükör",
  electric_tailgate: "Elektromos csomagtérajtó",
  auxiliary_heating: "Állófűtés (Webasto)",
  // multimédia
  navigation: "Navigáció",
  bluetooth: "Bluetooth",
  onboard_computer: "Fedélzeti computer",
  steering_controls: "Kormánykerék-vezérlés",
  touchscreen: "Érintőképernyő",
  carplay_androidauto: "Apple CarPlay / Android Auto",
  usb_port: "USB / AUX csatlakozó",
  cd_player: "Rádió / CD",
  premium_sound: "Prémium hangrendszer",
  wireless_charging: "Vezeték nélküli töltő",
  head_up_display: "Head-up display",
  digital_cockpit: "Digitális műszerfal",
  // külső
  led_xenon: "LED / Xenon fényszóró",
  adaptive_lights: "Adaptív (kanyarkövető) fényszóró",
  fog_lights: "Ködlámpa",
  daytime_running_lights: "Nappali menetfény",
  alloy_wheels: "Könnyűfém felni",
  tow_bar: "Vonóhorog",
  sunroof: "Tetőablak",
  panoramic_roof: "Panorámatető",
  roof_rails: "Tetősín",
  tinted_windows: "Sötétített üvegek",
  metallic_paint: "Metálfény",
  winter_tires: "Téli gumi szettel",
  spare_wheel: "Pótkerék",
  // dokumentumok és állapot
  service_book: "Szervizkönyv",
  first_owner: "Első tulajdonos",
  accident_free: "Sérülésmentes",
  non_smoker: "Nemdohányzó autó",
  registered_ro: "Forgalomba helyezve (RO)",
  valid_itp: "Érvényes műszaki (ITP)",
};
