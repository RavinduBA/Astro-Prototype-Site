import {z, defineCollection} from "astro:content"

// This file defines the content collections for an Astro project.

// This defines a collection for authors.
const authorsCollection = defineCollection({
    schema: ({image}) =>
        z.object({
            name: z.string(),
            image: image(),
        }),
})

// This defines a collection for blog posts.
const postsCollection = defineCollection({
    schema: z.object({
            author: z.string(),
            date: z.string(),
            image: z.string(),
            title: z.string(),
        }),
});

//This object registers the collections.
//The keys (authors, posts) must match the folder names inside your src/content directory.

export const collections = {
    authors: authorsCollection,
    posts: postsCollection,  
};
