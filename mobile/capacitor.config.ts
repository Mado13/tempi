import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.tempi",
  appName: "Tempi",
  webDir: "../priv/static/",

  server: {
    url: "http://localhost:4000",
    cleartext: true,
    hostname: "localhost",
    allowNavigation: [
      "https://maps.googleapis.com",
      "https://places.googleapis.com",
    ],
  },

  android: {
    allowMixedContent: true,
    captureInput: true,
  },

  ios: {
    contentInset: "automatic",
  },

  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
