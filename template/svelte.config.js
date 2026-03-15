import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess(), mdsvex()],

  kit: {
    adapter: adapter(),

    typescript: {
      config: (config) => {
        config.compilerOptions = config.compilerOptions || {};

        if (!config.compilerOptions.types) {
          config.compilerOptions.types = [];
        }

        const typesToAdd = ['vitest/browser', '@playwright/test', '@vitest/browser-playwright'];

        for (const type of typesToAdd) {
          if (!config.compilerOptions.types.includes(type)) {
            config.compilerOptions.types.push(type);
          }
        }

        return config;
      }
    }
  },

  extensions: ['.svelte', '.svx']
};

export default config;
