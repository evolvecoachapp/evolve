import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Dynamic Expo config so the API base URL can be environment-driven without
 * a rebuild. Base fields align with the official Expo SDK 54 default
 * template; see `_expo-scaffold-temp/app.json` for the upstream source.
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "EVOLVE",
  slug: "evolve",
  scheme: "evolve",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
  supportsTablet: true,
  bundleIdentifier: "com.evolvecoachapp.evolve",
  infoPlist: {
    ITSAppUsesNonExemptEncryption: false,
  },
},
android: {
  package: "com.evolvecoachapp.evolve",
  adaptiveIcon: {
    backgroundColor: "#E6F4FE",
    foregroundImage: "./assets/images/android-icon-foreground.png",
    backgroundImage: "./assets/images/android-icon-background.png",
    monochromeImage: "./assets/images/android-icon-monochrome.png",
  },
  edgeToEdgeEnabled: true,
  predictiveBackGestureEnabled: false,
},
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-sqlite",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#F5F5F4",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
  apiBaseUrl: API_BASE_URL,
  eas: {
    projectId: "84a111e1-a07e-4eea-a874-a583e1addc71",
  },
},
});
