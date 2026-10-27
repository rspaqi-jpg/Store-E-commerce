import Link from "next/link";
import { sanityClient } from "@/sanity/lib/client";
import { productsQuery } from "@/sanity/lib/queries";

type Product = {
  _id: string;
  name?: string;
  price?: number;
  description?: string;
  imageUrl?: string | null;
};

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

async function getProducts(): Promise<Product[]> {
  try {
    return await sanityClient.fetch<Product[]>(productsQuery, {}, { next: { revalidate: 60 } });
  } catch (error) {
    console.error("Sanity products could not be loaded", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/">minimal<span style={{ color: "#aaa" }}>.</span></Link>
          <nav className="nav-links" aria-label="Hauptnavigation">
            <a href="#produkte">Produkte</a>
            <a href="#ueber-uns">Über uns</a>
          </nav>
          <Link className="product-link" href="/storefront.html">Zum Shop ↗</Link>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">Weniger, aber besser</p>
            <h1>Gute Dinge.<br />Einfach ausgewählt.</h1>
            <p>Zeitloses Design für deinen Alltag. Entdecke ausgewählte Favoriten für Zuhause, unterwegs und jeden Tag.</p>
            <a className="primary-button" href="#produkte">Produkte entdecken ↘</a>
          </div>
          <img className="hero-image" src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=85" alt="Minimalistisches, helles Zuhause" />
        </section>

        <section id="produkte" className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Direkt aus dem Produktkatalog</p>
              <h2>Produkte im Store</h2>
            </div>
            <p>{products.length.toString().padStart(2, "0")} Produkte</p>
          </div>

          {products.length > 0 ? (
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product._id}>
                  <div className="product-image-wrap">
                    {product.imageUrl ? (
                      <img className="product-image" src={product.imageUrl} alt={product.name || "Produkt"} loading="lazy" />
                    ) : (
                      <div className="product-image" role="img" aria-label="Kein Produktbild vorhanden" />
                    )}
                  </div>
                  <div className="product-content">
                    <span className="product-category">Minimal Store</span>
                    <h3>{product.name || "Produkt ohne Namen"}</h3>
                    <p className="product-description">{product.description || "Ausgewähltes Produkt für deinen Alltag."}</p>
                    <div className="product-bottom">
                      <span className="product-price">{typeof product.price === "number" ? euro.format(product.price) : "Preis auf Anfrage"}</span>
                      <Link className="product-link" href="/storefront.html">Ansehen ↗</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Noch keine Produkte veröffentlicht</h3>
              <p>Öffne das Admin Panel, füge Name, Preis, Bild und Beschreibung hinzu und veröffentliche das Produkt. Danach erscheint es hier automatisch.</p>
              <Link className="primary-button" href="/studio">Admin Panel öffnen ↗</Link>
            </div>
          )}
        </section>

        <section id="ueber-uns" className="shop-banner">
          <div>
            <p className="eyebrow">Minimal Store</p>
            <h2>Weniger suchen. Besser finden.</h2>
            <p>Deine Produktdaten werden aus Sanity geladen. Änderungen an veröffentlichten Produkten erscheinen automatisch auf dieser Seite.</p>
          </div>
          <Link className="primary-button" href="/storefront.html">Zum vollständigen Shop ↗</Link>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} Minimal Store. Alle Rechte vorbehalten.</span>
          <nav className="footer-links" aria-label="Rechtliche Informationen">
            <a href="/impressum.html">Impressum</a>
            <a href="/datenschutzerklaerung.html">Datenschutzerklärung</a>
            <a href="/agb-widerruf.html">AGB &amp; Widerrufsbelehrung</a>
            <a href="/versandinformationen.html">Versandinformationen</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
