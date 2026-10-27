import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Produkt",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Emri i produktit",
      type: "string",
      validation: (rule) => rule.required().min(2).max(120),
    }),
    defineField({
      name: "price",
      title: "Çmimi (EUR)",
      type: "number",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: "image",
      title: "Imazhi",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Përshkrimi",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().min(5).max(1000),
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
      subtitle: "price",
    },
    prepare({ title, media, subtitle }) {
      return {
        title,
        media,
        subtitle: typeof subtitle === "number" ? subtitle.toFixed(2) + " €" : "Pa çmim",
      };
    },
  },
});
