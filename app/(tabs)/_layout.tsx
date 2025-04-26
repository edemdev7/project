import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { Chrome as Home, User, FileText, CirclePlus as PlusCircle, Briefcase, History, Recycle } from 'lucide-react-native';
import { useUserContext } from '@/context/UserContext';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const { user, isLoading } = useUserContext();
  const userType = user?.type || 'particulier';

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('expo-font').Inter_400Regular,
    'Inter-Medium': require('expo-font').Inter_500Medium,
    'Inter-Bold': require('expo-font').Inter_700Bold,
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const tabsOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#10B981',
    tabBarInactiveTintColor: '#6b7280',
    tabBarLabelStyle: { fontSize: 12 },
    tabBarStyle: { height: 60 },
  };
  return (
    <Tabs screenOptions={tabsOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="waste"
        options={{
          title: userType === 'particulier' ? 'Déclarer' : 
                userType === 'collecteur' ? 'Missions' : 'Déchets',
          tabBarIcon: ({ color }) => {
            if (userType === 'particulier') return <PlusCircle size={24} color={color} />;
            if (userType === 'collecteur') return <Briefcase size={24} color={color} />;
            return <Recycle size={24} color={color} />;
          }
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color }) => 
            userType === 'particulier' ? 
              <FileText size={24} color={color} /> : 
              <History size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}