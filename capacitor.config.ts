import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.acltradings.campuskit',
  appName: 'CampusKit',
  webDir: 'dist',
  android: {
    backgroundColor: '#0a0a0b',
  },
  plugins: {
    LocalNotifications: {
      // Without a valid drawable here Android drops every notification on the
      // floor. The icon is a white silhouette, as the status bar requires.
      smallIcon: 'ic_stat_campuskit',
      iconColor: '#D4AF37',
    },
  },
};

export default config;
