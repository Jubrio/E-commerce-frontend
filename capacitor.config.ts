import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bazarguyane.app',
  appName: 'Bazar Guyane',
  webDir: 'out',
  server: {
    url: 'https://bazarguyane.up.railway.app',
    cleartext: true,
    androidScheme: 'https',
  },
};

export default config;