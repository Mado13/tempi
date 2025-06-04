import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.tempi",
  appName: "Tempi",
  webDir: "../priv/static/",

  server: {
    url: "http://10.0.0.81:4000",
    cleartext: true,
    hostname: "10.0.0.81",
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
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
