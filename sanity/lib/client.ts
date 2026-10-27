import { createClient } from "next-sanity";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "6k8xozbn";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2026-10-27",
  useCdn: true,
});
