import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from '../screens/Onboarding/LandingScreen';
import RoleSelectScreen from '../screens/Onboarding/RoleSelectScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import HomeScreen from '../screens/Home/HomeScreen';

export type UserRole = 'reader' | 'shepherd';

export type RootStackParamList = {
  Landing: undefined;
  RoleSelect: undefined;
  SignUp: { role: UserRole };
  SignIn: undefined;
  Welcome: { role: UserRole; name: string };
  Home: { role: UserRole; name: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
