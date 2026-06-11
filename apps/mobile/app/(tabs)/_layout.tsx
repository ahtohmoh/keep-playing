import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { THEME } from '@/constants/Theme';

function Label({ title, focused }: { title: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.8,
        textTransform: 'uppercase',
        color: focused ? THEME.ink : THEME.faint,
      }}
    >
      {title}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: THEME.paper2,
          borderTopColor: THEME.edge,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 8,
        },
        tabBarShowLabel: true,
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ tabBarLabel: ({ focused }) => <Label title="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="projects"
        options={{ tabBarLabel: ({ focused }) => <Label title="Projects" focused={focused} /> }}
      />
      <Tabs.Screen
        name="voice"
        options={{ tabBarLabel: ({ focused }) => <Label title="Voice" focused={focused} /> }}
      />
      <Tabs.Screen
        name="you"
        options={{ tabBarLabel: ({ focused }) => <Label title="You" focused={focused} /> }}
      />
    </Tabs>
  );
}
