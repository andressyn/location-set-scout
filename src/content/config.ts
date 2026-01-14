import { defineCollection, z } from "astro:content";

const pagesCollection = defineCollection({
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			subtitle: z.optional(z.string()),
			type: z.string(),
			lastUpdateDate: z.date(),
			hideTitle: z.optional(z.boolean()),
			hidden: z.optional(z.boolean()),
			cover: z.optional(image()),
			seo: z.object({
				title: z.string(),
				description: z.string(),
				author: z.string(),
			}),
		}),
});

const postsCollection = defineCollection({
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			pubDate: z.date(),
			lastUpdateDate: z.date(),
			description: z.string(),
			category: z.string(),
			author: z.string(),
			cover: image(),
			tags: z.array(z.string()),
			hidden: z.optional(z.boolean()),
		}),
});

const worksCollection = defineCollection({
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			pubDate: z.date(),
			lastUpdateDate: z.date(),
			cover: image(),
			video: z.optional(z.string()),
			description: z.string(),
			link: z.optional(z.string()),
			tags: z.array(z.string()),
			hidden: z.optional(z.boolean()),
		}),
});

const authorsCollection = defineCollection({
	type: "content",
	schema: z.object({
		name: z.string(),
		bio: z.optional(z.string()),
		avatar: z.optional(z.string()),
	}),
});

const globalCollection = defineCollection({
	type: "data",
	schema: z.any(),
});

export const collections = {
	posts: postsCollection,
	pages: pagesCollection,
	works: worksCollection,
	authors: authorsCollection,
	global: globalCollection,
};
