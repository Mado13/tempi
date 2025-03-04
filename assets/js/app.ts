
// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

import axios from "axios";
import { createInertiaApp } from "@inertiajs/inertia-svelte";
import { Page } from "@inertiajs/inertia";
import { mount } from 'svelte'
import type { SvelteComponent } from "svelte";
import "phoenix_html"

// CSRF setup
axios.defaults.xsrfHeaderName = "x-csrf-token";

createInertiaApp({
  resolve: async (name: string): Promise<typeof SvelteComponent> => {
    const pages = import.meta.glob("./pages/**/*.svelte");
    const page = pages[`./pages/${name}.svelte`] as unknown as () => Promise<typeof SvelteComponent>;
    if (!page) {
      throw new Error(`Page ${name} not found.`);
    }
    return page();
  },
  setup({ el, App, props }: { el: Element; App: typeof SvelteComponent; props: Page }) {
    mount(App, { target: el, props });
  },
});

