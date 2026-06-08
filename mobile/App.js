import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import TabNavigator from './src/navigation/TabNavigator';
import { useFonts } from 'expo-font';
import { Oswald_400Regular, Oswald_500Medium, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { PlayfairDisplay_400Regular, PlayfairDisplay_400Regular_Italic, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import CustomAlertComponent, { customAlertRef } from './src/components/CustomAlert';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

const linking = {
  prefixes: [Linking.createURL('/'), 'sora://'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Cart: 'cart',
          Home: 'home',
          Shop: 'shop',
          Wishlist: 'wishlist',
          Profile: 'profile',
        },
      },
      OrderHistory: 'order-history',
      Checkout: 'checkout',
    },
  },
};

export default function App() {
  let [fontsLoaded] = useFonts({
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer linking={linking}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <TabNavigator />
        <CustomAlertComponent ref={customAlertRef} />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
