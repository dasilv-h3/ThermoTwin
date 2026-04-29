import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/**
 * Canonical screen transitions for ThermoTwin.
 *
 * Used as `screenOptions` on a Stack.Navigator, or per-screen via
 * `options` on Stack.Screen.
 */

export const fadeTransition: NativeStackNavigationOptions = {
  animation: 'fade',
  animationDuration: 220,
};

export const slideFromRight: NativeStackNavigationOptions = {
  animation: 'slide_from_right',
  animationDuration: 260,
  gestureEnabled: true,
};

export const slideFromBottom: NativeStackNavigationOptions = {
  animation: 'slide_from_bottom',
  animationDuration: 280,
  presentation: 'modal',
};

export const noTransition: NativeStackNavigationOptions = {
  animation: 'none',
};

/**
 * Default transition for the root stack: right-slide with gestures.
 * Modals (quote request, scan progress, etc.) should opt into
 * `slideFromBottom` via per-screen options.
 */
export const defaultStackScreenOptions: NativeStackNavigationOptions = {
  ...slideFromRight,
  headerShown: false,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#ffffff' },
};
