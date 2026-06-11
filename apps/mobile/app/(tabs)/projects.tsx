import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { projects, type ProjectListItem } from '@/lib/api';
import { THEME, CARD, PENCIL_FAINT } from '@/constants/Theme';

export default function Projects() {
  const [list, setList] = useState<ProjectListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setList(await projects());
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 }}>
        <Text style={{ color: THEME.inkStrong, fontSize: 28, fontWeight: '300' }}>Projects</Text>
      </View>
      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
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
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 12 }}
        renderItem={({ item }) => (
          <View style={[CARD, { padding: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              {item.artifactNumber != null && (
                <Text style={{ fontFamily: 'SpaceMono', color: THEME.mutedStrong, fontSize: 13 }}>
                  · {String(item.artifactNumber).padStart(3, '0')}
                </Text>
              )}
              <Text style={{ color: THEME.ink, fontSize: 16, fontWeight: '500', flexShrink: 1 }}>
                {item.title}
              </Text>
            </View>
            {item.description && (
              <Text style={{ color: THEME.muted, fontSize: 13, marginTop: 6, lineHeight: 19 }}>
                {item.description}
              </Text>
            )}
            <Text style={[PENCIL_FAINT, { marginTop: 10 }]}>
              {item.status} · {item.type.replace(/_/g, ' ')}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
