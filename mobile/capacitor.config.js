const isDev = process.env.NODE_ENV === "development";

const config = isDev
  ? require("./capacitor.config.dev.ts")
  : require("./capacitor.config.dev.ts");

module.exports = config.default || config;

