import * as Device from 'expo-device';
import { Platform } from 'react-native';

export type LidarCapability = {
  supported: boolean;
  reason?: 'platform' | 'device-model' | 'os-version';
  deviceModel?: string;
};

// Tous les iPhone "Pro" et "Pro Max" depuis l'iPhone 12 embarquent un capteur
// LiDAR, idem pour les iPad Pro 2020+. Match par nom marketing (modelName)
// plutôt que par identifiant (iPhoneN,M) pour éviter une allowlist à mettre
// à jour à chaque sortie.
const IPHONE_PRO_PATTERN = /^iPhone\s+(1[2-9]|[2-9]\d+)\s+Pro(\s+Max)?$/i;
const IPAD_PRO_PATTERN = /^iPad\s+Pro\b/i;

function isLidarMarketingName(modelName: string): boolean {
  if (IPHONE_PRO_PATTERN.test(modelName)) {
    return true;
  }
  if (IPAD_PRO_PATTERN.test(modelName)) {
    // iPad Pro 11" / 12.9" depuis 2020 (4ᵉ gen 12.9" / 2ᵉ gen 11") ont du LiDAR.
    // Les iPad Pro antérieurs ne sont plus dans la cible.
    return true;
  }
  return false;
}

export function getLidarCapability(): LidarCapability {
  if (Platform.OS !== 'ios') {
    return { supported: false, reason: 'platform' };
  }

  const iosVersion = parseInt(String(Platform.Version), 10);
  if (Number.isFinite(iosVersion) && iosVersion < 14) {
    return { supported: false, reason: 'os-version' };
  }

  const modelName = Device.modelName ?? undefined;
  if (!modelName) {
    return { supported: false, reason: 'device-model' };
  }

  if (!isLidarMarketingName(modelName)) {
    return { supported: false, reason: 'device-model', deviceModel: modelName };
  }

  return { supported: true, deviceModel: modelName };
}
