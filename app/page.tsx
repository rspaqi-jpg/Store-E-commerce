import Link from "next/link";
import { sanityClient } from "@/sanity/lib/client";
import { productsQuery } from "@/sanity/lib/queries";

type Product = {
  _id: string;
  name?: string;
  category?: "neuheiten" | "wohnen" | "technik";
  price?: number;
  description?: string;
  imageUrl?: string | null;
};

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

const categories = [
  {
    id: "neuheiten" as const,
    title: "Neuheiten",
    eyebrow: "Frisch eingetroffen",
    description: "Entdecke neue Produkte für Bad, Dusche und modernes Wohnen.",
  },
  {
    id: "wohnen" as const,
    title: "Wohnen",
    eyebrow: "Komfort im Alltag",
    description: "Durchdachte Sanitärlösungen, die Design und Wohlbefinden verbinden.",
  },
  {
    id: "technik" as const,
    title: "Technik",
    eyebrow: "Intelligent ausgestattet",
    description: "Innovative Kalkschutz-Duschfilter und Smart-Home-Technik für dein Zuhause.",
  },
];

async function getProducts(): Promise<Product[]> {
  try {
    return await sanityClient.fetch<Product[]>(productsQuery, {}, { next: { revalidate: 60 } });
  } catch (error) {
    console.error("Sanity products could not be loaded", error);
    return [];
  }
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card" key={product._id}>
      <div className="product-image-wrap">
        {product.imageUrl ? (
          <img className="product-image" src={product.imageUrl} alt={product.name || "Sanitärprodukt"} loading="lazy" />
        ) : (
          <div className="product-image" role="img" aria-label="Kein Produktbild vorhanden" />
        )}
      </div>
      <div className="product-content">
        <span className="product-category">Heinze Filter</span>
        <h3>{product.name || "Produkt ohne Namen"}</h3>
        <p className="product-description">{product.description || "Praktische Qualität für Bad und Zuhause."}</p>
        <div className="product-bottom">
          <span className="product-price">{typeof product.price === "number" ? euro.format(product.price) : "Preis auf Anfrage"}</span>
          <Link className="product-link" href="/storefront.html">Zum Produkt ↗</Link>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="Heinze Filter Startseite">
            <span style={{ color: "#172d35", fontWeight: 800 }}>HEINZE</span>
            <span style={{ color: "#5a9b9b", fontWeight: 500 }}> FILTER</span>
          </Link>
          <nav className="nav-links" aria-label="Hauptnavigation">
            <a href="#neuheiten">Neuheiten</a>
            <a href="#wohnen">Wohnen</a>
            <a href="#technik">Technik</a>
          </nav>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">HEINZE FILTER · BAD &amp; SMART LIVING</p>
            <h1>Mehr Komfort.<br />Weniger Kalk.</h1>
            <p>Entdecke moderne Sanitärprodukte, innovative Duschfilter gegen Kalkablagerungen und intelligente Smart-Home-Lösungen – für ein besseres Gefühl in deinem Zuhause.</p>
            <a className="primary-button" href="#neuheiten">Produkte entdecken ↘</a>
          </div>
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=85"
            alt="Modernes Badezimmer mit hochwertiger Ausstattung"
          />
        </section>

        <section className="section" aria-label="Produktkategorien">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Ausgewählt für Bad und Zuhause</p>
              <h2>Finde deine passende Lösung</h2>
            </div>
            <p>{products.length.toString().padStart(2, "0")} Produkte</p>
          </div>

          {categories.map((category) => {
            const categoryProducts = products.filter((product) => product.category === category.id);
            return (
              <section id={category.id} className="section" key={category.id}>
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{category.eyebrow}</p>
                    <h2>{category.title}</h2>
                    <p>{category.description}</p>
                  </div>
                  <a className="product-link" href="/storefront.html">Alle Produkte ↗</a>
                </div>
                {categoryProducts.length > 0 ? (
                  <div className="product-grid">
                    {categoryProducts.map((product) => <ProductCard product={product} key={product._id} />)}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>Produkte folgen in Kürze</h3>
                    <p>Diese Kategorie ist vorbereitet. Neue Produkte werden künftig direkt über unseren Chat-Workflow vorbereitet und anschließend in den Shop übernommen.</p>
                  </div>
                )}
              </section>
            );
          })}
        </section>

        <section id="ueber-uns" className="shop-banner">
          <div>
            <p className="eyebrow">Heinze Filter · Sanitär &amp; Smart Home</p>
            <h2>Weniger Kalk. Mehr Wohlgefühl.</h2>
            <p>Von modernen Sanitärlösungen bis zu Duschfiltern mit Kalkschutz und smarter Technik: Entdecke ausgewählte Produkte für dein Zuhause.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} Heinze Filter. Alle Rechte vorbehalten.</span>
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
