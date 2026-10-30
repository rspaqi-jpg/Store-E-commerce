"use client";
import Link from "next/link";
import { AddToCartButton, StoreCheckoutProvider } from "../StoreCheckout";
import { LanguageSwitcher, useLanguage } from "../Locale";

const products = [
  { _id: "1", name: "Filter-Duschkopf", price: 29.90, description: "Moderner Duschkopf mit austauschbarem Filter.", imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80" },
  { _id: "2", name: "LED-Nachtlicht mit Bewegungssensor", price: 19.90, description: "Kompaktes LED-Licht für Flur und Badezimmer.", imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" },
  { _id: "3", name: "Organizer für das Badezimmer", price: 24.90, description: "Praktische Aufbewahrung für Bad und Dusche.", imageUrl: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80" },
  { _id: "7", name: "Hochdruck-Wasserpistole für Auto & Garten", price: 18.99, description: "Verstellbare Wasserstrahl-Düse für die Autowäsche, Terrasse und Garten. Einfach am Gartenschlauch anschließen und den Wasserstrahl passend einstellen.", imageUrl: "https://oss-cf.cjdropshipping.com/product/2026/05/05/06/a5e07f18-c771-43ea-a694-59732b471b09.jpg" },
];

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export default function RegularPricePage() {\n  const { t } = useLanguage();
  return (
    <StoreCheckoutProvider>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/"><span style={{ color: "#172d35", fontWeight: 800 }}>HEINZE</span><span style={{ color: "#5a9b9b", fontWeight: 500 }}> FILTER</span></Link>
          <nav className="nav-links" aria-label="Hauptnavigation"><Link href="/">{t("Angebote")}</Link><Link href="/produkte-ohne-rabatt">{t("Weitere Produkte")}</Link><LanguageSwitcher/></nav>
        </div>
      </header>
      <main className="container">
        <section className="section">
          <div className="section-heading">
            <div><p className="eyebrow">{t("Heinze Filter · reguläre Preise")}</p><h1>{t("Weitere Produkte")}</h1><p>{t("Entdecke weitere praktische Produkte für Bad und Zuhause.")}</p></div>
            <p>{products.length} Produkte</p>
          </div>
          <div className="product-grid">
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
