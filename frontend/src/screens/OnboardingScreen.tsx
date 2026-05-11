import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

export type OnboardingSlide = {
  key: string;
  title: string;
  body: string;
  emoji?: string;
};

const DEFAULT_SLIDES: OnboardingSlide[] = [
  {
    key: 'scan',
    title: 'Scannez votre logement en 3D',
    body: 'Utilisez la caméra LiDAR de votre smartphone pour capturer les murs et identifier les ponts thermiques.',
    emoji: '📱',
  },
  {
    key: 'heatmap',
    title: 'Visualisez vos déperditions',
    body: 'Une heatmap thermique calculée à partir de votre scan met en évidence les zones les plus froides.',
    emoji: '🌡️',
  },
  {
    key: 'quote',
    title: 'Obtenez un devis instantané',
    body: 'Choisissez les travaux à mener, comparez avant/après et demandez un devis en un tap.',
    emoji: '💶',
  },
];

type Props = {
  slides?: OnboardingSlide[];
  onFinish?: () => void;
  onSkip?: () => void;
};

export default function OnboardingScreen({ slides = DEFAULT_SLIDES, onFinish, onSkip }: Props) {
  const [index, setIndex] = useState(0);
  const width = useMemo(() => Dimensions.get('window').width, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const isLast = index === slides.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Passer l'onboarding"
        >
          <Text style={styles.skip}>Passer</Text>
        </Pressable>
      </View>

      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(s) => s.key}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            {item.emoji ? <Text style={styles.emoji}>{item.emoji}</Text> : null}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
        <Pressable style={styles.cta} onPress={onFinish} accessibilityRole="button">
          <Text style={styles.ctaText}>{isLast ? 'Commencer' : 'Suivant'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'flex-end', padding: 16 },
  skip: { color: '#1f6feb', fontSize: 14, fontWeight: '600' },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  emoji: { fontSize: 64 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: '#1f6feb', width: 24 },
  dotInactive: { backgroundColor: '#d6d8dc' },
  cta: {
    backgroundColor: '#1f6feb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
