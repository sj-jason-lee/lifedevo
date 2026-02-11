import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAppContext } from '../services/store';

// Auth Screens
import { WelcomeScreen } from '../screens/Auth/WelcomeScreen';
import { SignInScreen } from '../screens/Auth/SignInScreen';
import { SignUpScreen } from '../screens/Auth/SignUpScreen';

// Church Setup
import { ChurchSetupScreen } from '../screens/Church/ChurchSetupScreen';

// Main Screens
import { TodayScreen } from '../screens/Today/TodayScreen';
import { ArchiveScreen } from '../screens/Archive/ArchiveScreen';
import { DevotionalDetailScreen } from '../screens/Archive/DevotionalDetailScreen';
import { CommunityScreen } from '../screens/Community/CommunityScreen';
import { MyJourneyScreen } from '../screens/MyJourney/MyJourneyScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';

const AuthStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
const ArchiveStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function ArchiveNavigator() {
  return (
    <ArchiveStack.Navigator>
      <ArchiveStack.Screen
        name="ArchiveList"
        component={ArchiveScreen}
        options={{ headerShown: false }}
      />
      <ArchiveStack.Screen
        name="DevotionalDetail"
        component={DevotionalDetailScreen}
        options={{
          title: 'Devotional',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600', fontSize: 16, color: colors.text },
          headerShadowVisible: false,
        }}
      />
    </ArchiveStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'Today':
              iconName = focused ? 'sunny' : 'sunny-outline';
              break;
            case 'Archive':
              iconName = focused ? 'library' : 'library-outline';
              break;
            case 'Community':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Journey':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          paddingTop: 4,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      })}
    >
      <MainTab.Screen name="Today" component={TodayScreen} />
      <MainTab.Screen name="Archive" component={ArchiveNavigator} />
      <MainTab.Screen name="Community" component={CommunityScreen} />
      <MainTab.Screen name="Journey" component={MyJourneyScreen} />
      <MainTab.Screen name="Settings" component={SettingsScreen} />
    </MainTab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, church } = useAppContext();

  const hasChurch = Boolean(church?.id);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : !hasChurch ? (
          <RootStack.Screen name="ChurchSetup" component={ChurchSetupScreen} />
        ) : (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
