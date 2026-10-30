"use client";

import { useEffect, useState } from "react";

type PresenceResponse = { activeCount?: number | null };

const VISITOR_KEY = "heinze-visitor-presence-id";

function getVisitorId() {
  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = window.crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function LiveVisitors() {
  const [activeCount, setActiveCount] = useState<number | null>(null);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const updatePresence = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId: getVisitorId() }),
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Presence service unavailable");
        const data = (await response.json()) as PresenceResponse;
        if (!stopped) setActiveCount(typeof data.activeCount === "number" ? data.activeCount : null);
      } catch {
        if (!stopped) setActiveCount(null);
      }
    };

    void updatePresence();
    timer = setInterval(() => void updatePresence(), 15000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void updatePresence();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (activeCount === null || activeCount <= 6) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 30,
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        padding: "11px 15px",
        border: "1px solid rgba(30,120,75,.18)",
        borderRadius: 999,
        background: "rgba(255,255,255,.96)",
        boxShadow: "0 8px 28px rgba(0,0,0,.12)",
        color: "#173b2b",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 0 4px rgba(22,163,74,.12)" }} />
      {activeCount} Besucher gerade aktiv
    </div>
  );
}
