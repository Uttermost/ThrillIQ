import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import { CreateTabButton } from '@/components/ui/CreateTabButton';
import { CONTENT_MAX_WIDTH, colors } from '@/lib/theme';

export default function TabsLayout() {
  // DesktopNav (app/_layout.tsx) replaces this bar on wide web — showing
  // both would be redundant, duplicate navigation.
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: isDesktopWeb ? { display: 'none' } : { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}>
      <Tabs.Screen
        name="discover"
        options={{ title: 'Discover', tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="feed"
        options={{ title: 'Feed', tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarLabel: () => null,
          tabBarButton: (props) => <CreateTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: 'Messages', tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
