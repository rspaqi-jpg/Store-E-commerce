"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "de" | "en" | "nl";

const translations: Record<Language, Record<string, string>> = {
  de: {},
  en: {
    "Neuheiten":"New arrivals","Wohnen":"Home","Technik":"Technology","Weitere Produkte":"More products",
    "Produkte entdecken ↘":"Explore products ↘","Mehr Komfort.":"More comfort.","Weniger Kalk.":"Less limescale.",
    "Entdecke sorgfältig ausgewählte Produkte für Bad und Zuhause – mit klaren Produktinformationen, transparenten Preisen und einer unkomplizierten Bestellung.":"Discover carefully selected products for your bathroom and home, with clear product information, transparent prices and easy ordering.",
    "Ausgewählt für Bad und Zuhause":"Selected for your bathroom and home","Finde deine passende Lösung":"Find the right solution",
    "Produkte mit Rabatt":"Discounted products","Frisch eingetroffen":"Just arrived","Komfort im Alltag":"Everyday comfort",
    "Intelligent ausgestattet":"Smart essentials","Ausgewählte Produkte für Bad und Dusche.":"Selected products for your bathroom and shower.",
    "Praktische Lösungen für dein Zuhause.":"Practical solutions for your home.","Nützliche Technik für den Alltag.":"Useful everyday technology.",
    "Weniger Kalk. Mehr Wohlgefühl.":"Less limescale. More comfort.","Klare Produktinformationen, transparente Preise und ein einfacher Bestellablauf.":"Clear product information, transparent prices and a simple ordering process.",
    "Angebote":"Offers","reguläre Preise":"regular prices","Entdecke weitere praktische Produkte für Bad und Zuhause.":"Discover more practical products for your bathroom and home.",
    "Diese Produkte werden zum regulären Preis angeboten – ohne durchgestrichene Preise und ohne Rabatt-Badge.":"These products are offered at their regular price, without crossed-out prices or discount badges.",
    "Zurück zur Startseite":"Back to home","Heinze Filter · reguläre Preise":"Heinze Filter · regular prices",
    "Duschen & Duschsysteme":"Showers & shower systems","Waschbecken & Armaturen":"Sinks & faucets","Badzubehör":"Bathroom accessories","Badezimmer-Spiegel":"Bathroom mirrors",
    "Elegantes Design fuer Ihren Alltag.":"Elegant design for everyday living.","Entdecken Sie moderne Armaturen und Duschloesungen, die elegantes Design, praktische Funktionen und zeitlose Formen harmonisch verbinden.":"Discover modern faucets and shower solutions that combine elegant design, practical features and timeless style.",
    "Kollektion entdecken":"Explore the collection","Für Räume mit Anspruch":"For spaces with character",
    "AKTUELLE ANGEBOTE":"CURRENT OFFERS","Alle Produkte im Rabatt":"All discounted products","Aktuell sind keine Rabattprodukte verfügbar.":"There are currently no discounted products available.",
    "Alle Rechte vorbehalten.":"All rights reserved.","Impressum":"Legal notice","Datenschutzerklärung":"Privacy policy","AGB & Widerrufsbelehrung":"Terms & cancellation policy","Versandinformationen":"Shipping information",
    "PRODUKTSUCHE":"PRODUCT SEARCH","Was suchst du?":"What are you looking for?","Suche nach Produktnamen, Eigenschaften oder dem gewünschten Einsatz. Auch ähnliche Schreibweisen werden erkannt.":"Search by product name, features or intended use. Similar spellings are also recognised.",
    "z. B. Duschkopf mit Filter, digitaler Wasserhahn, Regendusche …":"e.g. filtered shower head, digital faucet, rain shower …","Produkte suchen":"Search products","Löschen":"Clear","passende Produkte gefunden":"matching products found","Meintest du vielleicht?":"Did you mean?",
    "Kein genaues Ergebnis. Probiere einen anderen Begriff oder beschreibe, wofür du das Produkt brauchst.":"No exact match. Try another term or describe what you need the product for.",
    "Dusche · Premium-Auswahl":"Shower · premium selection","Duschköpfe, Regenduschen und Filtersysteme.":"Shower heads, rain showers and filter systems.",
    "Armaturen · Premium-Auswahl":"Faucets · premium selection","Küchen- und Waschtischarmaturen.":"Kitchen and washbasin faucets.",
    "Badzubehör · Auswahl":"Bathroom accessories · selection","Praktische Ergänzungen für Bad und Dusche.":"Practical additions for your bathroom and shower.",
    "Spiegel · Premium-Auswahl":"Mirrors · premium selection","Beleuchtete und funktionale Badspiegel.":"Illuminated and functional bathroom mirrors.",
    "Multifunktionaler Wasserhahn-Aufsatz":"Multifunctional faucet attachment","Digitaler Küchenwasserhahn mit Temperaturanzeige":"Digital kitchen faucet with temperature display",
    "Premium Küchenarmatur mit ausziehbarer Brause":"Premium kitchen faucet with pull-out spray","Premium Regendusche Komplettset Schwarz":"Premium black rain shower set",
    "3 Wasserstrahl-Modi: Rainfall, Sweep und Stream. Mit Umschalttaste und 360°-Drehung – zum Waschen von Obst, Spülen und Reinigen der Spüle.":"3 spray modes: rainfall, sweep and stream. With selector button and 360° rotation for washing produce, rinsing and cleaning the sink.",
    "Moderner ausziehbarer Wasserhahn mit digitaler Wassertemperaturanzeige, 360°-Drehung und Keramikkartusche. Vor dem Kauf Anschlussmaße prüfen.":"Modern pull-out faucet with digital water temperature display, 360° rotation and ceramic cartridge. Check connection dimensions before purchase.",
    "Schwarze Küchenarmatur aus Edelstahl SUS 304 mit ausziehbarer Brause und drei Modi: Wasserstrahl, Sprühstrahl und Pause.":"Black SUS 304 stainless steel kitchen faucet with pull-out spray and three modes: stream, spray and pause.",
    "Komplettes Wand-Duschsystem in Mattschwarz mit 10-Zoll-Regenduschkopf aus Edelstahl, Handbrause, Messing-Mischventil, Brausearm und Schlauch. Anschlussmaße und Installation vor Bestellung prüfen.":"Complete matte-black wall-mounted shower system with 10-inch stainless steel rain shower head, hand shower, brass mixer valve, shower arm and hose. Check connections and installation before ordering.",
    "Filter-Duschkopf":"Filtered shower head","Moderner Duschkopf mit austauschbarem Filter.":"Modern shower head with replaceable filter.",
    "LED-Nachtlicht mit Bewegungssensor":"LED night light with motion sensor","Kompaktes LED-Licht für Flur und Badezimmer.":"Compact LED light for hallways and bathrooms.",
    "Organizer für das Badezimmer":"Bathroom organizer","Praktische Aufbewahrung für Bad und Dusche.":"Practical storage for your bathroom and shower.",
    "Hochdruck-Wasserpistole für Auto & Garten":"High-pressure water gun for car & garden",
    "Verstellbare Wasserstrahl-Düse für die Autowäsche, Terrasse und Garten. Einfach am Gartenschlauch anschließen und den Wasserstrahl passend einstellen.":"Adjustable water jet nozzle for washing cars, patios and gardens. Simply connect to a garden hose and adjust the spray.",
    "Duschkopf mit Filter & Temperaturanzeige":"Shower head with filter & temperature display","Automatischer Schaumseifenspender mit Display":"Automatic foaming soap dispenser with display",
    "USB-aufladbarer Sensor-Seifenspender für eine hygienische und komfortable Handwäsche.":"USB-rechargeable sensor soap dispenser for hygienic and convenient hand washing.",
    "Intelligenter Wasserhahn-Sensor":"Smart faucet sensor","Berührungsloser Sensor-Aufsatz für den Wasserhahn – praktisch beim Händewaschen und zum Wassersparen.":"Touch-free faucet sensor attachment – practical for hand washing and helping save water.",
    "Kompakter Aktivkohle-Wasserfilter für den Wasserhahn":"Compact activated carbon faucet water filter","Kompakter Auftisch-Wasserfilter mit Aktivkohle-Filterelement und Anschlusszubehör für den Küchenwasserhahn.":"Compact countertop water filter with activated carbon filter element and fittings for a kitchen faucet.",
    "Selbstreinigender Turbo-Duschkopf":"Self-cleaning turbo shower head","Duschkopf mit mehreren Strahlarten, leicht zu reinigenden Silikondüsen und praktischer Wasserstopp-Taste.":"Shower head with multiple spray modes, easy-clean silicone nozzles and a convenient water-stop button.",
    "Flexibler Abflussreiniger für Bad & Küche":"Flexible drain cleaner for bathroom & kitchen","WLAN-Smart-Steckdose mit Strommessung":"Wi-Fi smart plug with energy monitoring",
    "Steuere angeschlossene Geräte per App und behalte den Stromverbrauch im Blick. Kompaktes Smart-Home-Zubehör für den Alltag.":"Control connected devices by app and monitor power use. Compact smart-home accessory for everyday use.",
    "Matter RGB LED-Lichtstreifen 3 m":"Matter RGB LED light strip 3 m","Smarte LED-Beleuchtung mit einstellbaren Farben und Helligkeit für eine gemütliche Atmosphäre zu Hause.":"Smart LED lighting with adjustable colours and brightness for a cosy atmosphere at home.",
    "WLAN Tür- und Fenstersensor":"Wi-Fi door and window sensor","Kompakter Kontaktsensor für Türen und Fenster. Erhalte eine Meldung, wenn sich der Status ändert; Kompatibilität mit Hub oder App bitte vor dem Kauf prüfen.":"Compact contact sensor for doors and windows. Get an alert when the status changes; check hub or app compatibility before purchase.",
    "Digitales Thermometer & Hygrometer":"Digital thermometer & hygrometer","Misst Raumtemperatur und Luftfeuchtigkeit auf einen Blick – praktisch für Wohn- und Schlafzimmer.":"Displays room temperature and humidity at a glance – useful for living rooms and bedrooms.",
    "Kompakter USB-Tischventilator":"Compact USB desk fan","Kompakter Ventilator für Schreibtisch und Zuhause mit mehreren Geschwindigkeitsstufen.":"Compact fan for your desk or home with multiple speed settings.",
    "Smarte LED-Lampe E27":"Smart E27 LED bulb","Energiesparende LED-Lampe mit einstellbarer Helligkeit und komfortabler Smart-Home-Steuerung.":"Energy-saving LED bulb with adjustable brightness and convenient smart-home control.",
    "Flexibler Reinigungshelfer zum Entfernen von Haaren und Ablagerungen in Waschbecken, Duschen und Bodenabläufen.":"Flexible cleaning tool for removing hair and buildup from sinks, showers and floor drains.",
    "Ersatz-Duschfilter für Handbrausen":"Replacement shower filter",
    "Heinze Filter Startseite":"Heinze Filter homepage","Hauptnavigation":"Main navigation","HEINZE FILTER / BAD & SANITÄR":"HEINZE FILTER / BATHROOM & SANITARY",
    "LIMITED OFFER · BIS ZU 20 % RABATT":"LIMITED OFFER · UP TO 20% OFF","BAD · DUSCHE · KÜCHE":"BATHROOM · SHOWER · KITCHEN",
    "Modernes Badezimmer mit eleganten Sanitärarmaturen":"Modern bathroom with elegant fixtures","Produktsuche":"Product search","Produktkategorien":"Product categories",
    "Rabattangebote":"Special offers","Rechtliche Informationen":"Legal information","Leipziger Platz 12, 10117 Berlin, Deutschland":"Leipziger Platz 12, 10117 Berlin, Germany",
    "PayPal Client ID fehlt.":"PayPal Client ID is missing.","PayPal Client ID fehlt in den Vercel Production Environment Variables.":"PayPal Client ID is missing from Vercel production environment variables.",
    "Die Zahlung konnte nicht bestätigt werden.":"The payment could not be confirmed.","PayPal konnte nicht gestartet werden. Öffne die Entwicklerkonsole oder prüfe die Vercel Runtime Logs für Details.":"PayPal could not be started. Open the developer console or check the Vercel runtime logs for details.",
    "Die PayPal-Schaltfläche konnte nicht geladen werden.":"The PayPal button could not be loaded.","Checkout schließen":"Close checkout","NEXT_PUBLIC_PAYPAL_CLIENT_ID fehlt in den Vercel Production Environment Variables.":"NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing from Vercel production environment variables.",
    "PayPal Live ist noch nicht konfiguriert: NEXT_PUBLIC_PAYPAL_CLIENT_ID fehlt.":"PayPal Live is not configured yet: NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing."
  },
  nl: {
    "Neuheiten":"Nieuw","Wohnen":"Wonen","Technik":"Technologie","Weitere Produkte":"Meer producten",
    "Produkte entdecken ↘":"Bekijk producten ↘","Mehr Komfort.":"Meer comfort.","Weniger Kalk.":"Minder kalkaanslag.",
    "Entdecke sorgfältig ausgewählte Produkte für Bad und Zuhause – mit klaren Produktinformationen, transparenten Preisen und einer unkomplizierten Bestellung.":"Ontdek zorgvuldig geselecteerde producten voor badkamer en huis, met duidelijke productinformatie, transparante prijzen en eenvoudig bestellen.",
    "Ausgewählt für Bad und Zuhause":"Geselecteerd voor badkamer en huis","Finde deine passende Lösung":"Vind de juiste oplossing",
    "Produkte mit Rabatt":"Producten met korting","Frisch eingetroffen":"Nieuw binnen","Komfort im Alltag":"Comfort in het dagelijks leven",
    "Intelligent ausgestattet":"Slimme essentials","Ausgewählte Produkte für Bad und Dusche.":"Geselecteerde producten voor badkamer en douche.",
    "Praktische Lösungen für dein Zuhause.":"Praktische oplossingen voor je huis.","Nützliche Technik für den Alltag.":"Handige technologie voor elke dag.",
    "Weniger Kalk. Mehr Wohlgefühl.":"Minder kalkaanslag. Meer comfort.","Klare Produktinformationen, transparente Preise und ein einfacher Bestellablauf.":"Duidelijke productinformatie, transparante prijzen en eenvoudig bestellen.",
    "Angebote":"Aanbiedingen","reguläre Preise":"normale prijzen","Entdecke weitere praktische Produkte für Bad und Zuhause.":"Ontdek meer praktische producten voor badkamer en huis.",
    "Diese Produkte werden zum regulären Preis angeboten – ohne durchgestrichene Preise und ohne Rabatt-Badge.":"Deze producten worden aangeboden voor de normale prijs, zonder doorgestreepte prijzen of kortingslabel.",
    "Zurück zur Startseite":"Terug naar home","Heinze Filter · reguläre Preise":"Heinze Filter · normale prijzen",
    "Duschen & Duschsysteme":"Douches en douchesystemen","Waschbecken & Armaturen":"Wastafels en kranen","Badzubehör":"Badkameraccessoires","Badezimmer-Spiegel":"Badkamerspiegels",
    "Elegantes Design fuer Ihren Alltag.":"Elegant design voor elke dag.","Entdecken Sie moderne Armaturen und Duschloesungen, die elegantes Design, praktische Funktionen und zeitlose Formen harmonisch verbinden.":"Ontdek moderne kranen en doucheoplossingen waarin elegant design, praktische functies en tijdloze vormen samenkomen.",
    "Kollektion entdecken":"Ontdek de collectie","Für Räume mit Anspruch":"Voor stijlvolle ruimtes",
    "AKTUELLE ANGEBOTE":"ACTUELE AANBIEDINGEN","Alle Produkte im Rabatt":"Alle producten met korting","Aktuell sind keine Rabattprodukte verfügbar.":"Er zijn momenteel geen afgeprijsde producten beschikbaar.",
    "Alle Rechte vorbehalten.":"Alle rechten voorbehouden.","Impressum":"Colofon","Datenschutzerklärung":"Privacyverklaring","AGB & Widerrufsbelehrung":"Algemene voorwaarden en herroepingsrecht","Versandinformationen":"Verzendinformatie",
    "PRODUKTSUCHE":"PRODUCTZOEKER","Was suchst du?":"Waar ben je naar op zoek?","Suche nach Produktnamen, Eigenschaften oder dem gewünschten Einsatz. Auch ähnliche Schreibweisen werden erkannt.":"Zoek op productnaam, eigenschappen of toepassing. Ook vergelijkbare schrijfwijzen worden herkend.",
    "z. B. Duschkopf mit Filter, digitaler Wasserhahn, Regendusche …":"bijv. douchekop met filter, digitale kraan, regendouche …","Produkte suchen":"Producten zoeken","Löschen":"Wissen","passende Produkte gefunden":"passende producten gevonden","Meintest du vielleicht?":"Bedoelde je misschien?",
    "Kein genaues Ergebnis. Probiere einen anderen Begriff oder beschreibe, wofür du das Produkt brauchst.":"Geen exacte resultaten. Probeer een andere zoekterm of beschrijf waarvoor je het product nodig hebt.",
    "Dusche · Premium-Auswahl":"Douche · premium selectie","Duschköpfe, Regenduschen und Filtersysteme.":"Douchekoppen, regendouches en filtersystemen.",
    "Armaturen · Premium-Auswahl":"Kranen · premium selectie","Küchen- und Waschtischarmaturen.":"Keuken- en wastafelkranen.",
    "Badzubehör · Auswahl":"Badkameraccessoires · selectie","Praktische Ergänzungen für Bad und Dusche.":"Praktische aanvullingen voor badkamer en douche.",
    "Spiegel · Premium-Auswahl":"Spiegels · premium selectie","Beleuchtete und funktionale Badspiegel.":"Verlichte en functionele badkamerspiegels.",
    "Multifunktionaler Wasserhahn-Aufsatz":"Multifunctioneel kraanopzetstuk","Digitaler Küchenwasserhahn mit Temperaturanzeige":"Digitale keukenkraan met temperatuurweergave",
    "Premium Küchenarmatur mit ausziehbarer Brause":"Premium keukenkraan met uittrekbare sproeier","Premium Regendusche Komplettset Schwarz":"Premium zwarte regendoucheset",
    "3 Wasserstrahl-Modi: Rainfall, Sweep und Stream. Mit Umschalttaste und 360°-Drehung – zum Waschen von Obst, Spülen und Reinigen der Spüle.":"3 straalstanden: regen, sweep en stream. Met keuzeknop en 360°-rotatie voor het wassen van fruit, afspoelen en reinigen van de spoelbak.",
    "Moderner ausziehbarer Wasserhahn mit digitaler Wassertemperaturanzeige, 360°-Drehung und Keramikkartusche. Vor dem Kauf Anschlussmaße prüfen.":"Moderne uittrekbare kraan met digitale watertemperatuurweergave, 360°-rotatie en keramisch binnenwerk. Controleer vóór aankoop de aansluitmaten.",
    "Schwarze Küchenarmatur aus Edelstahl SUS 304 mit ausziehbarer Brause und drei Modi: Wasserstrahl, Sprühstrahl und Pause.":"Zwarte SUS 304 roestvrijstalen keukenkraan met uittrekbare sproeier en drie standen: straal, spray en pauze.",
    "Komplettes Wand-Duschsystem in Mattschwarz mit 10-Zoll-Regenduschkopf aus Edelstahl, Handbrause, Messing-Mischventil, Brausearm und Schlauch. Anschlussmaße und Installation vor Bestellung prüfen.":"Compleet matzwart wanddouchesysteem met 10-inch regendouchekop van roestvrij staal, handdouche, messing mengkraan, douchearm en slang. Controleer aansluitmaten en installatie vóór bestelling.",
    "Filter-Duschkopf":"Douchekop met filter","Moderner Duschkopf mit austauschbarem Filter.":"Moderne douchekop met vervangbaar filter.",
    "LED-Nachtlicht mit Bewegungssensor":"LED-nachtlampje met bewegingssensor","Kompaktes LED-Licht für Flur und Badezimmer.":"Compact ledlampje voor hal en badkamer.",
    "Organizer für das Badezimmer":"Badkamerorganizer","Praktische Aufbewahrung für Bad und Dusche.":"Praktische opbergruimte voor badkamer en douche.",
    "Hochdruck-Wasserpistole für Auto & Garten":"Hogedrukspuit voor auto en tuin",
    "Verstellbare Wasserstrahl-Düse für die Autowäsche, Terrasse und Garten. Einfach am Gartenschlauch anschließen und den Wasserstrahl passend einstellen.":"Verstelbare waterstraal voor het wassen van auto's, terras en tuin. Sluit eenvoudig aan op de tuinslang en stel de straal naar wens in.",
    "Duschkopf mit Filter & Temperaturanzeige":"Douchekop met filter en temperatuurweergave","Automatischer Schaumseifenspender mit Display":"Automatische schuimzeepdispenser met display",
    "USB-aufladbarer Sensor-Seifenspender für eine hygienische und komfortable Handwäsche.":"Oplaadbare zeepdispenser met sensor voor hygiënisch en comfortabel handen wassen.",
    "Intelligenter Wasserhahn-Sensor":"Slimme kraansensor","Berührungsloser Sensor-Aufsatz für den Wasserhahn – praktisch beim Händewaschen und zum Wassersparen.":"Contactloze sensoropzet voor de kraan – handig bij handen wassen en om water te besparen.",
    "Kompakter Aktivkohle-Wasserfilter für den Wasserhahn":"Compacte actieve-koolstoffilter voor de kraan","Kompakter Auftisch-Wasserfilter mit Aktivkohle-Filterelement und Anschlusszubehör für den Küchenwasserhahn.":"Compact tafelmodel waterfilter met actieve-koolstoffilter en aansluitaccessoires voor de keukenkraan.",
    "Selbstreinigender Turbo-Duschkopf":"Zelfreinigende turbo-douchekop","Duschkopf mit mehreren Strahlarten, leicht zu reinigenden Silikondüsen und praktischer Wasserstopp-Taste.":"Douchekop met meerdere straalstanden, eenvoudig te reinigen siliconen sproeigaatjes en handige waterstopknop.",
    "Flexibler Abflussreiniger für Bad & Küche":"Flexibele afvoerreiniger voor badkamer en keuken","WLAN-Smart-Steckdose mit Strommessung":"Slimme wifi-stekker met energiemonitoring",
    "Steuere angeschlossene Geräte per App und behalte den Stromverbrauch im Blick. Kompaktes Smart-Home-Zubehör für den Alltag.":"Bedien aangesloten apparaten via een app en houd het stroomverbruik in de gaten. Compacte smart-home-accessoire voor dagelijks gebruik.",
    "Matter RGB LED-Lichtstreifen 3 m":"Matter RGB-ledstrip 3 m","Smarte LED-Beleuchtung mit einstellbaren Farben und Helligkeit für eine gemütliche Atmosphäre zu Hause.":"Slimme ledverlichting met instelbare kleuren en helderheid voor een gezellige sfeer thuis.",
    "WLAN Tür- und Fenstersensor":"Wifi deur- en raamsensor","Kompakter Kontaktsensor für Türen und Fenster. Erhalte eine Meldung, wenn sich der Status ändert; Kompatibilität mit Hub oder App bitte vor dem Kauf prüfen.":"Compacte contactsensor voor deuren en ramen. Ontvang een melding wanneer de status verandert; controleer vóór aankoop de compatibiliteit met hub of app.",
    "Digitales Thermometer & Hygrometer":"Digitale thermometer en hygrometer","Misst Raumtemperatur und Luftfeuchtigkeit auf einen Blick – praktisch für Wohn- und Schlafzimmer.":"Toont in één oogopslag de kamertemperatuur en luchtvochtigheid – handig voor woon- en slaapkamers.",
    "Kompakter USB-Tischventilator":"Compacte USB-bureauventilator","Kompakter Ventilator für Schreibtisch und Zuhause mit mehreren Geschwindigkeitsstufen.":"Compacte ventilator voor bureau en huis met meerdere snelheidsstanden.",
    "Smarte LED-Lampe E27":"Slimme E27-ledlamp","Energiesparende LED-Lampe mit einstellbarer Helligkeit und komfortabler Smart-Home-Steuerung.":"Energiezuinige ledlamp met instelbare helderheid en handige smart-home-bediening.",
    "Flexibler Reinigungshelfer zum Entfernen von Haaren und Ablagerungen in Waschbecken, Duschen und Bodenabläufen.":"Flexibel hulpmiddel om haren en vuil uit wastafels, douches en vloerafvoeren te verwijderen.",
    "Ersatz-Duschfilter für Handbrausen":"Vervangingsfilter voor douchekop",
    "Heinze Filter Startseite":"Heinze Filter-startpagina","Hauptnavigation":"Hoofdnavigatie","HEINZE FILTER / BAD & SANITÄR":"HEINZE FILTER / BADKAMER & SANITAIR",
    "LIMITED OFFER · BIS ZU 20 % RABATT":"AANBIEDING · TOT 20% KORTING","BAD · DUSCHE · KÜCHE":"BADKAMER · DOUCHE · KEUKEN",
    "Modernes Badezimmer mit eleganten Sanitärarmaturen":"Moderne badkamer met elegante kranen","Produktsuche":"Product zoeken","Produktkategorien":"Productcategorieën",
    "Rabattangebote":"Aanbiedingen","Rechtliche Informationen":"Juridische informatie","Leipziger Platz 12, 10117 Berlin, Deutschland":"Leipziger Platz 12, 10117 Berlijn, Duitsland",
    "PayPal Client ID fehlt.":"PayPal Client-ID ontbreekt.","PayPal Client ID fehlt in den Vercel Production Environment Variables.":"PayPal Client-ID ontbreekt in de productieomgevingsvariabelen van Vercel.",
    "Die Zahlung konnte nicht bestätigt werden.":"De betaling kon niet worden bevestigd.","PayPal konnte nicht gestartet werden. Öffne die Entwicklerkonsole oder prüfe die Vercel Runtime Logs für Details.":"PayPal kon niet worden gestart. Open de ontwikkelaarsconsole of controleer de Vercel-runtime-logboeken.",
    "Die PayPal-Schaltfläche konnte nicht geladen werden.":"De PayPal-knop kon niet worden geladen.","Checkout schließen":"Afrekenen sluiten","NEXT_PUBLIC_PAYPAL_CLIENT_ID fehlt in den Vercel Production Environment Variables.":"NEXT_PUBLIC_PAYPAL_CLIENT_ID ontbreekt in de productieomgevingsvariabelen van Vercel.",
    "PayPal Live ist noch nicht konfiguriert: NEXT_PUBLIC_PAYPAL_CLIENT_ID fehlt.":"PayPal Live is nog niet ingesteld: NEXT_PUBLIC_PAYPAL_CLIENT_ID ontbreekt."
  }
};

const LanguageContext = createContext<{language:Language;setLanguage:(language:Language)=>void}>({language:"de",setLanguage:()=>{}});
export function LanguageProvider({children}:{children:ReactNode}) {
  const [language,setLanguageState]=useState<Language>("de");
  const setLanguage=(next:Language)=>setLanguageState(next);
  return <LanguageContext.Provider value={{language,setLanguage}}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){
  const context=useContext(LanguageContext);
  const t=(value:string)=>translations[context.language][value] ?? value;
  return {...context,t};
}
export function LanguageSwitcher(){
  const {language,setLanguage}=useLanguage();
  const flags:Record<Language,ReactNode>={
    de:<svg viewBox="0 0 30 20" role="img" aria-label="Deutsch" style={{display:"block",width:26,height:18,borderRadius:3,boxShadow:"0 0 0 1px rgba(0,0,0,.15)"}}><rect width="30" height="20" fill="#FFCE00"/><rect width="30" height="13.33" fill="#DD0000"/><rect width="30" height="6.67" fill="#000"/></svg>,
    en:<svg viewBox="0 0 60 30" role="img" aria-label="English" style={{display:"block",width:26,height:18,borderRadius:3,boxShadow:"0 0 0 1px rgba(0,0,0,.15)"}}><rect width="60" height="30" fill="#012169"/><path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6"/><path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="2.5"/><path d="M30 0 V30 M0 15 H60" stroke="#fff" strokeWidth="10"/><path d="M30 0 V30 M0 15 H60" stroke="#C8102E" strokeWidth="5"/></svg>,
    nl:<svg viewBox="0 0 30 20" role="img" aria-label="Nederlands" style={{display:"block",width:26,height:18,borderRadius:3,boxShadow:"0 0 0 1px rgba(0,0,0,.15)"}}><rect width="30" height="20" fill="#21468B"/><rect width="30" height="13.33" fill="#fff"/><rect width="30" height="6.67" fill="#AE1C28"/></svg>
  };
  return <div role="group" aria-label="Choose language" style={{display:"flex",alignItems:"center",gap:6,border:"1px solid var(--line)",borderRadius:999,padding:"5px 7px",background:"#fff"}}>
    {(["de","en","nl"] as Language[]).map(code=><button key={code} type="button" onClick={()=>setLanguage(code)} aria-label={code==="de"?"Deutsch":code==="en"?"English":"Nederlands"} aria-pressed={language===code} title={code==="de"?"Deutsch":code==="en"?"English":"Nederlands"} style={{display:"grid",placeItems:"center",padding:4,border:language===code?"2px solid #b7a16d":"2px solid transparent",borderRadius:6,background:language===code?"#f8f4e9":"transparent",cursor:"pointer"}}>{flags[code]}</button>)}
  </div>;
}