import { ComponentType, Suspense, lazy, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type LazyScreenOptions = {
  fallback?: ReactNode;
};

function DefaultFallback() {
  return (
    <View style={styles.fallback} accessibilityLabel="Chargement de l'écran">
      <ActivityIndicator size="large" />
    </View>
  );
}

/**
 * Wrap a dynamic `import(...)` call into a React Navigation-compatible
 * lazy screen. Keeps initial JS bundle lean by deferring non-critical
 * screens (settings, onboarding, AR viewer, ...) until first navigation.
 */
export function lazyScreen<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: LazyScreenOptions = {},
): ComponentType<P> {
  const Lazy = lazy(loader);
  const fallback = options.fallback ?? <DefaultFallback />;
  return function LazyScreen(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}

const styles = StyleSheet.create({
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
