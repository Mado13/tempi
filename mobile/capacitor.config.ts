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
    scheme: 'App',
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: true,
      iosKeychainPrefix: 'svelte-sqlite-app-starter',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for capacitor sqlite',
      },
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for capacitor sqlite',
        biometricSubTitle: 'Log in using your biometric',
      },
    },
    StatusBar: {
      style: 'Light',
      overlaysWebView: false,
      backgroundColor: '#F8F9FA',
    },
    Preferences: {},
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
