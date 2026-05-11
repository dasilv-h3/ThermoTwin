jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 30 },
}));

import { Platform } from 'react-native';

import { getARCoreCapability } from '../arcore/arcoreCapability';

const platformMock = Platform as { OS: string; Version: string | number };

beforeEach(() => {
  platformMock.OS = 'android';
  platformMock.Version = 30;
});

describe('getARCoreCapability', () => {
  it('returns unsupported on iOS', () => {
    platformMock.OS = 'ios';
    expect(getARCoreCapability()).toMatchObject({ supported: false, reason: 'platform' });
  });

  it('returns unsupported on Android < 7 (API 24)', () => {
    platformMock.Version = 5;
    expect(getARCoreCapability()).toMatchObject({ supported: false, reason: 'os-version' });
  });

  it('returns supported (with depthApiSupported=false stub) on Android >= 7', () => {
    platformMock.Version = 33;
    expect(getARCoreCapability()).toMatchObject({ supported: true, depthApiSupported: false });
  });

  it('captures android version when finite', () => {
    platformMock.Version = 14;
    expect(getARCoreCapability().androidVersion).toBe(14);
  });
});
