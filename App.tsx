import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContext, useAppState } from './src/services/store';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const appState = useAppState();

  return (
    <SafeAreaProvider>
      <AppContext.Provider value={appState}>
        <StatusBar style="dark" />
        <AppNavigator />
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}
