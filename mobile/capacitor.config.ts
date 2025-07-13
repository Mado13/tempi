import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.tempi.app',
  appName: 'Tempi',
  webDir: '../frontend/dist',
  server:
    process.env.CAP_DEV === 'true'
      ? {
          url: 'http://localhost:5173',
          cleartext: true,
          androidScheme: 'http',
        }
      : undefined,
  android: {
    allowMixedContent: true,
    captureInput: true,
  },
  ios: {
    scheme: 'Tempi',
  },
  plugins: {
    Keyboard: {
      resize: 'none',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#242424',
      showSpinner: false,
    },
  },
}

export default config
