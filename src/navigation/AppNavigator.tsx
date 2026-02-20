import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from '../screens/Onboarding/LandingScreen';
import RoleSelectScreen from '../screens/Onboarding/RoleSelectScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import ShepherdProfileSetupScreen from '../screens/Onboarding/ShepherdProfileSetupScreen';
import CreateGroupScreen from '../screens/Onboarding/CreateGroupScreen';
import InviteReadersScreen from '../screens/Onboarding/InviteReadersScreen';
import JoinGroupScreen from '../screens/Onboarding/JoinGroupScreen';
import ReaderPreferencesScreen from '../screens/Onboarding/ReaderPreferencesScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

export type AuthStackParamList = {
  Landing: undefined;
  RoleSelect: undefined;
  SignUp: { role: UserRole };
  SignIn: undefined;
};

export type AppStackParamList = {
  Welcome: undefined;
  ShepherdProfileSetup: undefined;
  CreateGroup: undefined;
  InviteReaders: { groupId: string; inviteCode: string };
  JoinGroup: undefined;
  ReaderPreferences: undefined;
  Home: undefined;
};

const AuthStackNav = createStackNavigator<AuthStackParamList>();
const AppStackNav = createStackNavigator<AppStackParamList>();

function AuthStack() {
  return (
    <AuthStackNav.Navigator
      initialRouteName="Landing"
      screenOptions={{ headerShown: false }}
    >
      <AuthStackNav.Screen name="Landing" component={LandingScreen} />
      <AuthStackNav.Screen name="RoleSelect" component={RoleSelectScreen} />
      <AuthStackNav.Screen name="SignUp" component={SignUpScreen} />
      <AuthStackNav.Screen name="SignIn" component={SignInScreen} />
    </AuthStackNav.Navigator>
  );
}

function AppStack() {
  const { userProfile } = useAuth();

  return (
    <AppStackNav.Navigator screenOptions={{ headerShown: false }}>
      {!userProfile?.hasCompletedOnboarding && (
        <>
          <AppStackNav.Screen name="Welcome" component={WelcomeScreen} />
          <AppStackNav.Screen name="ShepherdProfileSetup" component={ShepherdProfileSetupScreen} />
          <AppStackNav.Screen name="CreateGroup" component={CreateGroupScreen} />
          <AppStackNav.Screen name="InviteReaders" component={InviteReadersScreen} />
          <AppStackNav.Screen name="JoinGroup" component={JoinGroupScreen} />
          <AppStackNav.Screen name="ReaderPreferences" component={ReaderPreferencesScreen} />
        </>
      )}
      <AppStackNav.Screen
        name="Home"
        component={HomeScreen}
        options={{ gestureEnabled: false }}
      />
    </AppStackNav.Navigator>
  );
}

export default function AppNavigator() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user && userProfile ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
