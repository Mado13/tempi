import { adapter as svelte } from "@wuchale/svelte"
import { defineConfig } from "wuchale"
import { defaultHeuristic } from "wuchale/adapters"

export default defineConfig({
    locales: {
        he: {name: 'hebrew'},
    },
    adapters: {
      svelte: svelte({
      files: ['./src/lib/i18n/*.ts', './src/lib/schemas/*.ts', './src/**/*.svelte'],
      heuristic: (txt, details) => {
        console.log({txt, details})
        const isVObjectCall = details.topLevelCall === 'v.object';
        const startsWithCapital = /\p{L}/u.test(txt[0]) && !/[a-z]/.test(txt[0]);
        if (isVObjectCall && startsWithCapital) {
          return true;
        }

        return defaultHeuristic(txt, details)
      }
    }),
  }
})
