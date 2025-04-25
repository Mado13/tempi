import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.example.tempi',
  appName: 'Tempi',
  webDir: '../priv/static/',
  server: {
    url: 'http://localhost:4000',
    cleartext: true,
  },
}

export default config
