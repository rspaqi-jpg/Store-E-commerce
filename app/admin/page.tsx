"use client";

import { FormEvent, useEffect, useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refreshSession() {
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await response.json();
      setAuthenticated(Boolean(data.authenticated));
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => { void refreshSession(); }, []);

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
      if (!response.ok) throw new Error(data.error || "Anmeldung fehlgeschlagen.");
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f3f6f7", color: "#172d35", fontFamily: "Arial, sans-serif" }}>
      <section style={{ width: "min(440px, 100%)", padding: 32, borderRadius: 20, background: "#fff", boxShadow: "0 18px 55px rgba(20,47,56,.10)" }}>
        <p style={{ margin: "0 0 8px", color: "#5a9b9b", fontSize: 12, fontWeight: 800, letterSpacing: ".12em" }}>HEINZE FILTER</p>
        <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>Administrator</h1>
        {checking ? <p>Bitte warten …</p> : authenticated ? (
          <>
            <p style={{ lineHeight: 1.6 }}>Du bist sicher angemeldet.</p>
            <p style={{ color: "#607078", fontSize: 14, lineHeight: 1.6 }}>Der geschützte Admin-Zugang ist aktiv. Die Produktverwaltung wird als nächster Schritt mit dem dauerhaften Produktspeicher verbunden.</p>
            <button onClick={logout} style={{ width: "100%", padding: 13, border: 0, borderRadius: 10, background: "#173b63", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Abmelden</button>
          </>
        ) : (
          <form onSubmit={login}>
            <p style={{ margin: "0 0 20px", color: "#607078", lineHeight: 1.5 }}>Melde dich an, um den privaten Verwaltungsbereich zu öffnen.</p>
            <label htmlFor="admin-password" style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 700 }}>Passwort</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ boxSizing: "border-box", width: "100%", padding: 14, border: "1px solid #ccd6da", borderRadius: 10, fontSize: 16, marginBottom: 14 }} />
            <button disabled={busy} type="submit" style={{ width: "100%", padding: 14, border: 0, borderRadius: 10, background: "#173b63", color: "#fff", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>{busy ? "Anmeldung …" : "Anmelden"}</button>
            {error ? <p role="alert" style={{ color: "#b42318", fontSize: 13, marginBottom: 0 }}>{error}</p> : null}
          </form>
        )}
      </section>
    </main>
  );
}
