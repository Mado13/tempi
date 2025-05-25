import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { preprocessMeltUI, sequence } from '@melt-ui/pp'

export default {
  preprocess: sequence([
    vitePreprocess({
      script: true,
      style: {
        css: {
          preprocessorOptions: {
            scss: { 
              additionalData: `@use '@/styles/variables.scss' as *;\n`
            },
          },
        },
      },
    }),
    preprocessMeltUI(),
  ]),
  
  compilerOptions: {
    modernAst: true,
  }
}
