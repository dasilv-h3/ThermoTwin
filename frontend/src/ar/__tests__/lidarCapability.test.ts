jest.mock('react-native', () => ({
  Platform: { OS: 'ios', Version: '17' },
}));
jest.mock('expo-device', () => ({
  modelName: null as string | null,
}));

import { Platform } from 'react-native';
import * as Device from 'expo-device';

import { getLidarCapability } from '../lidarCapability';

const platformMock = Platform as { OS: string; Version: string | number };
const deviceMock = Device as { modelName: string | null };

beforeEach(() => {
  platformMock.OS = 'ios';
  platformMock.Version = '17';
  deviceMock.modelName = null;
});

describe('getLidarCapability', () => {
  it('returns unsupported on non-iOS platforms', () => {
    platformMock.OS = 'android';
    deviceMock.modelName = 'iPhone 15 Pro';
    expect(getLidarCapability()).toMatchObject({ supported: false, reason: 'platform' });
  });

  it('returns unsupported on iOS < 14', () => {
    platformMock.Version = '13';
    deviceMock.modelName = 'iPhone 15 Pro';
    expect(getLidarCapability()).toMatchObject({ supported: false, reason: 'os-version' });
  });

  it('supports iPhone 12 Pro and above (Pro / Pro Max)', () => {
    for (const name of [
      'iPhone 12 Pro',
      'iPhone 12 Pro Max',
      'iPhone 14 Pro',
      'iPhone 15 Pro Max',
      'iPhone 17 Pro Max',
      'iPhone 19 Pro',
      'iPhone 25 Pro Max',
    ]) {
      deviceMock.modelName = name;
      expect(getLidarCapability()).toMatchObject({ supported: true, deviceModel: name });
    }
  });

  it('rejects iPhone 11 Pro and Pro Max (no LiDAR on that gen)', () => {
    for (const name of ['iPhone 11 Pro', 'iPhone 11 Pro Max']) {
      deviceMock.modelName = name;
      expect(getLidarCapability().supported).toBe(false);
    }
  });

  it('rejects non-Pro iPhones', () => {
    for (const name of ['iPhone 14', 'iPhone 15 Plus', 'iPhone SE (3rd generation)']) {
      deviceMock.modelName = name;
      expect(getLidarCapability().supported).toBe(false);
    }
  });

  it('accepts iPad Pro generations', () => {
    deviceMock.modelName = 'iPad Pro (12.9-inch) (5th generation)';
    expect(getLidarCapability().supported).toBe(true);
  });

  it('returns device-model reason when modelName is missing', () => {
    deviceMock.modelName = null;
    expect(getLidarCapability()).toMatchObject({ supported: false, reason: 'device-model' });
  });
});
