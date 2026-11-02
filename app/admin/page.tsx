"use client";

import { FormEvent, ChangeEvent, useEffect, useState } from "react";

type Destination = "discount" | "regular";
type Category = "duschen" | "wasserfilter" | "smart-home" | "badzubehoer" | "haushalt-wohnen";
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  destination: Destination;
  category: Category;
  image_url: string;
  active: boolean;
};

const categoryOptions: Record<Destination, { value: Category; label: string }[]> = {
  discount: [
    { value: "duschen", label: "Dush" },
    { value: "wasserfilter", label: "Filtra uji" },
    { value: "smart-home", label: "Shtëpi inteligjente" },
  ],
  regular: [
    { value: "badzubehoer", label: "Pajisje banjoje" },
    { value: "haushalt-wohnen", label: "Shtëpi dhe banim" },
  ],
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  old_price: "",
  destination: "discount" as Destination,
  category: "duschen" as Category,
  image_url: "",
  active: true,
};

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refreshSession() {
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await response.json();
      setAuthenticated(Boolean(data.authenticated));
    } catch {
      setError("Lidhja dështoi. Ju lutemi provoni përsëri.");
    } finally {
      setChecking(false);
    }
  }

  async function loadProducts() {
    setError("");
    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Produktet nuk u ngarkuan.");
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Produktet nuk u ngarkuan.");
    }
  }

  useEffect(() => { void refreshSession(); }, []);
  useEffect(() => { if (authenticated) void loadProducts(); }, [authenticated]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Hyrja dështoi.");
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hyrja dështoi.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setProducts([]);
  }

  function changeDestination(destination: Destination) {
    setForm((current) => ({ ...current, destination, category: categoryOptions[destination][0].value }));
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ngarkimi i fotografisë dështoi.");
      setForm((current) => ({ ...current, image_url: data.image_url }));
      setNotice("Fotografia u ngarkua me sukses.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ngarkimi i fotografisë dështoi.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      old_price: product.old_price === null ? "" : String(product.old_price),
      destination: product.destination,
      category: product.category,
      image_url: product.image_url,
      active: product.active,
    });
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        old_price: form.old_price.trim() ? Number(form.old_price) : null,
      };
      const response = await fetch(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Produkti nuk u ruajt.");
      setNotice(editingId ? "Produkti u përditësua." : "Produkti u shtua.");
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Produkti nuk u ruajt.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`A dëshironi ta fshini produktin „${product.name}“?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Produkti nuk u fshi.");
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingId === product.id) resetForm();
      setNotice("Produkti u fshi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Produkti nuk u fshi.");
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = { boxSizing: "border-box" as const, width: "100%", padding: 12, border: "1px solid #ccd6da", borderRadius: 9, fontSize: 15, background: "#fff" };
  const labelStyle = { display: "block", marginBottom: 7, fontSize: 13, fontWeight: 700 as const };

  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "#f3f6f7", color: "#172d35", fontFamily: "Arial, sans-serif" }}>
      <div style={{ width: "min(1050px, 100%)", margin: "0 auto" }}>
        <header style={{ margin: "12px 0 24px" }}>
          <p style={{ margin: "0 0 7px", color: "#5a9b9b", fontSize: 12, fontWeight: 800, letterSpacing: ".12em" }}>HEINZE FILTER</p>
          <h1 style={{ margin: 0, fontSize: 30 }}>Menaxhimi i produkteve</h1>
        </header>
        {checking ? <section style={{ background: "#fff", padding: 28, borderRadius: 16 }}>Ju lutemi prisni …</section> : !authenticated ? (
          <section style={{ width: "min(440px, 100%)", padding: 30, borderRadius: 18, background: "#fff", boxShadow: "0 18px 55px rgba(20,47,56,.08)" }}>
            <h2 style={{ marginTop: 0 }}>Hyrja e administratorit</h2>
            <form onSubmit={login}>
              <label htmlFor="admin-password" style={labelStyle}>Fjalëkalimi i administratorit</label>
              <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ ...inputStyle, marginBottom: 15 }} />
              <button disabled={busy} type="submit" style={{ width: "100%", padding: 14, border: 0, borderRadius: 9, background: "#173b63", color: "#fff", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>{busy ? "Duke hyrë …" : "Hyr"}</button>
            </form>
          </section>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
              <p style={{ margin: 0, color: "#607078" }}>Menaxho produktet · {products.length} të ruajtura</p>
              <button onClick={logout} style={{ padding: "10px 16px", border: "1px solid #cbd5d9", borderRadius: 9, background: "#fff", cursor: "pointer" }}>Dil nga llogaria</button>
            </div>
            <section style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 12px 35px rgba(20,47,56,.06)", marginBottom: 24 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 21 }}>{editingId ? "Ndrysho produktin" : "Shto produkt të ri"}</h2>
              <form onSubmit={saveProduct}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="product-name" style={labelStyle}>Emri i produktit</label>
                    <input id="product-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="product-description" style={labelStyle}>Përshkrimi</label>
                    <textarea id="product-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                  <div>
                    <label htmlFor="product-price" style={labelStyle}>Çmimi i shitjes (€)</label>
                    <input id="product-price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="product-old-price" style={labelStyle}>Çmimi i mëparshëm (€) – sipas dëshirës</label>
                    <input id="product-old-price" type="number" min="0" step="0.01" value={form.old_price} onChange={(e) => setForm({ ...form, old_price: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="product-destination" style={labelStyle}>Ku dëshironi të shfaqet produkti?</label>
                    <select id="product-destination" value={form.destination} onChange={(e) => changeDestination(e.target.value as Destination)} style={inputStyle}>
                      <option value="discount">Faqja kryesore – Ofertat</option>
                      <option value="regular">Produktet e tjera</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="product-category" style={labelStyle}>Kategoria</label>
                    <select id="product-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} style={inputStyle}>
                      {categoryOptions[form.destination].map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="product-image" style={labelStyle}>Fotografia e produktit (JPG, PNG ose WEBP, maksimumi 5 MB)</label>
                    <input id="product-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} disabled={uploading} style={{ display: "block", width: "100%", padding: 10, border: "1px dashed #aebdc3", borderRadius: 9 }} />
                    {uploading ? <p style={{ color: "#607078", fontSize: 13 }}>Fotografia po ngarkohet …</p> : null}
                    {form.image_url ? <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}><img src={form.image_url} alt="Pamja paraprake e produktit" style={{ width: 100, height: 90, objectFit: "contain", borderRadius: 8, border: "1px solid #e1e7e9" }} /><span style={{ color: "#607078", fontSize: 12, overflowWrap: "anywhere" }}>Fotografia është gati</span></div> : <p style={{ color: "#607078", fontSize: 13 }}>Ju lutemi ngarkoni fotografinë para se ta ruani produktin.</p>}
                  </div>
                  <label style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 14 }}><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Shfaq produktin në dyqan</label>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
                  <button disabled={busy || uploading} type="submit" style={{ padding: "13px 20px", border: 0, borderRadius: 9, background: "#173b63", color: "#fff", fontWeight: 700, cursor: busy || uploading ? "wait" : "pointer" }}>{busy ? "Duke ruajtur …" : editingId ? "Ruaj ndryshimet" : "Shto produktin"}</button>
                  {editingId ? <button type="button" onClick={resetForm} style={{ padding: "13px 18px", border: "1px solid #cbd5d9", borderRadius: 9, background: "#fff", cursor: "pointer" }}>Anulo</button> : null}
                </div>
              </form>
            </section>
            {error ? <p role="alert" style={{ padding: 13, borderRadius: 9, background: "#fff1f0", color: "#b42318" }}>{error}</p> : null}
            {notice ? <p role="status" style={{ padding: 13, borderRadius: 9, background: "#eaf5f2", color: "#176b55" }}>{notice}</p> : null}
            <section style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 12px 35px rgba(20,47,56,.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}><h2 style={{ margin: 0, fontSize: 21 }}>Produktet e ruajtura</h2><button onClick={() => void loadProducts()} style={{ border: "1px solid #cbd5d9", background: "#fff", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>Rifresko</button></div>
              {products.length === 0 ? <p style={{ color: "#607078" }}>Noch keine Produkte të ruajtura.</p> : <div style={{ display: "grid", gap: 12 }}>
                {products.map((product) => <article key={product.id} style={{ display: "grid", gridTemplateColumns: "76px minmax(0,1fr) auto", gap: 14, alignItems: "center", padding: 12, border: "1px solid #e4eaec", borderRadius: 12 }}>
                  <img src={product.image_url} alt="" style={{ width: 76, height: 70, objectFit: "contain", borderRadius: 8, background: "#f7f9f9" }} />
                  <div style={{ minWidth: 0 }}><strong>{product.name}</strong><p style={{ margin: "5px 0", color: "#607078", fontSize: 13 }}>{product.destination === "discount" ? "Faqja kryesore – Ofertat" : "Produktet e tjera"} · {categoryOptions[product.destination].find((item) => item.value === product.category)?.label} · {euro.format(product.price)}{product.old_price ? ` (në vend të ${euro.format(product.old_price)})` : ""}</p><span style={{ fontSize: 12, color: product.active ? "#176b55" : "#8b5555" }}>{product.active ? "I dukshëm në dyqan" : "I fshehur nga dyqani"}</span></div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "flex-end" }}><button onClick={() => editProduct(product)} style={{ padding: "8px 10px", border: "1px solid #cbd5d9", borderRadius: 8, background: "#fff", cursor: "pointer" }}>Ndrysho</button><button disabled={busy} onClick={() => void deleteProduct(product)} style={{ padding: "8px 10px", border: "1px solid #e7caca", borderRadius: 8, background: "#fff", color: "#a12b2b", cursor: "pointer" }}>Fshi</button></div>
                </article>)}
              </div>}
            </section>
          </>
        )}
        {error && !authenticated ? <p role="alert" style={{ color: "#b42318", marginTop: 14 }}>{error}</p> : null}
      </div>
    </main>
  );
}
