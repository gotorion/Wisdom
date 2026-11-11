import { defineConfig } from 'astro/config';
import { rehypeSiteLinks } from './src/lib/rehype-site-links.mjs';

// Deployed as a GitHub project page: https://gotorion.github.io/Wisdom/
export default defineConfig({
  site: 'https://gotorion.github.io',
  base: '/Wisdom',
  markdown: {
    rehypePlugins: [rehypeSiteLinks],
  },
});
