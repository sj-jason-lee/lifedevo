import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContext, useAppState } from './src/services/store';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const appState = useAppState();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContext.Provider value={appState}>
          <StatusBar style="dark" />
          <AppNavigator />
        </AppContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
