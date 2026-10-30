"use client";
import Link from "next/link";
import { AddToCartButton, StoreCheckoutProvider } from "../StoreCheckout";
import { LanguageSwitcher, useLanguage } from "../Locale";
import { useMemo, useState } from "react";

const products = [
  { _id: "1", name: "Filter-Duschkopf", price: 29.90, description: "Moderner Duschkopf mit austauschbarem Filter.", imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80" },
  { _id: "2", name: "LED-Nachtlicht mit Bewegungssensor", price: 19.90, description: "Kompaktes LED-Licht für Flur und Badezimmer.", imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" },
  { _id: "3", name: "Organizer für das Badezimmer", price: 24.90, description: "Praktische Aufbewahrung für Bad und Dusche.", imageUrl: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80" },
  { _id: "7", name: "Hochdruck-Wasserpistole für Auto & Garten", price: 18.99, description: "Verstellbare Wasserstrahl-Düse für die Autowäsche, Terrasse und Garten. Einfach am Gartenschlauch anschließen und den Wasserstrahl passend einstellen.", imageUrl: "https://oss-cf.cjdropshipping.com/product/2026/05/05/06/a5e07f18-c771-43ea-a694-59732b471b09.jpg" },
  { _id: "8", name: "Automatischer Schaumseifenspender mit Display", price: 34.99, description: "USB-aufladbarer Sensor-Seifenspender für eine hygienische und komfortable Handwäsche.", imageUrl: "https://oss-cf.cjdropshipping.com/product/2025/01/15/09/785cfa88-7c53-43ed-85b8-afb48e82d48f_trans.jpeg" },
  { _id: "9", name: "Intelligenter Wasserhahn-Sensor", price: 29.99, description: "Berührungsloser Sensor-Aufsatz für den Wasserhahn – praktisch beim Händewaschen und zum Wassersparen.", imageUrl: "https://cc-west-usa.oss-accelerate.aliyuncs.com/quick/product/ba10bd5a-64fa-48ba-8abf-8fafd1a8f19f.jpg" },
  { _id: "10", name: "Kompakter Aktivkohle-Wasserfilter für den Wasserhahn", price: 34.99, description: "Kompakter Auftisch-Wasserfilter mit Aktivkohle-Filterelement und Anschlusszubehör für den Küchenwasserhahn.", imageUrl: "https://oss-cf.cjdropshipping.com/product/2025/04/20/07/c9280880-47dc-427a-b0c9-76046bdf7938.jpg" },
  { _id: "11", name: "Selbstreinigender Turbo-Duschkopf", price: 24.99, description: "Duschkopf mit mehreren Strahlarten, leicht zu reinigenden Silikondüsen und praktischer Wasserstopp-Taste.", imageUrl: "https://cc-west-usa.oss-accelerate.aliyuncs.com/e40da196-1db1-46b0-a15f-96f8cf827d6e.jpg" },
  { _id: "12", name: "Flexibler Abflussreiniger für Bad & Küche", price: 14.99, description: "Flexibler Reinigungshelfer zum Entfernen von Haaren und Ablagerungen in Waschbecken, Duschen und Bodenabläufen.", imageUrl: "https://oss-cf.cjdropshipping.com/product/2024/12/21/03/00661fc7-b7cb-4476-9869-5e5117652d22_trans.jpeg" },
  { _id: "16", name: "Digitales Thermometer & Hygrometer", price: 16.99, description: "Misst Raumtemperatur und Luftfeuchtigkeit auf einen Blick – praktisch für Wohn- und Schlafzimmer.", imageUrl: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80" },
  { _id: "17", name: "Kompakter USB-Tischventilator", price: 22.99, description: "Kompakter Ventilator für Schreibtisch und Zuhause mit mehreren Geschwindigkeitsstufen.", imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80" },
  { _id: "18", name: "Smarte LED-Lampe E27", price: 14.99, description: "Energiesparende LED-Lampe mit einstellbarer Helligkeit und komfortabler Smart-Home-Steuerung.", imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" },
];

const extraTerms:Record<string,string>={
"1":"duschbrause duscharmatur kalkfilter wasserfilter shower head shower filter",
"2":"nachtlicht nacht lampe bewegungsmelder sensor flur bad orientierungslicht",
"3":"bad organizer ablage aufbewahrung duschregal shampoo seife badezimmer",
"7":"hochdruckreiniger wasserpistole schlauch düse auto waschen autowäsche garten terrasse reinigung wasserstrahl",
"8":"seifenspender schaumseife sensor automatisch berührungslos hände waschen soap dispenser",
"9":"wasserhahn sensor armatur aufsatz berührungslos wasser sparen küche",
"10":"wasserfilter aktivkohle trinkwasser filter küchenarmatur wasserhahn schadstoffe",
"11":"duschkopf duschbrause turbo selbstreinigend silikondüsen wasserstopp strahlarten",
"12":"abflussreiniger rohrreiniger haarentferner verstopfung waschbecken dusche küche abfluss",
"16":"thermometer hygrometer temperatur luftfeuchtigkeit raumklima messgerät",
"17":"ventilator usb tischventilator schreibtisch wind kühlung sommer",
"18":"glühbirne lampe led e27 smart licht dimmbar beleuchtung"};
function norm(s:string){return s.toLocaleLowerCase("de").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/ß/g,"ss").replace(/[^a-z0-9 ]/g," ").replace(/\\s+/g," ").trim()}
function distance(a:string,b:string){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old;}}return row[b.length]}
function matches(product:(typeof products)[number],query:string){const q=norm(query);if(!q)return true;const hay=norm([product.name,product.description,extraTerms[product._id]||""].join(" "));if(hay.includes(q))return true;return q.split(" ").some(token=>hay.split(" ").some(word=>word.startsWith(token)||(token.length>=4&&distance(token,word)<=1)));}
const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export default function RegularPricePage() {
  const { t } = useLanguage();
  return (
    <StoreCheckoutProvider>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/"><span style={{ color: "#172d35", fontWeight: 800 }}>HEINZE</span><span style={{ color: "#5a9b9b", fontWeight: 500 }}> FILTER</span></Link>
          <nav className="nav-links" aria-label="Hauptnavigation"><Link href="/">{t("Angebote")}</Link><Link href="/produkte-ohne-rabatt">{t("Weitere Produkte")}</Link></nav><LanguageSwitcher/>
        </div>
      </header>
      <main className="container">
        <section className="section">
          <div className="section-heading">
            <div><p className="eyebrow">{t("Heinze Filter · reguläre Preise")}</p><h1>{t("Weitere Produkte")}</h1><p>{t("Entdecke weitere praktische Produkte für Bad und Zuhause.")}</p></div>
            <p>{products.length} Produkte</p>
          </div>
          <section className="product-search" aria-label="Produktsuche"><div className="search-copy"><p className="eyebrow">{t("PRODUKTSUCHE")}</p><h2>{t("Was suchst du?")}</h2><p>{t("Suche nach Produktnamen, Eigenschaften oder dem gewünschten Einsatz. Auch ähnliche Schreibweisen werden erkannt.")}</p></div><div className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={t("z. B. Duschfilter, Wasserhahn, Nachtlicht …")} aria-label={t("Produkte suchen")}/>{query?<button type="button" onClick={()=>setQuery("")}>{t("Löschen")}</button>:null}</div>{query?<><p className="search-count">{searchResults.length} {t("passende Produkte gefunden")}</p><div className="product-grid">{searchResults.map((product)=><article className="product-card" key={product._id}><div className="product-image-wrap"><img className="product-image" src={product.imageUrl} alt={product.name} loading="lazy"/></div><div className="product-content"><span className="product-category">Heinze Filter</span><h2>{t(product.name)}</h2><div className="product-bottom"><span className="product-price">{euro.format(product.price)}</span><AddToCartButton product={product}/></div></div></article>)}</div>{!searchResults.length?<p className="search-empty">{t("Kein genaues Ergebnis. Probiere einen anderen Begriff oder beschreibe, wofür du das Produkt brauchst.")}</p>:null}</>:null}</section><div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product._id}>
                <div className="product-image-wrap"><img className="product-image" src={product.imageUrl} alt={product.name} loading="lazy" /></div>
                <div className="product-content">
                  <span className="product-category">Heinze Filter</span>
                  <h2>{t(product.name)}</h2>
                  <p className="product-description">{t(product.description)}</p>
                  <div className="product-bottom"><span className="product-price">{euro.format(product.price)}</span><AddToCartButton product={product} /></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer"><div className="container footer-inner"><span>© {new Date().getFullYear()} Heinze Filter. Alle Rechte vorbehalten.</span><Link href="/">{t("Zurück zur Startseite")}</Link></div></footer>
    </StoreCheckoutProvider>
  );
}
