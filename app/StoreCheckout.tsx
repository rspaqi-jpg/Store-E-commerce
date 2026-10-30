"use client";

import Script from "next/script";
import { useLanguage } from "./Locale";
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
};
type Customer = {
  email: string;
  name: string;
  street: string;
  zip: string;
  city: string;
  phone: string;
  country: string;
};
type PayPalButtonsInstance = { render: (selector: string) => Promise<void> };
type PayPalNamespace = {
  Buttons: (options: {
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onCancel?: () => void;
    onError?: (error: unknown) => void;
  }) => PayPalButtonsInstance;
};
declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

const CheckoutContext = createContext<{ buy: (product: Product) => void } | null>(null);

export function AddToCartButton({ product }: { product: Product }) {
  const { t } = useLanguage();
  const checkout = useContext(CheckoutContext);
  return (
    <button
      className="product-link"
      type="button"
      onClick={() => checkout?.buy(product)}
      style={{ background: "#ffc439", borderColor: "#ffc439", cursor: "pointer" }}
    >
      {t("Mit PayPal kaufen")}
    </button>
  );
}

export function StoreCheckoutProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [clientId, setClientId] = useState(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "");
  const [product, setProduct] = useState<Product | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const buttonsRef = useRef<HTMLDivElement | null>(null);
  const mountedButtons = useRef(false);

  const buy = (selected: Product) => {
    setProduct(selected);
    setCustomer(null);
    setMessage("");
    setSuccess(false);
    setBusy(false);
    mountedButtons.current = false;
  };

  useEffect(() => {
    if (clientId) return;
    let cancelled = false;
    fetch("/api/paypal/config", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.clientId) throw new Error(data.error || "PayPal Client ID fehlt.");
        if (!cancelled) setClientId(String(data.clientId));
      })
      .catch(() => {
        if (!cancelled) setMessage("PayPal Client ID fehlt in den Vercel Production Environment Variables.");
      });
    return () => { cancelled = true; };
  }, [clientId]);

  useEffect(() => {
    if (!product || !customer || !sdkReady || !window.paypal || !buttonsRef.current || mountedButtons.current) return;
    mountedButtons.current = true;
    buttonsRef.current.replaceChildren();
    const instance = window.paypal.Buttons({
      createOrder: async () => {
        setBusy(true);
        setMessage("");
        try {
          const response = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: [{ id: product._id, quantity: 1 }],
              customer: {
                email: customer.email,
                name: customer.name,
                street: customer.street,
                zip: customer.zip,
                city: customer.city,
                phone: customer.phone,
                country: customer.country,
              },
            }),
          });
          const data = await response.json();
          if (!response.ok || !data.orderId) {
            const error = new Error(data.error || `PayPal could not start checkout (HTTP ${response.status}).`);
            setMessage(error.message);
            throw error;
          }
          return data.orderId as string;
        } catch (error) {
          setBusy(false);
          if (error instanceof Error) setMessage(error.message);
          throw error;
        }
      },
      onApprove: async ({ orderID }) => {
        const response = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderID }),
        });
        const data = await response.json();
        if (!response.ok || data.status !== "COMPLETED") throw new Error(data.error || "Die Zahlung konnte nicht bestätigt werden.");
        setSuccess(true);
        setMessage(t("Zahlung erfolgreich. Vielen Dank für deine Bestellung!"));
        setCustomer(null);
      },
      onCancel: () => setMessage(t("Die PayPal-Zahlung wurde abgebrochen. Du kannst es erneut versuchen.")),
      onError: (error) => {
        console.error("PayPal Buttons error", error);
        setBusy(false);
        setMessage((current) => current || "PayPal konnte nicht gestartet werden. Öffne die Entwicklerkonsole oder prüfe die Vercel Runtime Logs für Details.");
      },
    });
    instance.render("#paypal-button-container").catch((error: unknown) => {
      console.error("PayPal button render failed", error);
      setMessage("Die PayPal-Schaltfläche konnte nicht geladen werden.");
      mountedButtons.current = false;
    });
  }, [product, customer, sdkReady]);

  const close = () => {
    setProduct(null);
    setCustomer(null);
    setMessage("");
    setSuccess(false);
    setBusy(false);
    mountedButtons.current = false;
  };

  return (
    <CheckoutContext.Provider value={{ buy }}>
      {clientId ? (
        <Script
          id="paypal-live-sdk"
          src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=EUR&intent=capture&components=buttons`}
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
          onError={() => setMessage("PayPal konnte nicht geladen werden. Bitte prüfe die Client ID Live in Vercel.")}
        />
      ) : null}
      {children}
      {product ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
          onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
          style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", overflowY: "auto", padding: 16, background: "rgba(15,15,15,.58)", backdropFilter: "blur(7px)" }}
        >
          <section style={{ width: "min(100%, 540px)", maxHeight: "92vh", overflowY: "auto", borderRadius: 24, padding: 26, background: "#fdfdfb", boxShadow: "0 24px 80px rgba(0,0,0,.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
              <div>
                <p className="eyebrow">{t("Sicherer Checkout")}</p>
                <h2 id="checkout-title" style={{ margin: "8px 0 0", fontSize: 26, letterSpacing: "-.04em" }}>{t("Deine Lieferadresse")}</h2>
              </div>
              <button type="button" onClick={close} aria-label="Checkout schließen" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "7px 12px", background: "transparent", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, margin: "20px 0", padding: 15, borderRadius: 16, background: "#efeee9" }}>
              <span>{product.name}</span><strong>{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(product.price)}</strong>
            </div>
            {!customer && !success ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  setCustomer({
                    email: String(data.get("email") || "").trim(),
                    name: String(data.get("name") || "").trim(),
                    street: String(data.get("street") || "").trim(),
                    zip: String(data.get("zip") || "").trim(),
                    city: String(data.get("city") || "").trim(),
                    phone: String(data.get("phone") || "").trim(),
                    country: String(data.get("country") || "").trim(),
                  });
                }}
                style={{ display: "grid", gap: 12 }}
              >
                {[
                  { name: "email", label: "E-Mail-Adresse", type: "email", auto: "email", placeholder: "du@example.com" },
                  { name: "name", label: "Vor- und Nachname", type: "text", auto: "name", placeholder: "Max Mustermann" },
                  { name: "street", label: "Straße und Hausnummer", type: "text", auto: "street-address", placeholder: "Musterstraße 12" },
                ].map((field) => (
                  <label key={field.name} style={{ display: "grid", gap: 5, fontSize: 13 }}>
                    {t(field.label)}
                    <input name={field.name} type={field.type} autoComplete={field.auto} placeholder={field.placeholder} required style={inputStyle} />
                  </label>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={labelStyle}>{t("Postleitzahl")}<input name="zip" autoComplete="postal-code" required placeholder="10115" style={inputStyle} /></label>
                  <label style={labelStyle}>{t("Stadt")}<input name="city" autoComplete="address-level2" required placeholder="Berlin" style={inputStyle} /></label>
                </div>
                <label style={labelStyle}>{t("Telefonnummer")}<input name="phone" type="tel" autoComplete="tel" required placeholder="+49 ..." style={inputStyle} /></label>
                <label style={labelStyle}>{t("Land")}<input name="country" autoComplete="country-name" required placeholder="Deutschland" style={inputStyle} /></label>
                <button type="submit" className="primary-button" style={{ border: 0, cursor: "pointer", marginTop: 4 }}>{t("Weiter zu PayPal")}</button>
                {!clientId ? <p role="alert" style={{ color: "#9a3412", fontSize: 13 }}>NEXT_PUBLIC_PAYPAL_CLIENT_ID fehlt in den Vercel Production Environment Variables.</p> : null}
              </form>
            ) : null}
            {customer && !success ? (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 13, color: "#686868", lineHeight: 1.6 }}>{t("Prüfe die Daten und schließe die Zahlung sicher über PayPal ab.")}</p>
                <div id="paypal-button-container" ref={buttonsRef} style={{ minHeight: 48, marginTop: 14 }} />
                {busy ? <p style={{ fontSize: 12, color: "#686868" }}>{t("PayPal wird geöffnet…")}</p> : null}
                <button type="button" onClick={() => { setCustomer(null); mountedButtons.current = false; setMessage(""); }} style={{ marginTop: 8, border: 0, background: "transparent", textDecoration: "underline", cursor: "pointer", fontSize: 12 }}>{t("Lieferdaten bearbeiten")}</button>
              </div>
            ) : null}
            {message ? <p role="status" style={{ marginTop: 14, borderRadius: 12, padding: 12, background: success ? "#ecfdf5" : "#fff7ed", color: success ? "#065f46" : "#9a3412", fontSize: 13 }}>{message}</p> : null}
            {success ? <button type="button" className="primary-button" onClick={close}>{t("Schließen")}</button> : null}
            {!clientId && customer ? <p role="alert" style={{ marginTop: 12, color: "#9a3412", fontSize: 13 }}>PayPal Live ist noch nicht konfiguriert: NEXT_PUBLIC_PAYPAL_CLIENT_ID fehlt.</p> : null}
          </section>
        </div>
      ) : null}
    </CheckoutContext.Provider>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  marginTop: 3,
  border: "1px solid rgba(0,0,0,.12)",
  borderRadius: 12,
  background: "#fff",
  padding: "12px 13px",
  font: "inherit",
  outlineOffset: 2,
};
const labelStyle: CSSProperties = { display: "grid", gap: 5, fontSize: 13 };
