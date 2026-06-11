import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '@/lib/api';
import { THEME, PENCIL_FAINT } from '@/constants/Theme';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setBusy(true);
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: THEME.bg }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>
        <Text style={PENCIL_FAINT}>Keep Playing</Text>
        <Text
          style={{
            color: THEME.inkStrong,
            fontSize: 34,
            fontWeight: '300',
            marginTop: 12,
            lineHeight: 40,
          }}
        >
          The Collective is open to you.
        </Text>

        <View style={{ marginTop: 48, gap: 28 }}>
          <View>
            <Text style={PENCIL_FAINT}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@ahtohmoh.com"
              placeholderTextColor={THEME.faint}
              style={{
                color: THEME.ink,
                fontSize: 16,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: THEME.hairline,
              }}
            />
          </View>
          <View>
            <Text style={PENCIL_FAINT}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              placeholderTextColor={THEME.faint}
              style={{
                color: THEME.ink,
                fontSize: 16,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: THEME.hairline,
              }}
            />
          </View>

          {error && <Text style={{ color: THEME.muted, fontSize: 13 }}>{error}</Text>}

          <Pressable
            onPress={onSubmit}
            disabled={busy || !email || !password}
            style={({ pressed }) => ({
              backgroundColor: THEME.ink,
              paddingVertical: 14,
              alignItems: 'center',
              opacity: busy || !email || !password ? 0.4 : pressed ? 0.85 : 1,
              marginTop: 8,
            })}
          >
            <Text
              style={{
                color: THEME.bg,
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 2.4,
                textTransform: 'uppercase',
              }}
            >
              {busy ? 'Signing in…' : 'Continue'}
            </Text>
          </Pressable>
        </View>

        <Text style={[PENCIL_FAINT, { marginTop: 40 }]}>Invitation only</Text>
      </View>
    </KeyboardAvoidingView>
  );
}
