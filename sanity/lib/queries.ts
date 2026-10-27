import { defineQuery } from "next-sanity";

export const productsQuery = defineQuery(
  '*[_type == "product"] | order(_createdAt desc) { _id, name, category, price, description, "imageUrl": image.asset->url }'
);
