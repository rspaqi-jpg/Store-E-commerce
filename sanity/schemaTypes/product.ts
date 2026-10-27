import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Produkt",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Produktname",
      type: "string",
      validation: (rule) => rule.required().min(2).max(120),
    }),
    defineField({
      name: "category",
      title: "Kategorie",
      type: "string",
      options: {
        list: [
          { title: "Neuheiten", value: "neuheiten" },
          { title: "Wohnen", value: "wohnen" },
          { title: "Technik", value: "technik" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "Preis (EUR)",
      type: "number",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: "image",
      title: "Produktbild",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Beschreibung",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().min(5).max(1000),
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
      subtitle: "category",
    },
    prepare({ title, media, subtitle }) {
      const labels: Record<string, string> = {
        neuheiten: "Neuheiten",
        wohnen: "Wohnen",
        technik: "Technik",
      };
      return {
        title,
        media,
        subtitle: labels[subtitle] || "Kategorie auswählen",
      };
    },
  },
});
