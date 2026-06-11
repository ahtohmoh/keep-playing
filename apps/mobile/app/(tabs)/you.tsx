import { useEffect, useState } from 'react';
import { View, Text, Pressable, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { me, clearToken, type Me } from '@/lib/api';
import { THEME, CARD, PENCIL, PENCIL_FAINT } from '@/constants/Theme';

export default function You() {
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    me().then(setUser);
  }, []);

  async function signOut() {
    await clearToken();
    router.replace('/login');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Text style={{ color: THEME.inkStrong, fontSize: 28, fontWeight: '300' }}>
          {user?.displayName ?? user?.fullName ?? '…'}
        </Text>
        {user && <Text style={[PENCIL, { marginTop: 8 }]}>{user.tier.replace(/_/g, ' ')}</Text>}

        <View style={[CARD, { padding: 16, marginTop: 32 }]}>
          <Text style={PENCIL_FAINT}>Email</Text>
          <Text style={{ color: THEME.ink, fontSize: 14, marginTop: 4 }}>{user?.email ?? ''}</Text>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={signOut}
          style={({ pressed }) => ({
            borderWidth: 1,
            borderColor: THEME.hairlineStrong,
            paddingVertical: 13,
            alignItems: 'center',
            marginBottom: 24,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              color: THEME.ink,
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 2.4,
              textTransform: 'uppercase',
            }}
          >
            Sign out
          </Text>
        </Pressable>

        <Text style={[PENCIL_FAINT, { marginBottom: 16, textAlign: 'center' }]}>
          Legacy through play
        </Text>
      </View>
    </SafeAreaView>
  );
}
