import '../styles/global.scss';

import axios from "axios";
import Layout from './Layout.svelte'

import { camelToSnakeCase } from "./helpers/camel-to-snake.ts"
import { createInertiaApp } from "@inertiajs/svelte";
import { Inertia } from "@inertiajs/inertia";
import { mount, hydrate } from "svelte";
import "phoenix_html";
import { setupPWA } from "./pwa-setup";

// Initialize application state
window.pwa = {};
window.isPWAInstalled = false;

// Configure HTTP requests
const configureAxios = () => {
  axios.defaults.xsrfHeaderName = "x-csrf-token";
  
  // Add CSRF token to Inertia requests
  Inertia.on('before', (event) => {
    const token = getCookieValue('XSRF-TOKEN');
    
    if (token) {
      event.detail.visit.headers['x-csrf-token'] = token;
      delete event.detail.visit.headers['x-xsrf-token']; // Remove incorrect header
    }

    if (event.detail.visit.data) {
      event.detail.visit.data = camelToSnakeCase(event.detail.visit.data);
    }
  });
};

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

// Initialize Inertia application
const initApp = () => {
  createInertiaApp({
    // Resolve page components
    resolve: name => {
      const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true })
      let page = pages[`./Pages/${name}.svelte`]
      return { 
        default: page.default, 
        layout:  name.startsWith('Auth/') ? undefined : Layout }

    },
    
    // Mount the application
    setup({ el, App, props }) {
      const enhancedProps = {
        ...props,
        pwaInstalled: window.isPWAInstalled ?? false,
      };
      
      // Use hydration for server-rendered content, otherwise mount
      if (el.dataset.serverRendered === 'true') {
        hydrate(App, { target: el, props: enhancedProps });
      } else {
        mount(App, { target: el, props: enhancedProps });
      }
    },
  });
};

// Application bootstrap
const bootstrap = async () => {
  configureAxios();
  initApp();
  setupPWA();
};

// Start the application
bootstrap().catch(err => console.error('Bootstrap error:', err));
