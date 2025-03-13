import axios from "axios";
import { createInertiaApp } from "@inertiajs/inertia-svelte";
import { Page } from "@inertiajs/inertia";
import { mount } from "svelte";
import type { SvelteComponent } from "svelte";
import "phoenix_html";
import { setupPWA } from "./pwa-setup";

axios.defaults.xsrfHeaderName = "x-csrf-token";

declare global {
  interface Window {
    isPWAInstalled: boolean;
  }
}

createInertiaApp({
  resolve: async (name: string): Promise<typeof SvelteComponent> => {
    const pages = import.meta.glob("./pages/**/*.svelte");
    const pageKey = `./pages/${name}.svelte`;
    const page = pages[pageKey] as unknown as () => Promise<
      typeof SvelteComponent
    >;
    if (!page) {
      throw new Error(`Page ${name} not found`);
    }
    return page();
  },
  setup({
    el,
    App,
    props,
  }: {
    el: Element;
    App: typeof SvelteComponent;
    props: Page;
  }) {
    const enhancedProps = {
      ...props,
      pwaInstalled: window.isPWAInstalled ?? false,
    };
    mount(App, { target: el, props: enhancedProps });
  },
});

setupPWA();
