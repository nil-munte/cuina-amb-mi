import { defineConfig } from 'astro/config';
import rehypePanels from './src/plugins/rehype-panels.mjs';

export default defineConfig({
  site: 'https://nil-munte.github.io',
  base: '/cuina-amb-mi',
  markdown: {
    rehypePlugins: [rehypePanels],
  },
});
