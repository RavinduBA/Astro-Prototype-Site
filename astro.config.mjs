// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages configuration
  site: 'https://RavinduBA.github.io', // Replace with your GitHub username
  base: '/Rythem-Nation-Astro-blog-site-', // Replace with your repository name
  
  vite: {
    plugins: [tailwindcss()]
  }
});