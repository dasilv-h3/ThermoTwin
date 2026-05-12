import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Message = {
  id: string;
  author: 'user' | 'agent';
  body: string;
  createdAt: number;
};

type Props = {
  isPremium?: boolean;
  initialMessages?: Message[];
  onSend?: (body: string) => void;
};

const WELCOME: Message = {
  id: 'welcome',
  author: 'agent',
  body: 'Bonjour, vous bénéficiez du support prioritaire Premium. Un conseiller vous répond sous 2h ouvrées.',
  createdAt: Date.now(),
};

export default function PrioritySupportScreen({
  isPremium = true,
  initialMessages,
  onSend,
}: Props) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? [WELCOME]);

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  const send = () => {
    if (!canSend) return;
    const body = draft.trim();
    const next: Message = {
      id: `${Date.now()}`,
      author: 'user',
      body,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, next]);
    setDraft('');
    onSend?.(body);
  };

  if (!isPremium) {
    return (
      <View style={[styles.container, styles.lockedContainer]}>
        <Text style={styles.lockedTitle}>Support prioritaire Premium</Text>
        <Text style={styles.lockedBody}>
          Passez à l’offre Premium pour discuter avec un conseiller en moins de 2h ouvrées.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support prioritaire</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Premium</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View
            style={[styles.bubble, item.author === 'user' ? styles.bubbleUser : styles.bubbleAgent]}
          >
            <Text style={item.author === 'user' ? styles.bubbleTextUser : styles.bubbleTextAgent}>
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Votre message…"
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Envoyer le message"
        >
          <Text style={styles.sendBtnText}>Envoyer</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  lockedContainer: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  lockedTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  lockedBody: { fontSize: 14, color: '#555', textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  badge: {
    backgroundColor: '#f5c518',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#222' },
  list: { padding: 16, gap: 8 },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#1f6feb' },
  bubbleAgent: { alignSelf: 'flex-start', backgroundColor: '#f1f3f5' },
  bubbleTextUser: { color: '#fff', fontSize: 14 },
  bubbleTextAgent: { color: '#222', fontSize: 14 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#1f6feb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendBtnDisabled: { backgroundColor: '#9bbcf0' },
  sendBtnText: { color: '#fff', fontWeight: '600' },
});
