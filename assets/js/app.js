import axios from "axios";
import { createInertiaApp} from "@inertiajs/svelte";
import { mount, hydrate } from "svelte";
import "phoenix_html";
import { setupPWA } from "./pwa-setup";
import { Inertia } from "@inertiajs/inertia";
import '../styles/global.scss';

window.pwa = {};
window.isPWAInstalled = false;

// Patch Inertia’s requests to use the correct header
axios.defaults.xsrfHeaderName = "x-csrf-token";
Inertia.on('before', (event) => {
  const getCookieValue = (name) => {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  };

  const token = getCookieValue('XSRF-TOKEN');
  
  if (token) {
    event.detail.visit.headers['x-csrf-token'] = token;
    delete event.detail.visit.headers['x-xsrf-token']; // Remove the wrong header
  }
});

createInertiaApp({
  resolve: async (name)=> {
    const pages = import.meta.glob("./pages/**/*.svelte");
    const pageKey = `./pages/${name}.svelte`;
    const page = pages[pageKey]
    if (!page) {
      throw new Error(`Page ${name} not found`);
    }
    return page();
  },
  setup({el, App, props}) {
    const enhancedProps = {
      ...props,
      pwaInstalled: window.isPWAInstalled ?? false,
    };
    if (el.dataset.serverRendered === 'true') {
        hydrate(App, { target: el, props: enhancedProps })
      } else {
        mount(App, { target: el, props: enhancedProps })
      }
  },
});

setupPWA();
