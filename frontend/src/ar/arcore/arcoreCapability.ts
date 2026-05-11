import { Platform } from 'react-native';

export type ARCoreCapability = {
  supported: boolean;
  // Depth API n'est dispo que sur ~200 modèles Android certifiés ARCore avec
  // capteurs adéquats. Pas détectable de manière fiable depuis JS sans bridge
  // natif — drapeau renseigné par le pont natif au runtime.
  depthApiSupported: boolean;
  reason?: 'platform' | 'os-version' | 'apk-missing';
  androidVersion?: number;
};

// ARCore exige Android 7.0 (API 24) minimum. La présence de Google Play
// Services for AR (l'APK ARCore) est vérifiée par le module natif au moment
// de start() — pas possible depuis JS.
const MIN_ANDROID_VERSION = 7;

export function getARCoreCapability(): ARCoreCapability {
  if (Platform.OS !== 'android') {
    return { supported: false, depthApiSupported: false, reason: 'platform' };
  }

  const androidVersion = parseInt(String(Platform.Version), 10);
  if (Number.isFinite(androidVersion) && androidVersion < MIN_ANDROID_VERSION) {
    return {
      supported: false,
      depthApiSupported: false,
      reason: 'os-version',
      androidVersion,
    };
  }

  // À ce stade, on présume supporté. La vérification réelle (APK ARCore
  // installé + device certifié + depth API) aura lieu côté natif au start().
  return {
    supported: true,
    depthApiSupported: false,
    androidVersion: Number.isFinite(androidVersion) ? androidVersion : undefined,
  };
}
