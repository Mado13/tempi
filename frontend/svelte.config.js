import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { preprocessMeltUI } from '@melt-ui/pp'

export default {
  preprocess: [
    vitePreprocess(),
    preprocessMeltUI(),
  ],
  
  compilerOptions: {
    modernAst: true,
  },
  onwarn: (warning, handler) => {
    if (warning.code === 'css-unused-selector' && 
        warning.message.includes('[data-melt-')) {
      return;
    }
    handler(warning);
  }
}
