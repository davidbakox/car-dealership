import {
  CUI,
  EMAIL,
  EUID,
  INCORPORATION_DATE,
  LEGAL_NAME,
  PHONE,
  PRIMARY_CONTACT_NAME,
  REGISTERED_OFFICE,
  SECONDARY_CONTACT_NAME,
  SHARE_CAPITAL,
  SECONDARY_PHONE,
  TRADE_REGISTER_NUMBER,
} from "@/lib/contact";

export type LegalLink = {
  label: string;
  href: string;
};

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  // Trailing notes that must read AFTER a list rather than before it.
  footnotes?: string[];
  links?: LegalLink[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  warning?: string;
};

export type LegalDocumentContent = {
  title: string;
  description: string;
  lead: string;
  updated: string;
  settingsAction?: string;
  sections: LegalSection[];
};

type Locale = "ro" | "hu";
type DocumentKey = "legal" | "privacy" | "cookies";

const commonLinks = {
  anpcComplaint: "https://eservicii.anpc.ro/",
  anpcSal: "https://reclamatiisal.anpc.ro/",
  anspdcp: "https://www.dataprotection.ro/",
  googlePrivacy: "https://policies.google.com/privacy",
  googleCookies: "https://policies.google.com/technologies/cookies",
  law365: "https://legislatie.just.ro/Public/DetaliiDocument/77218",
  law506: "https://legislatie.just.ro/Public/DetaliiDocument/56973",
  oug140: "https://legislatie.just.ro/Public/DetaliiDocument/250044",
};

const ro: Record<DocumentKey, LegalDocumentContent> = {
  legal: {
    title: "Informații legale",
    description:
      "Datele operatorului Dennis Cars Carei, condițiile de utilizare a site-ului și informații pentru consumatori.",
    lead:
      "Această pagină explică cine administrează site-ul, ce rol au anunțurile auto și ce drepturi au consumatorii.",
    updated: "Ultima actualizare: 28 august 2026",
    sections: [
      {
        title: "1. Identificarea operatorului",
        bullets: [
          "Denumire comercială: Dennis Cars Carei",
          `Denumire juridică: ${LEGAL_NAME}`,
          `CUI/CIF: ${CUI}`,
          `Nr. Registrul Comerțului: ${TRADE_REGISTER_NUMBER}`,
          `EUID: ${EUID}`,
          ...(SHARE_CAPITAL
            ? [`Capital social subscris și vărsat: ${SHARE_CAPITAL}`]
            : []),
          `Data înființării: ${INCORPORATION_DATE}`,
          `Sediu social: ${REGISTERED_OFFICE}`,
          "Punct de lucru: Str. Mihai Viteazu nr. 57, Carei, jud. Satu Mare, România",
          `Telefon – ${PRIMARY_CONTACT_NAME}: ${PHONE}`,
          `Telefon – ${SECONDARY_CONTACT_NAME}: ${SECONDARY_PHONE}`,
          `E-mail: ${EMAIL}`,
        ],
      },
      {
        title: "2. Rolul site-ului",
        paragraphs: [
          "Site-ul prezintă autoturisme, servicii de consignație, posibilități de schimb/buy-back și informații de contact. Trimiterea unui formular reprezintă doar o solicitare de contact sau o cerere preliminară.",
          "Site-ul nu permite în prezent cumpărarea, rezervarea cu plată sau încheierea integrală online a unui contract. Un contract se încheie numai după verificarea mașinii, confirmarea condițiilor și semnarea documentelor aplicabile.",
        ],
      },
      {
        title: "3. Anunțuri, disponibilitate și prețuri",
        paragraphs: [
          "Fotografiile, descrierile, kilometrajul, dotările, prețul și starea de disponibilitate sunt publicate cu scop informativ. Informațiile esențiale se confirmă înainte de semnarea contractului.",
          "Prețul final, moneda, regimul TVA, eventualele costuri suplimentare și condițiile de finanțare trebuie comunicate clar pentru fiecare ofertă. O eroare evidentă de redactare sau o actualizare întârziată a stocului nu creează automat obligația de vânzare.",
        ],
      },
      {
        title: "4. Garanția legală pentru autoturisme second-hand",
        paragraphs: [
          "Pentru vânzările către consumatori se aplică garanția legală de conformitate prevăzută de OUG nr. 140/2021. Pentru bunurile de ocazie, perioada poate fi redusă prin acord la minimum un an de la livrare.",
          "Mențiunea „12 luni garanție” de pe site nu limitează drepturile legale ale consumatorului. Acoperirea exactă, excluderile permise de lege și procedura de remediere trebuie să apară în contract și în certificatul de garanție.",
        ],
        links: [
          {
            label: "OUG nr. 140/2021 – Portal Legislativ",
            href: commonLinks.oug140,
          },
        ],
      },
      {
        title: "5. Consignație, buy-back și finanțare",
        paragraphs: [
          "Cererea de consignație nu constituie contract. Comisionul, taxa de intermediere, durata, obligațiile părților și condițiile de încetare vor fi stabilite în contractul de consignație.",
          "Finanțarea este oferită de partenerul financiar indicat pe site, după propria analiză și propriile condiții. Dennis Cars Carei nu garantează aprobarea unei finanțări.",
        ],
      },
      {
        title: "6. Reclamații și soluționarea alternativă a litigiilor",
        paragraphs: [
          "Pentru rezolvarea unei probleme, consumatorul este încurajat să contacteze mai întâi operatorul. Acest demers nu limitează dreptul de a sesiza autoritățile sau instanțele competente.",
          "Platforma europeană SOL/ODR nu mai este indicată deoarece a fost închisă. Pentru România sunt disponibile portalul ANPC și platforma națională SAL.",
        ],
        links: [
          {
            label: "Depune o reclamație la ANPC",
            href: commonLinks.anpcComplaint,
          },
          {
            label: "Soluționare alternativă a litigiilor – SAL",
            href: commonLinks.anpcSal,
          },
        ],
      },
      {
        title: "7. Proprietate intelectuală și utilizarea site-ului",
        paragraphs: [
          "Textele, elementele grafice, identitatea vizuală și fotografiile sunt protejate de legislația aplicabilă. Copierea sau reutilizarea lor comercială necesită acordul titularului drepturilor, cu excepția utilizărilor permise de lege.",
          "Este interzisă folosirea site-ului pentru transmiterea de conținut ilegal, tentative de acces neautorizat, perturbarea serviciului sau colectarea automată abuzivă de date.",
        ],
      },
      {
        title: "8. Legea aplicabilă",
        paragraphs: [
          "Site-ul și relațiile cu consumatorii sunt guvernate de legea română și de normele obligatorii ale Uniunii Europene aplicabile. Nicio prevedere de pe această pagină nu poate restrânge drepturile imperative ale consumatorilor.",
        ],
        links: [
          {
            label: "Legea nr. 365/2002 privind comerțul electronic",
            href: commonLinks.law365,
          },
        ],
      },
    ],
  },
  privacy: {
    title: "Politica de confidențialitate",
    description:
      "Cum colectează, folosește, păstrează și protejează Dennis Cars Carei datele cu caracter personal.",
    lead:
      "Politica descrie prelucrarea datelor trimise prin formularele site-ului și datele tehnice necesare funcționării sale.",
    updated: "Ultima actualizare: 29 august 2026",
    sections: [
      {
        title: "1. Operatorul datelor",
        bullets: [
          `Operator: ${LEGAL_NAME}, denumire comercială Dennis Cars Carei`,
          `CUI/CIF: ${CUI}`,
          `Sediu social și adresă de corespondență: ${REGISTERED_OFFICE}`,
          "Punct de lucru: Str. Mihai Viteazu nr. 57, Carei, jud. Satu Mare, România",
          `Telefon – ${PRIMARY_CONTACT_NAME}: ${PHONE}`,
          `Telefon – ${SECONDARY_CONTACT_NAME}: ${SECONDARY_PHONE}`,
          `E-mail pentru protecția datelor: ${EMAIL}`,
        ],
        footnotes: [
          "Operatorul nu are obligația de a desemna un responsabil cu protecția datelor (DPO) în sensul art. 37 GDPR și nu a desemnat unul. Orice cerere privind datele personale se transmite la datele de contact de mai sus și este tratată de conducerea societății.",
        ],
      },
      {
        title: "2. Datele pe care le prelucrăm",
        bullets: [
          "Formular de contact: nume, telefon și conținutul mesajului.",
          "Cerere despre o mașină: nume, telefon, e-mail, mașina aleasă și mesajul opțional.",
          "Cerere de consignație: nume, telefon, e-mail, marca, modelul, anul, kilometrajul și detaliile transmise despre autoturism.",
          "Date tehnice: adresă IP, data și ora accesului, tipul dispozitivului/browserului, paginile solicitate și jurnale de securitate, în măsura în care sunt generate de furnizorii de hosting.",
          "Preferințe: limba selectată și alegerea privind conținutul extern.",
        ],
        footnotes: [
          "Completarea formularelor este voluntară, iar site-ul nu solicită date care nu sunt necesare. Câmpurile marcate ca obligatorii – de regulă numele și un mijloc de contact – trebuie totuși completate pentru a putea răspunde: fără ele solicitarea nu poate fi înregistrată sau soluționată. Câmpurile opționale pot rămâne necompletate, fără nicio consecință.",
          "La încheierea unui contract de vânzare, a unui contract de consignație sau la emiterea unui certificat de garanție, furnizarea datelor de identificare devine o cerință contractuală și legală (obligații fiscale și contabile). În lipsa acestora contractul nu poate fi încheiat sau executat.",
        ],
      },
      {
        title: "3. Scopuri și temeiuri juridice",
        bullets: [
          "Răspuns la solicitări, programarea unei vizionări și demersuri precontractuale – art. 6 alin. (1) lit. b) GDPR.",
          "Gestionarea vânzării, consignației, garanțiilor și obligațiilor fiscale/contabile – executarea contractului și obligații legale, art. 6 alin. (1) lit. b) și c) GDPR.",
          "Securitatea site-ului, prevenirea abuzurilor și apărarea drepturilor – interes legitim, art. 6 alin. (1) lit. f) GDPR.",
          "Încărcarea Google Maps și a tehnologiilor terțe asociate – consimțământ, art. 6 alin. (1) lit. a) GDPR și art. 4 alin. (5) din Legea nr. 506/2004.",
        ],
      },
      {
        title: "4. Fotografii cu clienți și dreptul la propria imagine",
        paragraphs: [
          "Pe site sunt publicate fotografii realizate la predarea autoturismelor, în care pot apărea persoane identificabile. O fotografie în care o persoană poate fi recunoscută este dată cu caracter personal, iar publicarea ei pe site este o prelucrare distinctă, având ca scop prezentarea activității societății.",
          "Temeiul este consimțământul persoanei fotografiate – art. 6 alin. (1) lit. a) GDPR – coroborat cu dreptul la propria imagine prevăzut de art. 73 din Codul civil. Fotografiile sunt publicate numai cu acordul persoanelor care apar în ele, iar în cazul minorilor este necesar acordul părintelui sau al reprezentantului legal.",
          "Consimțământul poate fi retras oricând, fără justificare și fără costuri. La cerere, fotografia este eliminată de pe site, iar elementele care permit identificarea – chipul sau numărul de înmatriculare – pot fi acoperite în locul eliminării, dacă persoana preferă această variantă. Retragerea nu afectează legalitatea publicării anterioare.",
        ],
        footnotes: [
          "Numărul de înmatriculare vizibil într-o fotografie este, la rândul său, dată cu caracter personal atunci când permite identificarea proprietarului. Solicitarea de acoperire sau de eliminare se transmite la datele de contact de la punctul 1 și este rezolvată în cel mai scurt timp posibil.",
        ],
      },
      {
        title: "5. Destinatari și furnizori",
        paragraphs: [
          "Accesul este limitat la persoanele care gestionează solicitările și administrarea site-ului. Datele pot fi prelucrate de furnizori IT contractați, inclusiv servicii de hosting, bază de date, stocare, securitate și mentenanță.",
          "Furnizorii utilizați în prezent sunt: Supabase (baza de date în care se salvează mesajele din formulare și autentificarea contului de administrare), Cloudflare (găzduirea site-ului, rețeaua de livrare și stocarea fotografiilor auto în Cloudflare R2) și Google Ireland Limited (exclusiv harta încorporată). Fotografiile mașinilor sunt livrate din infrastructura Cloudflare a operatorului, fără cookie-uri, ca parte necesară a funcționării site-ului.",
          "Google primește date direct de la browser numai dacă utilizatorul permite conținutul extern și harta este efectiv încărcată. Formularele, catalogul și restul site-ului funcționează fără nicio legătură cu Google.",
          "Datele pot fi comunicate autorităților, consultanților sau instanțelor atunci când există o obligație legală ori este necesar pentru apărarea unui drept.",
        ],
      },
      {
        title: "6. Transferuri internaționale",
        paragraphs: [
          "Unii furnizori (în special Cloudflare, Supabase și Google) fac parte din grupuri cu sediul în Statele Unite și pot procesa date și în afara Spațiului Economic European. Transferurile se realizează pe baza mecanismelor recunoscute de GDPR – clauzele contractuale standard ale Comisiei Europene (art. 46 alin. (2) GDPR) și, acolo unde este aplicabilă, decizia de adecvare privind Cadrul UE-SUA pentru confidențialitatea datelor (art. 45 GDPR) – completate cu măsuri suplimentare atunci când sunt necesare.",
          "O copie a garanțiilor aplicabile poate fi solicitată la adresa de e-mail indicată la punctul 1.",
        ],
      },
      {
        title: "7. Perioade de păstrare",
        bullets: [
          "Solicitări fără contract: pe durata soluționării și cel mult 24 de luni de la ultima interacțiune, dacă nu există un litigiu sau o obligație legală de păstrare.",
          "Documente contractuale, contabile și de garanție: pe durata contractului și ulterior conform termenelor legale aplicabile.",
          "Jurnale tehnice și de securitate: numai pentru perioada necesară securității și diagnosticării, conform configurației furnizorilor.",
          "Preferința privind cookie-urile: maximum 6 luni de la ultima alegere, după care consimțământul este solicitat din nou; poate fi ștearsă oricând din browser sau modificată din butonul „Setări cookies”.",
        ],
      },
      {
        title: "8. Drepturile persoanei vizate",
        bullets: [
          "dreptul la informare și acces;",
          "dreptul la rectificare și, în cazurile prevăzute de lege, la ștergere;",
          "dreptul la restricționarea prelucrării și la portabilitate;",
          "dreptul de opoziție față de prelucrările bazate pe interes legitim;",
          "dreptul de a retrage consimțământul în orice moment, fără a afecta prelucrarea anterioară;",
          "dreptul de a depune o plângere la ANSPDCP sau de a se adresa instanței.",
        ],
        footnotes: [
          "Cererile se transmit la datele de contact de la punctul 1. Răspunsul se comunică fără întârzieri nejustificate și cel târziu în termen de o lună de la primire, termen care poate fi prelungit cu maximum două luni pentru cereri complexe, conform art. 12 GDPR. Exercitarea drepturilor este gratuită; pentru cereri vădit nefondate sau excesive se poate percepe o taxă rezonabilă ori se poate refuza soluționarea.",
          "Autoritatea de supraveghere competentă: Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), B-dul G-ral. Gheorghe Magheru nr. 28-30, sector 1, 010336 București, telefon +40 318 059 211, e-mail anspdcp@dataprotection.ro.",
        ],
        links: [
          {
            label: "Autoritatea Națională de Supraveghere – ANSPDCP",
            href: commonLinks.anspdcp,
          },
        ],
      },
      {
        title: "9. Decizii automate și minori",
        paragraphs: [
          "Site-ul nu ia decizii bazate exclusiv pe prelucrare automată și nu realizează profilare. Serviciile nu sunt adresate direct minorilor; persoanele sub 18 ani nu ar trebui să trimită formulare fără implicarea reprezentantului legal.",
        ],
      },
      {
        title: "10. Securitate și actualizări",
        paragraphs: [
          "Sunt utilizate măsuri tehnice și organizatorice rezonabile pentru limitarea accesului, protejarea conturilor administrative și transmiterea securizată a datelor. Niciun sistem nu poate garanta securitate absolută.",
          "Politica poate fi actualizată atunci când se schimbă serviciile, furnizorii sau cerințele legale. Data versiunii curente este afișată la începutul paginii.",
        ],
      },
    ],
  },
  cookies: {
    title: "Politica de cookies",
    description:
      "Cookie-urile și tehnologiile similare folosite de site-ul Dennis Cars Carei și modul de schimbare a preferințelor.",
    lead:
      "Site-ul folosește doar tehnologii necesare funcționării și, cu acordul utilizatorului, conținut extern Google Maps.",
    updated: "Ultima actualizare: 28 august 2026",
    settingsAction: "Deschide setările cookies",
    sections: [
      {
        title: "1. Ce sunt cookie-urile",
        paragraphs: [
          "Cookie-urile sunt fișiere text mici salvate de browser. Tehnologii similare, precum local storage, pot memora preferințe pe dispozitiv. Legea aplicabilă tratează atât stocarea, cât și accesul la informații de pe dispozitiv.",
        ],
      },
      {
        title: "2. Ce folosește acest site",
        table: {
          headers: ["Tehnologie", "Furnizor", "Scop", "Durată"],
          rows: [
            [
              "NEXT_LOCALE",
              "Dennis Cars Carei",
              "Memorează limba română/maghiară aleasă și asigură rutarea corectă. Se creează doar dacă schimbi limba din comutatorul RO/HU. Necesar.",
              "1 an",
            ],
            [
              "dennis-cars-cookie-consent-v1 (local storage)",
              "Dennis Cars Carei",
              "Memorează dacă a fost permis conținutul extern. Necesar pentru respectarea alegerii.",
              "6 luni de la ultima alegere; apoi consimțământul este cerut din nou",
            ],
            [
              "Cookie-uri și identificatori Google Maps, de exemplu NID, _Secure-ENID sau SOCS",
              "Google",
              "Furnizarea hărții, securitate, preferințe și alte scopuri descrise de Google. Sunt posibile numai după acordul pentru conținut extern.",
              "Variabilă; conform politicilor Google (de regulă până la 13 luni pentru exemplele enumerate)",
            ],
          ],
        },
        footnotes: [
          "La prima vizită site-ul nu setează niciun cookie: limba nu este dedusă din browser, iar pagina se deschide implicit în română. Cookie-ul de limbă apare numai după ce alegi manual altă limbă.",
          "Înainte de consimțământ site-ul nu trimite cereri către servere terțe: fonturile sunt găzduite local, iar fotografiile mașinilor sunt livrate din infrastructura Cloudflare a operatorului, fără cookie-uri și fără identificatori de urmărire.",
          "Cookie-urile de sesiune ale zonei de administrare (Supabase Auth) se setează numai la autentificarea administratorului și nu apar niciodată la vizitatorii site-ului public.",
        ],
      },
      {
        title: "3. Conținut extern Google Maps",
        paragraphs: [
          "Harta este blocată implicit. Înainte de consimțământ, browserul nu încarcă iframe-ul Google Maps și nu trimite o solicitare către Google prin această funcție.",
          "După activare, Google poate primi adresa IP, informații despre dispozitiv/browser, pagina de proveniență și interacțiunile cu harta și poate folosi cookie-uri ori stocare locală conform propriilor politici.",
        ],
        links: [
          {
            label: "Politica de confidențialitate Google",
            href: commonLinks.googlePrivacy,
          },
          {
            label: "Cum folosește Google cookie-urile",
            href: commonLinks.googleCookies,
          },
        ],
      },
      {
        title: "4. Alegerea și retragerea consimțământului",
        paragraphs: [
          "La prima vizită poți accepta toate tehnologiile opționale, le poți refuza sau poți deschide setările. Refuzul nu afectează catalogul, formularele sau datele de contact; doar harta încorporată rămâne blocată.",
          "Alegerea poate fi schimbată în orice moment prin butonul „Setări cookies” din subsol, iar retragerea consimțământului este la fel de simplă ca acordarea lui. Ștergerea datelor site-ului din browser elimină și preferința salvată, iar bannerul va fi afișat din nou.",
          "Consimțământul nu este permanent: alegerea este memorată maximum 6 luni, după care bannerul reapare pentru reconfirmare. Până la o nouă alegere, tehnologiile opționale rămân dezactivate.",
        ],
      },
      {
        title: "5. Ce nu folosim în prezent",
        paragraphs: [
          "Codul actual nu include Google Analytics, Meta Pixel, instrumente de publicitate comportamentală sau cookie-uri de marketing proprii. Dacă astfel de servicii vor fi adăugate, politica și mecanismul de consimțământ trebuie actualizate înainte de activare.",
        ],
      },
      {
        title: "6. Temeiul legal și contact",
        paragraphs: [
          "Tehnologiile strict necesare sunt utilizate pentru furnizarea funcțiilor solicitate. Tehnologiile opționale se activează numai după consimțământ, potrivit art. 4 alin. (5)-(6) din Legea nr. 506/2004 și cerințelor GDPR.",
          `Pentru întrebări privind această politică, operatorul poate fi contactat la ${EMAIL}, la sediul social (${REGISTERED_OFFICE}), la ${PHONE} (${PRIMARY_CONTACT_NAME}) sau la ${SECONDARY_PHONE} (${SECONDARY_CONTACT_NAME}).`,
        ],
        links: [
          {
            label: "Legea nr. 506/2004 – Portal Legislativ",
            href: commonLinks.law506,
          },
        ],
      },
    ],
  },
};

const hu: Record<DocumentKey, LegalDocumentContent> = {
  legal: {
    title: "Jogi információk",
    description:
      "A Dennis Cars Carei üzemeltetői adatai, a weboldal használati feltételei és fogyasztói tájékoztatás.",
    lead:
      "Ez az oldal bemutatja a weboldal üzemeltetőjét, az autóhirdetések szerepét és a fogyasztók legfontosabb jogait.",
    updated: "Utolsó frissítés: 2026. augusztus 28.",
    sections: [
      {
        title: "1. Az üzemeltető azonosító adatai",
        bullets: [
          "Kereskedelmi név: Dennis Cars Carei",
          `Hivatalos cégnév: ${LEGAL_NAME}`,
          `Adószám (CUI/CIF): ${CUI}`,
          `Cégjegyzékszám: ${TRADE_REGISTER_NUMBER}`,
          `EUID: ${EUID}`,
          ...(SHARE_CAPITAL
            ? [`Jegyzett és befizetett tőke: ${SHARE_CAPITAL}`]
            : []),
          `Alapítás dátuma: ${INCORPORATION_DATE}`,
          `Székhely: ${REGISTERED_OFFICE}`,
          "Telephely: Mihai Viteazu utca 57., Nagykároly, Szatmár megye, Románia",
          `Telefon – ${PRIMARY_CONTACT_NAME}: ${PHONE}`,
          `Telefon – ${SECONDARY_CONTACT_NAME}: ${SECONDARY_PHONE}`,
          `E-mail: ${EMAIL}`,
        ],
      },
      {
        title: "2. A weboldal szerepe",
        paragraphs: [
          "A weboldal gépjárműveket, konszignációs értékesítést, csere/buy-back lehetőséget és elérhetőségeket mutat be. Egy űrlap elküldése kizárólag kapcsolatfelvételi vagy előzetes érdeklődési kérelem.",
          "Jelenleg nincs online fizetés, kötelező erejű foglalás vagy teljes körű online szerződéskötés. Szerződés csak a jármű ellenőrzése, a feltételek megerősítése és a szükséges dokumentumok aláírása után jön létre.",
        ],
      },
      {
        title: "3. Hirdetések, elérhetőség és árak",
        paragraphs: [
          "A fotók, leírások, futásteljesítmény, felszereltség, ár és készletállapot tájékoztató jellegű. A lényeges adatokat a szerződéskötés előtt meg kell erősíteni.",
          "A végső árat, pénznemet, áfakezelést, esetleges további költségeket és finanszírozási feltételeket minden ajánlatnál egyértelműen közölni kell. Nyilvánvaló elírás vagy késedelmes készletfrissítés önmagában nem keletkeztet eladási kötelezettséget.",
        ],
      },
      {
        title: "4. Használt autók törvényes kellékszavatossága",
        paragraphs: [
          "A fogyasztóknak történő értékesítésre a 140/2021. számú sürgősségi kormányrendelet szerinti megfelelőségi szabályok vonatkoznak. Használt terméknél a felek a törvényi időtartamot legalább egy évre csökkenthetik.",
          "A weboldalon jelzett „12 hónap garancia” nem korlátozza a fogyasztó kötelező törvényi jogait. A pontos fedezetet és az ügyintézést a szerződésnek és a garanciajegynek kell tartalmaznia.",
        ],
        links: [
          {
            label: "140/2021. sürgősségi kormányrendelet",
            href: commonLinks.oug140,
          },
        ],
      },
      {
        title: "5. Konszignáció, buy-back és finanszírozás",
        paragraphs: [
          "A konszignációs kérelem nem szerződés. A jutalékot, közvetítési díjat, időtartamot, a felek kötelezettségeit és a megszűnés feltételeit külön szerződés rögzíti.",
          "A finanszírozást a weboldalon jelzett pénzügyi partner saját bírálata és feltételei alapján nyújtja. A Dennis Cars Carei nem garantálja a finanszírozás jóváhagyását.",
        ],
      },
      {
        title: "6. Panaszok és alternatív vitarendezés",
        paragraphs: [
          "Probléma esetén a fogyasztó először közvetlenül az üzemeltetőhöz fordulhat. Ez nem korlátozza a hatósági vagy bírósági jogérvényesítést.",
          "A korábbi uniós ODR/SOL platform megszűnt. Romániában az ANPC panaszügyi portálja és a nemzeti SAL platform érhető el.",
        ],
        links: [
          {
            label: "Panasz benyújtása az ANPC-hez",
            href: commonLinks.anpcComplaint,
          },
          {
            label: "Alternatív vitarendezés – SAL",
            href: commonLinks.anpcSal,
          },
        ],
      },
      {
        title: "7. Szellemi tulajdon és használat",
        paragraphs: [
          "A szövegek, arculati elemek és fényképek jogi védelem alatt állnak. Kereskedelmi másolásuk vagy újrafelhasználásuk a jogosult engedélyéhez kötött, kivéve a törvény által megengedett eseteket.",
          "Tilos a weboldalt jogellenes tartalom továbbítására, jogosulatlan hozzáférési kísérletre, a szolgáltatás zavarására vagy visszaélésszerű automatikus adatgyűjtésre használni.",
        ],
      },
      {
        title: "8. Alkalmazandó jog",
        paragraphs: [
          "A weboldalra és a fogyasztói kapcsolatokra a román jog és az Európai Unió kötelező szabályai irányadók. Az itt szereplő rendelkezések nem korlátozhatják a fogyasztók kötelező jogait.",
        ],
        links: [
          {
            label: "A 365/2002. számú elektronikus kereskedelmi törvény",
            href: commonLinks.law365,
          },
        ],
      },
    ],
  },
  privacy: {
    title: "Adatvédelmi tájékoztató",
    description:
      "Hogyan gyűjti, használja, őrzi és védi a Dennis Cars Carei a személyes adatokat.",
    lead:
      "A tájékoztató az űrlapokon megadott adatok és a weboldal működéséhez szükséges technikai adatok kezelését ismerteti.",
    updated: "Utolsó frissítés: 2026. augusztus 29.",
    sections: [
      {
        title: "1. Adatkezelő",
        bullets: [
          `Adatkezelő: ${LEGAL_NAME}, kereskedelmi név: Dennis Cars Carei`,
          `Adószám (CUI/CIF): ${CUI}`,
          `Székhely és levelezési cím: ${REGISTERED_OFFICE}`,
          "Telephely: Mihai Viteazu utca 57., Nagykároly, Szatmár megye, Románia",
          `Telefon – ${PRIMARY_CONTACT_NAME}: ${PHONE}`,
          `Telefon – ${SECONDARY_CONTACT_NAME}: ${SECONDARY_PHONE}`,
          `Adatvédelmi e-mail: ${EMAIL}`,
        ],
        footnotes: [
          "Az adatkezelő a GDPR 37. cikke alapján nem köteles adatvédelmi tisztviselőt (DPO) kijelölni, és nem is jelölt ki. A személyes adatokkal kapcsolatos kéréseket a fenti elérhetőségekre kell küldeni, azokat a társaság vezetése intézi.",
        ],
      },
      {
        title: "2. A kezelt adatok",
        bullets: [
          "Kapcsolati űrlap: név, telefonszám és az üzenet tartalma.",
          "Autóval kapcsolatos érdeklődés: név, telefon, e-mail, kiválasztott jármű és opcionális üzenet.",
          "Konszignációs kérelem: név, telefon, e-mail, márka, modell, évjárat, futásteljesítmény és a járműről megadott adatok.",
          "Technikai adatok: IP-cím, hozzáférés ideje, eszköz/böngésző típusa, kért oldalak és biztonsági naplók, amennyiben ezeket a tárhelyszolgáltatók létrehozzák.",
          "Beállítások: választott nyelv és a külső tartalomra vonatkozó döntés.",
        ],
        footnotes: [
          "Az űrlapok kitöltése önkéntes, és a weboldal nem kér szükségtelen adatokat. A kötelezőként jelölt mezőket – jellemzően a nevet és egy elérhetőséget – azonban meg kell adni a válaszadáshoz: ezek nélkül a megkeresés nem rögzíthető és nem intézhető el. Az opcionális mezők következmény nélkül üresen hagyhatók.",
          "Adásvételi vagy konszignációs szerződés megkötésekor, illetve garanciajegy kiállításakor az azonosító adatok megadása szerződéses és jogszabályi (adózási, számviteli) követelmény. Ezek hiányában a szerződés nem köthető meg és nem teljesíthető.",
        ],
      },
      {
        title: "3. Célok és jogalapok",
        bullets: [
          "Érdeklődések megválaszolása, megtekintés egyeztetése és szerződéskötést megelőző lépések – GDPR 6. cikk (1) b).",
          "Értékesítés, konszignáció, garancia, adózási és számviteli kötelezettségek – szerződés és jogi kötelezettség, GDPR 6. cikk (1) b) és c).",
          "A weboldal biztonsága, visszaélések megelőzése és jogérvényesítés – jogos érdek, GDPR 6. cikk (1) f).",
          "Google Maps és kapcsolódó külső technológiák betöltése – hozzájárulás, GDPR 6. cikk (1) a) és a 506/2004. törvény 4. cikk (5).",
        ],
      },
      {
        title: "4. Ügyfélfotók és a képmáshoz való jog",
        paragraphs: [
          "A weboldalon az autók átadásakor készült fényképek is szerepelnek, amelyeken azonosítható személyek tűnhetnek fel. Az olyan fénykép, amelyen egy személy felismerhető, személyes adat, a közzététele pedig önálló adatkezelés, amelynek célja a társaság tevékenységének bemutatása.",
          "A jogalap a fényképen szereplő személy hozzájárulása – GDPR 6. cikk (1) a) –, a román polgári törvénykönyv 73. cikke szerinti képmáshoz való joggal együtt. Fényképet kizárólag a rajta szereplők hozzájárulásával teszünk közzé; kiskorú esetén a szülő vagy a törvényes képviselő hozzájárulása szükséges.",
          "A hozzájárulás bármikor, indokolás nélkül és díjmentesen visszavonható. Kérésre a fényképet eltávolítjuk a weboldalról, illetve – ha az érintett ezt választja – az azonosítást lehetővé tevő részleteket, az arcot vagy a rendszámot, eltávolítás helyett letakarjuk. A visszavonás a korábbi közzététel jogszerűségét nem érinti.",
        ],
        footnotes: [
          "A fényképen látható rendszám szintén személyes adatnak minősül, ha alkalmas a tulajdonos azonosítására. A letakarásra vagy eltávolításra irányuló kérést az 1. pontban megadott elérhetőségekre kell küldeni, és a lehető leghamarabb teljesítjük.",
        ],
      },
      {
        title: "5. Címzettek és szolgáltatók",
        paragraphs: [
          "Az adatokhoz csak a megkereséseket és a weboldalt kezelő személyek férhetnek hozzá. Szerződött IT-szolgáltatók tárhelyet, adatbázist, tárolást, biztonságot és karbantartást biztosíthatnak.",
          "A jelenleg igénybe vett szolgáltatók: Supabase (az űrlapokon érkező üzeneteket tároló adatbázis és az adminisztrátori fiók hitelesítése), Cloudflare (a weboldal kiszolgálása, a tartalomkézbesítő hálózat és az autófotók tárolása a Cloudflare R2-ben), valamint a Google Ireland Limited (kizárólag a beágyazott térkép). Az autók fotóit az üzemeltető Cloudflare-infrastruktúrája szolgálja ki, cookie nélkül, a weboldal működéséhez szükséges módon.",
          "A Google csak akkor kap adatot közvetlenül a böngészőtől, ha a felhasználó engedélyezi a külső tartalmat és a térkép ténylegesen betöltődik. Az űrlapok, a katalógus és a weboldal többi része a Google bevonása nélkül működik.",
          "Adatok hatóságoknak, tanácsadóknak vagy bíróságoknak jogi kötelezettség vagy jogérvényesítés esetén továbbíthatók.",
        ],
      },
      {
        title: "6. Nemzetközi adattovábbítás",
        paragraphs: [
          "Egyes szolgáltatók (különösen a Cloudflare, a Supabase és a Google) egyesült államokbeli székhelyű cégcsoport tagjai, és az EGT-n kívül is kezelhetnek adatokat. A továbbítás a GDPR által elismert garanciák alapján történik: az Európai Bizottság általános szerződéses feltételei (GDPR 46. cikk (2)) és – ahol alkalmazható – az EU–USA adatvédelmi keretre vonatkozó megfelelőségi határozat (GDPR 45. cikk) alapján, szükség esetén kiegészítő intézkedésekkel.",
          "Az alkalmazott garanciák másolata az 1. pontban megadott e-mail-címen kérhető.",
        ],
      },
      {
        title: "7. Megőrzési idők",
        bullets: [
          "Szerződés nélküli megkeresések: az ügy lezárásáig, legfeljebb az utolsó kapcsolatfelvételtől számított 24 hónapig, kivéve jogvita vagy kötelező megőrzés esetén.",
          "Szerződéses, számviteli és garanciális iratok: a szerződés alatt, majd a vonatkozó törvényi határidőkig.",
          "Technikai és biztonsági naplók: kizárólag a biztonsághoz és hibakereséshez szükséges ideig.",
          "Cookie-hozzájárulás: az utolsó választástól számított legfeljebb 6 hónapig, azt követően újra kérjük a hozzájárulást; a böngészőből bármikor törölhető, illetve a „Cookie-beállítások” gombbal módosítható.",
        ],
      },
      {
        title: "8. Az érintett jogai",
        bullets: [
          "tájékoztatáshoz és hozzáféréshez való jog;",
          "helyesbítéshez és törvényi feltételek esetén törléshez való jog;",
          "az adatkezelés korlátozásához és adathordozhatósághoz való jog;",
          "tiltakozás a jogos érdeken alapuló adatkezelés ellen;",
          "a hozzájárulás bármikori visszavonása a korábbi kezelés jogszerűségének érintése nélkül;",
          "panasz benyújtása az ANSPDCP-hez vagy bírósági jogorvoslat.",
        ],
        footnotes: [
          "A kérelmeket az 1. pontban megadott elérhetőségekre kell küldeni. A válasz indokolatlan késedelem nélkül, legkésőbb a kérelem beérkezésétől számított egy hónapon belül megérkezik; összetett kérelmeknél ez a határidő a GDPR 12. cikke szerint legfeljebb két hónappal meghosszabbítható. A jogok gyakorlása díjmentes; nyilvánvalóan megalapozatlan vagy túlzó kérelmeknél ésszerű díj számítható fel, vagy a teljesítés megtagadható.",
          "Az illetékes felügyeleti hatóság: Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), B-dul G-ral. Gheorghe Magheru nr. 28-30, sector 1, 010336 București, telefon: +40 318 059 211, e-mail: anspdcp@dataprotection.ro.",
        ],
        links: [
          {
            label: "Román adatvédelmi hatóság – ANSPDCP",
            href: commonLinks.anspdcp,
          },
        ],
      },
      {
        title: "9. Automatizált döntések és kiskorúak",
        paragraphs: [
          "A weboldal nem hoz kizárólag automatizált döntéseket és nem végez profilalkotást. A szolgáltatás nem kiskorúaknak szól; 18 év alatt űrlapot csak törvényes képviselő bevonásával küldjenek.",
        ],
      },
      {
        title: "10. Biztonság és módosítások",
        paragraphs: [
          "Ésszerű technikai és szervezési intézkedések védik az adminisztrációs hozzáférést és az adatok továbbítását. Teljes biztonság egyetlen rendszerben sem garantálható.",
          "A tájékoztató a szolgáltatások, szolgáltatók vagy jogszabályok változásakor frissülhet. A jelenlegi verzió dátuma az oldal tetején látható.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie-szabályzat",
    description:
      "A Dennis Cars Carei weboldalán használt cookie-k, hasonló technológiák és a beállítások módosítása.",
    lead:
      "A weboldal csak a működéshez szükséges technológiákat, továbbá hozzájárulás esetén külső Google Maps tartalmat használ.",
    updated: "Utolsó frissítés: 2026. augusztus 28.",
    settingsAction: "Cookie-beállítások megnyitása",
    sections: [
      {
        title: "1. Mik azok a cookie-k?",
        paragraphs: [
          "A cookie a böngésző által tárolt kis szövegfájl. Hasonló technológiák, például a local storage, beállításokat menthetnek az eszközön. A szabályok az eszközön történő tárolásra és az ott tárolt adatok elérésére is vonatkoznak.",
        ],
      },
      {
        title: "2. A weboldalon használt technológiák",
        table: {
          headers: ["Technológia", "Szolgáltató", "Cél", "Időtartam"],
          rows: [
            [
              "NEXT_LOCALE",
              "Dennis Cars Carei",
              "Megjegyzi a választott román/magyar nyelvet és biztosítja a helyes útvonalat. Csak akkor jön létre, ha a RO/HU kapcsolóval nyelvet váltasz. Szükséges.",
              "1 év",
            ],
            [
              "dennis-cars-cookie-consent-v1 (local storage)",
              "Dennis Cars Carei",
              "Megjegyzi a külső tartalom engedélyezését. A választás tiszteletben tartásához szükséges.",
              "Az utolsó választástól számított 6 hónapig; utána újra kérjük a hozzájárulást",
            ],
            [
              "Google Maps cookie-k és azonosítók, például NID, _Secure-ENID vagy SOCS",
              "Google",
              "Térkép, biztonság, beállítások és a Google által leírt további célok. Csak a külső tartalom engedélyezése után.",
              "Változó; a Google szabályzata szerint (a felsorolt példáknál jellemzően legfeljebb 13 hónap)",
            ],
          ],
        },
        footnotes: [
          "Az első látogatáskor a weboldal egyetlen cookie-t sem helyez el: a nyelvet nem a böngészőből következtetjük ki, az oldal alapértelmezetten románul nyílik meg. A nyelvi cookie csak akkor jön létre, ha kézzel másik nyelvet választasz.",
          "A hozzájárulás előtt a weboldal nem küld kérést harmadik fél szerverére: a betűtípusok helyben vannak tárolva, az autók fotóit pedig az üzemeltető Cloudflare-infrastruktúrája szolgálja ki, cookie és nyomkövető azonosító nélkül.",
          "Az adminisztrációs felület munkamenet-cookie-jai (Supabase Auth) kizárólag az adminisztrátor bejelentkezésekor jönnek létre, a nyilvános oldal látogatóinál soha.",
        ],
      },
      {
        title: "3. Külső Google Maps tartalom",
        paragraphs: [
          "A térkép alapértelmezetten blokkolt. Hozzájárulás előtt a böngésző nem tölti be a Google Maps iframe-et, így ezen a funkción keresztül nem küld kérést a Google felé.",
          "Engedélyezés után a Google megkaphatja az IP-címet, az eszköz/böngésző adatait, a hivatkozó oldalt és a térképpel végzett műveleteket, valamint saját szabályzata szerint cookie-kat vagy helyi tárolást használhat.",
        ],
        links: [
          {
            label: "Google adatvédelmi irányelvek",
            href: commonLinks.googlePrivacy,
          },
          {
            label: "A Google cookie-használata",
            href: commonLinks.googleCookies,
          },
        ],
      },
      {
        title: "4. Hozzájárulás és visszavonás",
        paragraphs: [
          "Első látogatáskor elfogadhatod vagy elutasíthatod az opcionális technológiákat, illetve megnyithatod a részletes beállításokat. Az elutasítás nem érinti a katalógust, az űrlapokat vagy az elérhetőségeket; csak a beágyazott térkép marad blokkolva.",
          "A választás bármikor módosítható a lábléc „Cookie-beállítások” gombjával, és a hozzájárulás visszavonása ugyanolyan egyszerű, mint a megadása. A webhelyadatok böngészőből történő törlése a mentett beállítást is eltávolítja, ezért a banner újra megjelenik.",
          "A hozzájárulás nem örökre szól: a választást legfeljebb 6 hónapig őrizzük meg, azután a banner újra megjelenik megerősítésre. Az új választásig az opcionális technológiák kikapcsolva maradnak.",
        ],
      },
      {
        title: "5. Amit jelenleg nem használunk",
        paragraphs: [
          "A jelenlegi kód nem tartalmaz Google Analytics szolgáltatást, Meta Pixelt, viselkedésalapú hirdetést vagy saját marketing-cookie-t. Ilyen szolgáltatás bevezetése előtt frissíteni kell a szabályzatot és a hozzájárulási rendszert.",
        ],
      },
      {
        title: "6. Jogalap és kapcsolat",
        paragraphs: [
          "A feltétlenül szükséges technológiák a kért funkciók biztosítására szolgálnak. Az opcionális technológiák csak hozzájárulás után aktiválódnak a 506/2004. törvény 4. cikk (5)-(6) és a GDPR alapján.",
          `A szabályzattal kapcsolatos kérdésekben az adatkezelő a ${EMAIL} e-mail-címen, a székhelyén (${REGISTERED_OFFICE}), a ${PHONE} (${PRIMARY_CONTACT_NAME}) vagy a ${SECONDARY_PHONE} (${SECONDARY_CONTACT_NAME}) telefonszámon érhető el.`,
        ],
        links: [
          {
            label: "506/2004. törvény – román jogszabálytár",
            href: commonLinks.law506,
          },
        ],
      },
    ],
  },
};

export function getLegalContent(
  locale: string,
  document: DocumentKey
): LegalDocumentContent {
  return (locale === "hu" ? hu : ro)[document];
}
