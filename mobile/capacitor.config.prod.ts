import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.tempi",
  appName: "Tempi",
  webDir: "../priv/static",

  android: {
    allowMixedContent: false,
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
