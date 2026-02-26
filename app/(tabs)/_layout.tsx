import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontFamily } from '../../constants/typography';

type TabIconName = 'home' | 'book' | 'edit-3' | 'user';

const TAB_CONFIG: {
  name: string;
  title: string;
  icon: TabIconName;
}[] = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'read', title: 'Read', icon: 'book' },
  { name: 'reflect', title: 'Reflect', icon: 'edit-3' },
  { name: 'profile', title: 'Profile', icon: 'user' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: `${tab.title} tab`,
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Feather name={tab.icon} size={size - 2} color={color} />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.tabBarBorder,
    paddingTop: 8,
    height: 88,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
