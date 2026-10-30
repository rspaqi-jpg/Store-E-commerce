"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "de" | "en" | "nl";
const translations: Record<Language, Record<string, string>> = {
  de: {},
  en: {
    "Neuheiten":"New arrivals","Wohnen":"Home","Technik":"Technology","Weitere Produkte":"More products",
    "Produkte entdecken ↘":"Explore products ↘","Mehr Komfort.":"More comfort.","Weniger Kalk.":"Less limescale.",
    "Entdecke sorgfältig ausgewählte Produkte für Bad und Zuhause – mit klaren Produktinformationen, transparenten Preisen und einer unkomplizierten Bestellung.":"Discover carefully selected products for your bathroom and home, with clear product information, transparent prices and easy ordering.",
    "Ausgewählt für Bad und Zuhause":"Selected for your bathroom and home","Finde deine passende Lösung":"Find the right solution",
    "Produkte mit Rabatt":"Special offers","Frisch eingetroffen":"Just arrived","Komfort im Alltag":"Everyday comfort",
    "Intelligent ausgestattet":"Smart essentials","Ausgewählte Produkte für Bad und Dusche.":"Selected products for your bathroom and shower.",
    "Praktische Lösungen für dein Zuhause.":"Practical solutions for your home.","Nützliche Technik für den Alltag.":"Useful everyday technology.",
    "Weniger Kalk. Mehr Wohlgefühl.":"Less limescale. More comfort.","Klare Produktinformationen, transparente Preise und ein einfacher Bestellablauf.":"Clear product information, transparent prices and a simple ordering process.",
    "Angebote":"Offers","reguläre Preise":"regular prices","Weitere Produkte":"More products","Entdecke weitere praktische Produkte für Bad und Zuhause.":"Discover more practical products for your bathroom and home.",
    "Diese Produkte werden zum regulären Preis angeboten – ohne durchgestrichene Preise und ohne Rabatt-Badge.":"These products are offered at their regular price, without crossed-out prices or discount badges.",
    "Zurück zur Startseite":"Back to home","Heinze Filter · reguläre Preise":"Heinze Filter · regular prices",
    "Mit PayPal kaufen":"Buy with PayPal","Sicherer Checkout":"Secure checkout","Deine Lieferadresse":"Your delivery address",
    "E-Mail-Adresse":"Email address","Vor- und Nachname":"Full name","Straße und Hausnummer":"Street and house number",
    "Postleitzahl":"Postal code","Stadt":"City","Telefonnummer":"Phone number","Land":"Country",
    "Weiter zu PayPal":"Continue to PayPal","Prüfe die Daten und schließe die Zahlung sicher über PayPal ab.":"Review your details and complete your payment securely with PayPal.",
    "PayPal wird geöffnet…":"Opening PayPal…","Lieferdaten bearbeiten":"Edit delivery details","Schließen":"Close",
    "Zahlung erfolgreich. Vielen Dank für deine Bestellung!":"Payment successful. Thank you for your order!",
    "Die PayPal-Zahlung wurde abgebrochen. Du kannst es erneut versuchen.":"The PayPal payment was cancelled. You can try again.",
    "PayPal konnte nicht geladen werden. Bitte prüfe die Client ID Live in Vercel.":"PayPal could not be loaded. Please check the Live Client ID in Vercel.",
    "Filter-Duschkopf":"Filtered shower head","Moderner Duschkopf mit austauschbarem Filter.":"Modern shower head with replaceable filter.",
    "LED-Nachtlicht mit Bewegungssensor":"LED night light with motion sensor","Kompaktes LED-Licht für Flur und Badezimmer.":"Compact LED light for hallways and bathrooms.",
    "Organizer für das Badezimmer":"Bathroom organizer","Praktische Aufbewahrung für Bad und Dusche.":"Practical storage for your bathroom and shower.",
    "Hochdruck-Wasserpistole für Auto & Garten":"High-pressure water gun for car & garden",
    "Verstellbare Wasserstrahl-Düse für die Autowäsche, Terrasse und Garten. Einfach am Gartenschlauch anschließen und den Wasserstrahl passend einstellen.":"Adjustable water jet nozzle for washing cars, patios and gardens. Simply connect it to a garden hose and adjust the spray.",
    "Duschkopf mit Filter & Temperaturanzeige":"Shower head with filter & temperature display",
    "Automatischer Schaumseifenspender mit Display":"Automatic foaming soap dispenser with display",
    "USB-aufladbarer Sensor-Seifenspender für eine hygienische und komfortable Handwäsche.":"USB-rechargeable sensor soap dispenser for hygienic and convenient hand washing.",
    "Intelligenter Wasserhahn-Sensor":"Smart faucet sensor",
    "Berührungsloser Sensor-Aufsatz für den Wasserhahn – praktisch beim Händewaschen und zum Wassersparen.":"Touch-free faucet sensor attachment – practical for hand washing and helping save water.",
    "Kompakter Aktivkohle-Wasserfilter für den Wasserhahn":"Compact activated carbon faucet water filter",
    "Kompakter Auftisch-Wasserfilter mit Aktivkohle-Filterelement und Anschlusszubehör für den Küchenwasserhahn.":"Compact countertop water filter with activated carbon filter element and fittings for a kitchen faucet.",
    "Selbstreinigender Turbo-Duschkopf":"Self-cleaning turbo shower head",
    "Duschkopf mit mehreren Strahlarten, leicht zu reinigenden Silikondüsen und praktischer Wasserstopp-Taste.":"Shower head with multiple spray modes, easy-clean silicone nozzles and a convenient water-stop button.",
    "Flexibler Abflussreiniger für Bad & Küche":"Flexible drain cleaner for bathroom & kitchen",
    "Flexibler Reinigungshelfer zum Entfernen von Haaren und Ablagerungen in Waschbecken, Duschen und Bodenabläufen.":"Flexible cleaning tool for removing hair and buildup from sinks, showers and floor drains.",
    "Ersatz-Duschfilter für Handbrausen":"Replacement shower filter","Multifunktionaler Wasserhahn-Aufsatz":"Multifunctional faucet attachment","Duschkopf mit Filter & Temperaturanzeige":"Shower head with filter & temperature display"
  },
  nl: {
    "Neuheiten":"Nieuw","Wohnen":"Wonen","Technik":"Technologie","Weitere Produkte":"Meer producten",
    "Produkte entdecken ↘":"Bekijk producten ↘","Mehr Komfort.":"Meer comfort.","Weniger Kalk.":"Minder kalkaanslag.",
    "Entdecke sorgfältig ausgewählte Produkte für Bad und Zuhause – mit klaren Produktinformationen, transparenten Preisen und einer unkomplizierten Bestellung.":"Ontdek zorgvuldig geselecteerde producten voor badkamer en huis, met duidelijke productinformatie, transparante prijzen en eenvoudig bestellen.",
    "Ausgewählt für Bad und Zuhause":"Geselecteerd voor badkamer en huis","Finde deine passende Lösung":"Vind de juiste oplossing",
    "Produkte mit Rabatt":"Aanbiedingen","Frisch eingetroffen":"Nieuw binnen","Komfort im Alltag":"Comfort in het dagelijks leven",
    "Intelligent ausgestattet":"Slimme essentials","Ausgewählte Produkte für Bad und Dusche.":"Geselecteerde producten voor badkamer en douche.",
    "Praktische Lösungen für dein Zuhause.":"Praktische oplossingen voor je huis.","Nützliche Technik für den Alltag.":"Handige technologie voor elke dag.",
    "Weniger Kalk. Mehr Wohlgefühl.":"Minder kalkaanslag. Meer comfort.","Klare Produktinformationen, transparente Preise und ein einfacher Bestellablauf.":"Duidelijke productinformatie, transparante prijzen en eenvoudig bestellen.",
    "Angebote":"Aanbiedingen","reguläre Preise":"normale prijzen","Weitere Produkte":"Meer producten","Entdecke weitere praktische Produkte für Bad und Zuhause.":"Ontdek meer praktische producten voor badkamer en huis.",
    "Diese Produkte werden zum regulären Preis angeboten – ohne durchgestrichene Preise und ohne Rabatt-Badge.":"Deze producten worden aangeboden voor de normale prijs, zonder doorgestreepte prijzen of kortingslabel.",
    "Zurück zur Startseite":"Terug naar home","Heinze Filter · reguläre Preise":"Heinze Filter · normale prijzen",
    "Mit PayPal kaufen":"Kopen met PayPal","Sicherer Checkout":"Veilig afrekenen","Deine Lieferadresse":"Je bezorgadres",
    "E-Mail-Adresse":"E-mailadres","Vor- und Nachname":"Voor- en achternaam","Straße und Hausnummer":"Straat en huisnummer",
    "Postleitzahl":"Postcode","Stadt":"Plaats","Telefonnummer":"Telefoonnummer","Land":"Land",
    "Weiter zu PayPal":"Verder naar PayPal","Prüfe die Daten und schließe die Zahlung sicher über PayPal ab.":"Controleer je gegevens en rond de betaling veilig af via PayPal.",
    "PayPal wird geöffnet…":"PayPal wordt geopend…","Lieferdaten bearbeiten":"Bezorggegevens wijzigen","Schließen":"Sluiten",
    "Zahlung erfolgreich. Vielen Dank für deine Bestellung!":"Betaling geslaagd. Bedankt voor je bestelling!",
    "Die PayPal-Zahlung wurde abgebrochen. Du kannst es erneut versuchen.":"De PayPal-betaling is geannuleerd. Je kunt het opnieuw proberen.",
    "PayPal konnte nicht geladen werden. Bitte prüfe die Client ID Live in Vercel.":"PayPal kon niet worden geladen. Controleer de Live Client ID in Vercel.",
    "Filter-Duschkopf":"Douchekop met filter","Moderner Duschkopf mit austauschbarem Filter.":"Moderne douchekop met vervangbaar filter.",
    "LED-Nachtlicht mit Bewegungssensor":"LED-nachtlampje met bewegingssensor","Kompaktes LED-Licht für Flur und Badezimmer.":"Compact ledlampje voor hal en badkamer.",
    "Organizer für das Badezimmer":"Badkamerorganizer","Praktische Aufbewahrung für Bad und Dusche.":"Praktische opbergruimte voor badkamer en douche.",
    "Hochdruck-Wasserpistole für Auto & Garten":"Hogedrukspuit voor auto en tuin",
    "Verstellbare Wasserstrahl-Düse für die Autowäsche, Terrasse und Garten. Einfach am Gartenschlauch anschließen und den Wasserstrahl passend einstellen.":"Verstelbare waterstraal voor het wassen van auto's, terras en tuin. Sluit eenvoudig aan op de tuinslang en stel de straal naar wens in.",
    "Duschkopf mit Filter & Temperaturanzeige":"Douchekop met filter en temperatuurweergave",
    "Automatischer Schaumseifenspender mit Display":"Automatische schuimzeepdispenser met display",
    "USB-aufladbarer Sensor-Seifenspender für eine hygienische und komfortable Handwäsche.":"Oplaadbare zeepdispenser met sensor voor hygiënisch en comfortabel handen wassen.",
    "Intelligenter Wasserhahn-Sensor":"Slimme kraansensor",
    "Berührungsloser Sensor-Aufsatz für den Wasserhahn – praktisch beim Händewaschen und zum Wassersparen.":"Contactloze sensoropzet voor de kraan – handig bij handen wassen en om water te besparen.",
    "Kompakter Aktivkohle-Wasserfilter für den Wasserhahn":"Compacte actieve-koolstoffilter voor de kraan",
    "Kompakter Auftisch-Wasserfilter mit Aktivkohle-Filterelement und Anschlusszubehör für den Küchenwasserhahn.":"Compact tafelmodel waterfilter met actieve-koolstoffilter en aansluitaccessoires voor de keukenkraan.",
    "Selbstreinigender Turbo-Duschkopf":"Zelfreinigende turbo-douchekop",
    "Duschkopf mit mehreren Strahlarten, leicht zu reinigenden Silikondüsen und praktischer Wasserstopp-Taste.":"Douchekop met meerdere straalstanden, eenvoudig te reinigen siliconen sproeigaatjes en handige waterstopknop.",
    "Flexibler Abflussreiniger für Bad & Küche":"Flexibele afvoerreiniger voor badkamer en keuken",
    "Flexibler Reinigungshelfer zum Entfernen von Haaren und Ablagerungen in Waschbecken, Duschen und Bodenabläufen.":"Flexibel hulpmiddel om haren en vuil uit wastafels, douches en vloerafvoeren te verwijderen.",
    "Ersatz-Duschfilter für Handbrausen":"Vervangingsfilter voor douchekop","Multifunktionaler Wasserhahn-Aufsatz":"Multifunctioneel kraanopzetstuk","Duschkopf mit Filter & Temperaturanzeige":"Douchekop met filter en temperatuurweergave"
  }
};

const LanguageContext = createContext<{language:Language;setLanguage:(language:Language)=>void}>({language:"de",setLanguage:()=>{}});
export function LanguageProvider({children}:{children:ReactNode}) {
  const [language,setLanguageState]=useState<Language>("de");
  useEffect(()=>{const saved=window.localStorage.getItem("heinze-language");if(saved==="en"||saved==="nl"||saved==="de")setLanguageState(saved)},[]);
  const setLanguage=(next:Language)=>{setLanguageState(next);window.localStorage.setItem("heinze-language",next)};
  return <LanguageContext.Provider value={{language,setLanguage}}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){
  const context=useContext(LanguageContext);
  const t=(value:string)=>translations[context.language][value]||value;
  return {...context,t};
}
export function LanguageSwitcher(){
  const {language,setLanguage}=useLanguage();
  return <select aria-label="Select language" value={language} onChange={event=>setLanguage(event.target.value as Language)} style={{border:"1px solid var(--line)",borderRadius:999,padding:"8px 11px",background:"#fff",color:"inherit",font:"inherit",fontSize:12,cursor:"pointer"}}>
    <option value="de">🇩🇪 Deutsch</option><option value="en">🇬🇧 English</option><option value="nl">🇳🇱 Nederlands</option>
  </select>;
}
