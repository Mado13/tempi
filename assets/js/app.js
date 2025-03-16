import axios from "axios";
import { createInertiaApp } from "@inertiajs/svelte";
import { Inertia } from "@inertiajs/inertia";
import { mount, hydrate } from "svelte";
import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';
import "phoenix_html";
import { setupPWA } from "./pwa-setup";
import '../styles/global.scss';

// Initialize application state
window.pwa = {};
window.isPWAInstalled = false;

// Configure i18n (internationalization)
const setupI18n = () => {
  // Register language packs
  register('en', () => import('../lang/en.json'));
  register('he', () => import('../lang/he.json'));
  
  // Initialize with browser's preferred language
  init({
    fallbackLocale: 'en',
    initialLocale: getLocaleFromNavigator(),
  });
  
  // Handle RTL for Hebrew
  locale.subscribe((lang) => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  });
};

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
  });
};

// Helper to extract cookie values
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
    resolve: async (name) => {
      const pages = import.meta.glob("./pages/**/*.svelte");
      const pageKey = `./pages/${name}.svelte`;
      const page = pages[pageKey];
      
      if (!page) {
        throw new Error(`Page ${name} not found`);
      }
      
      return page();
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
const bootstrap = () => {
  setupI18n();
  configureAxios();
  initApp();
  setupPWA();
};

// Start the application
bootstrap();
