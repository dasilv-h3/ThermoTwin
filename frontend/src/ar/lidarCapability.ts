import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type LidarCapability = {
  supported: boolean;
  reason?: 'platform' | 'device-model' | 'os-version';
  deviceModel?: string;
};

const LIDAR_IOS_MODELS = [
  'iPhone13,2',
  'iPhone13,3',
  'iPhone13,4',
  'iPhone14,2',
  'iPhone14,3',
  'iPhone15,2',
  'iPhone15,3',
  'iPhone16,1',
  'iPhone16,2',
  'iPhone17,1',
  'iPhone17,2',
  'iPad8,',
  'iPad13,',
  'iPad14,',
];

function getDeviceModelIdentifier(): string | undefined {
  const platform = Constants.platform as { ios?: { model?: string } } | null | undefined;
  return platform?.ios?.model ?? undefined;
}

function isLidarModel(model: string): boolean {
  return LIDAR_IOS_MODELS.some((prefix) => model.startsWith(prefix));
}

export function getLidarCapability(): LidarCapability {
  if (Platform.OS !== 'ios') {
    return { supported: false, reason: 'platform' };
  }

  const iosVersion = parseInt(String(Platform.Version), 10);
  if (Number.isFinite(iosVersion) && iosVersion < 14) {
    return { supported: false, reason: 'os-version' };
  }

  const model = getDeviceModelIdentifier();
  if (!model) {
    return { supported: false, reason: 'device-model' };
  }

  if (!isLidarModel(model)) {
    return { supported: false, reason: 'device-model', deviceModel: model };
  }

  return { supported: true, deviceModel: model };
}
