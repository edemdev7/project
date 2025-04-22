import { UserProvider } from '@/context/UserContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Slot, SplashScreen, Stack } from 'expo-router'; // Import Slot ou Stack/Tabs
import { useEffect } from 'react';
// Importe tes hooks, polices, etc. si nécessaire

// Empêche le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Logique de chargement (polices, etc.) - Exemple simple
  useEffect(() => {
    // Cache le splash screen une fois le layout prêt
    // Idéalement, tu le caches quand tes assets (polices) sont chargés
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        {/* Slot rend la route correspondante (auth/login, (tabs), etc.) */}
        {/* Assure-toi que Slot est bien DANS UserProvider */}
        <Slot />

        {/* OU si tu utilises un Stack principal ici : */}
        {/* <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
        </Stack> */}
      </UserProvider>
    </SafeAreaProvider>
  );
}

// Optionnel : Exporte ErrorBoundary si tu veux gérer les erreurs ici
export { ErrorBoundary } from 'expo-router';