import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export type TourStep = {
  key: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom' | 'center';
};

type TourContextValue = {
  start: (steps: TourStep[]) => void;
  next: () => void;
  stop: () => void;
  isActive: boolean;
  currentStep: TourStep | null;
  stepIndex: number;
  totalSteps: number;
};

const TourContext = createContext<TourContextValue | null>(null);

export function GuidedTourProvider({ children }: PropsWithChildren) {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);

  const start = useCallback((list: TourStep[]) => {
    if (list.length === 0) return;
    setSteps(list);
    setStepIndex(0);
  }, []);

  const stop = useCallback(() => {
    setStepIndex(-1);
    setSteps([]);
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i < 0) return i;
      if (i + 1 >= steps.length) {
        setSteps([]);
        return -1;
      }
      return i + 1;
    });
  }, [steps.length]);

  const isActive = stepIndex >= 0 && stepIndex < steps.length;
  const currentStep = isActive ? steps[stepIndex] : null;

  const value = useMemo<TourContextValue>(
    () => ({
      start,
      next,
      stop,
      isActive,
      currentStep,
      stepIndex,
      totalSteps: steps.length,
    }),
    [start, next, stop, isActive, currentStep, stepIndex, steps.length],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourOverlay />
    </TourContext.Provider>
  );
}

export function useGuidedTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useGuidedTour must be used within <GuidedTourProvider>');
  }
  return ctx;
}

function TourOverlay(): ReactNode {
  const { isActive, currentStep, next, stop, stepIndex, totalSteps } = useContext(
    TourContext,
  ) as TourContextValue;

  if (!isActive || !currentStep) return null;
  const isLast = stepIndex + 1 === totalSteps;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={stop} accessibilityViewIsModal>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.tooltip,
            currentStep.placement === 'top' && styles.tooltipTop,
            currentStep.placement === 'bottom' && styles.tooltipBottom,
          ]}
        >
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.body}>{currentStep.body}</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={stop}
              accessibilityRole="button"
              accessibilityLabel="Arrêter le tutoriel"
            >
              <Text style={styles.skip}>Passer</Text>
            </Pressable>
            <View style={styles.progress}>
              <Text style={styles.progressText}>
                {stepIndex + 1} / {totalSteps}
              </Text>
            </View>
            <Pressable style={styles.nextBtn} onPress={next} accessibilityRole="button">
              <Text style={styles.nextText}>{isLast ? 'Terminer' : 'Suivant'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,18,32,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  tooltip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  tooltipTop: { marginBottom: 'auto', marginTop: 60 },
  tooltipBottom: { marginTop: 'auto', marginBottom: 60 },
  title: { fontSize: 16, fontWeight: '800', color: '#111' },
  body: { fontSize: 14, color: '#333', lineHeight: 20 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  skip: { color: '#666', fontSize: 13, fontWeight: '500' },
  progress: {},
  progressText: { fontSize: 12, color: '#999' },
  nextBtn: {
    backgroundColor: '#1f6feb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  nextText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
