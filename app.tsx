// import { UserProvider } from '@/context/UserContext';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { ScrollViewStyleReset } from 'expo-router/html';
// import FontAwesome from '@expo/vector-icons/FontAwesome';

// export {
//   // Catch any errors thrown by the Layout component.
//   ErrorBoundary,
// } from 'expo-router';

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: '(tabs)',
// };

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// import { SplashScreen } from 'expo-router';
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   // Return the splash screen when WebContainer is not ready
//   return <RootLayoutNav />;
// }

// function RootLayoutNav() {
//   return (
//     <SafeAreaProvider>
//       <UserProvider>
//         <ScrollViewStyleReset />
//       </UserProvider>
//     </SafeAreaProvider>
//   );
// }