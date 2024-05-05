import { Stack } from 'expo-router/stack';
import AuthProvider from '../providers/AuthProvider';
import { PropsWithChildren } from 'react';
import { StatusBar, View } from 'react-native';

export default function Layout() {

  const RootView = ({ children }: PropsWithChildren) => {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        {children}
      </View>
    );
  };

  return (
    <RootView>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-invoice" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </RootView>
  );
}
