"use client";
import Link from "next/link";
import { AddToCartButton, StoreCheckoutProvider } from "../StoreCheckout";
import { useLanguage } from "../Locale";
import { useEffect, useMemo, useState } from "react";

type StoreProduct = { _id: string; category: string; name: string; price: number; description: string; imageUrl: string; destination?: "discount" | "regular" };
const products: StoreProduct[] = [];


const extraTerms:Record<string,string>={
"1":"duschbrause duscharmatur kalkfilter wasserfilter shower head shower filter",
"3":"bad organizer ablage aufbewahrung duschregal shampoo seife badezimmer",
"8":"seifenspender schaumseife sensor automatisch berührungslos hände waschen soap dispenser",
"9":"wasserhahn sensor armatur aufsatz berührungslos wasser sparen küche",
"10":"wasserfilter aktivkohle trinkwasser filter küchenarmatur wasserhahn schadstoffe",
"11":"duschkopf duschbrause turbo selbstreinigend silikondüsen wasserstopp strahlarten",
"12":"abflussreiniger rohrreiniger haarentferner verstopfung waschbecken dusche küche abfluss",
"18":"glühbirne lampe led e27 smart licht dimmbar beleuchtung"};
function norm(s:string){return s.toLocaleLowerCase("de").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/ß/g,"ss").replace(/[^a-z0-9 ]/g," ").replace(/\\s+/g," ").trim()}
function distance(a:string,b:string){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old;}}return row[b.length]}
function matches(product:(typeof products)[number],query:string){const q=norm(query);if(!q)return true;const hay=norm([product.name,product.description,extraTerms[product._id]||""].join(" "));if(hay.includes(q))return true;return q.split(" ").some(token=>hay.split(" ").some(word=>word.startsWith(token)||(token.length>=4&&distance(token,word)<=1)));}
const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export default function RegularPricePage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [dynamicProducts, setDynamicProducts] = useState<StoreProduct[]>([]);
  useEffect(() => {
    let active = true;
    fetch("/api/products", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((data) => { if (active && Array.isArray(data)) setDynamicProducts(data.filter((product: StoreProduct) => product.destination === "regular")); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  const allProducts = [...products, ...dynamicProducts];
  const searchResults = useMemo(() => allProducts.filter((product) => matches(product, query)), [query, dynamicProducts]);
  return (
    <StoreCheckoutProvider>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/"><span style={{ color: "#172d35", fontWeight: 800 }}>HEINZE</span><span style={{ color: "#5a9b9b", fontWeight: 500 }}> FILTER</span></Link>
          <nav className="nav-links" aria-label="Hauptnavigation"><Link href="/">{t("Startseite")}</Link></nav>
        </div>
      </header>
      <main className="container">
        <section className="section">
          <div className="section-heading">
            <div><p className="eyebrow">{t("Heinze Filter · reguläre Preise")}</p><h1>{t("Weitere Produkte")}</h1><p>{t("Entdecke weitere praktische Produkte für Bad und Zuhause.")}</p></div>
            <p>{allProducts.length} Produkte</p>
          </div>
          <section className="product-search" aria-label="Produktsuche"><div className="search-copy"><p className="eyebrow">{t("PRODUKTSUCHE")}</p><h2>{t("Was suchst du?")}</h2><p>{t("Suche nach Produktnamen, Eigenschaften oder dem gewünschten Einsatz. Auch ähnliche Schreibweisen werden erkannt.")}</p></div><div className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={t("z. B. Duschfilter, Wasserhahn, Nachtlicht …")} aria-label={t("Produkte suchen")}/>{query?<button type="button" onClick={()=>setQuery("")}>{t("Löschen")}</button>:null}</div>{query?<><p className="search-count">{searchResults.length} {t("passende Produkte gefunden")}</p><div className="product-grid">{searchResults.map((product)=><article className="product-card" key={product._id}><div className="product-image-wrap"><img className="product-image" src={product.imageUrl} alt={product.name} loading="lazy"/></div><div className="product-content"><span className="product-category">Heinze Filter</span><h2>{t(product.name)}</h2><div className="product-bottom"><span className="product-price">{euro.format(product.price)}</span><AddToCartButton product={product}/></div></div></article>)}</div>{!searchResults.length?<p className="search-empty">{t("Kein genaues Ergebnis. Probiere einen anderen Begriff oder beschreibe, wofür du das Produkt brauchst.")}</p>:null}</>:null}</section><div className="product-grid">{allProducts.map((product)=><article className="product-card" key={product._id}><div className="product-image-wrap"><img className="product-image" src={product.imageUrl} alt={product.name} loading="lazy"/></div><div className="product-content"><span className="product-category">Heinze Filter</span><h2>{t(product.name)}</h2><div className="product-bottom"><span className="product-price">{euro.format(product.price)}</span><AddToCartButton product={product}/></div></div></article>)}</div>
        </section>
      </main>
      <footer className="site-footer"><div className="container footer-inner"><span>© {new Date().getFullYear()} Heinze Filter. Alle Rechte vorbehalten.</span><Link href="/">{t("Zurück zur Startseite")}</Link></div></footer>
    </StoreCheckoutProvider>
  );
}
