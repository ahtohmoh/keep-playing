/**
 * Entry — route by auth state. Token present and valid → tabs. Else → login.
 */
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { me } from '@/lib/api';
import { THEME } from '@/constants/Theme';

export default function Index() {
  const [state, setState] = useState<'checking' | 'in' | 'out'>('checking');

  useEffect(() => {
    me().then((user) => setState(user ? 'in' : 'out'));
  }, []);

  if (state === 'checking') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.bg }}>
        <ActivityIndicator color={THEME.muted} />
      </View>
    );
  }

  return <Redirect href={state === 'in' ? '/(tabs)/home' : '/login'} />;
}
