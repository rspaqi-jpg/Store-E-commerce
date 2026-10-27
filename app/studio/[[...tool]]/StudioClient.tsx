"use client";

import dynamic from "next/dynamic";
import config from "../../../sanity.config";

const NextStudio = dynamic(
  () => import("next-sanity/studio").then((mod) => mod.NextStudio),
  { ssr: false, loading: () => <div style={{ padding: 24 }}>Duke hapur panelin...</div> },
);

export default function StudioClient() {
  return <NextStudio config={config} />;
}
