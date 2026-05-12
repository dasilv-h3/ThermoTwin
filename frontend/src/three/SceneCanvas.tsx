import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Canvas } from '@react-three/fiber/native';

type Props = PropsWithChildren<{
  style?: ViewStyle;
  backgroundColor?: string;
}>;

export default function SceneCanvas({ children, style, backgroundColor = '#0b1220' }: Props) {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <Canvas
        camera={{ position: [3, 2.5, 3], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[backgroundColor]} />
        {children}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
