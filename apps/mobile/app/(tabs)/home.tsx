import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { catchUp, type CatchUpItem } from '@/lib/api';
import { THEME, PENCIL, PENCIL_FAINT } from '@/constants/Theme';

export default function Home() {
  const [items, setItems] = useState<CatchUpItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await catchUp());
    } finally {
      setLoaded(true);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 }}>
        <Text style={{ color: THEME.inkStrong, fontSize: 28, fontWeight: '300' }}>
          {greeting()}.
        </Text>
        <Text style={[PENCIL, { marginTop: 16 }]}>Since you were here</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={THEME.muted}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        ListEmptyComponent={
          loaded ? (
            <Text style={{ color: THEME.muted, fontSize: 14, marginTop: 12 }}>
              Nothing moved while you were away. The practice is quiet.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View
            style={{
              borderLeftWidth: 1,
              borderLeftColor: THEME.edge,
              paddingLeft: 16,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: THEME.mutedStrong, fontSize: 14, lineHeight: 21 }}>
              <Text style={{ color: THEME.ink }}>{item.actorName ?? 'Someone'}</Text>{' '}
              {item.summary}
              {item.projectTitle ? (
                <>
                  {' on '}
                  <Text style={{ color: THEME.ink }}>{item.projectTitle}</Text>
                </>
              ) : null}
            </Text>
            <Text style={[PENCIL_FAINT, { marginTop: 4 }]}>{timeAgo(item.at)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 18) return 'Afternoon';
  return 'Evening';
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
