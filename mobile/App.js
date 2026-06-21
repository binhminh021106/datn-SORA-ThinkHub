import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import TabNavigator from './src/navigation/TabNavigator';
import { useFonts } from 'expo-font';
import { Oswald_400Regular, Oswald_500Medium, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { PlayfairDisplay_400Regular, PlayfairDisplay_400Regular_Italic, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import CustomAlertComponent, { customAlertRef } from './src/components/CustomAlert';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getExpoNotificationsModule, registerDevicePushToken } from './src/services/pushNotifications';
import { flushPendingNotificationNavigation, navigateFromNotification, navigationRef } from './src/navigation/navigationRef';

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

function PushNotificationBridge() {
  useEffect(() => {
    let responseSubscription = null;
    let receivedSubscription = null;
    let isMounted = true;

    const refreshNotificationRelatedQueries = (data = {}) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      if (data.type === 'order_status' || data.screen === 'OrderHistory') {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['order-detail'] });
      }
    };

    const setupNotifications = async () => {
      const Notifications = await getExpoNotificationsModule();
      if (!Notifications || !isMounted) {
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      registerDevicePushToken().catch((error) => {
        console.log('Register push token failed:', error?.message || error);
      });

      receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
        const data = notification?.request?.content?.data || {};
        refreshNotificationRelatedQueries(data);
      });

      responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response?.notification?.request?.content?.data || {};
        refreshNotificationRelatedQueries(data);
        navigateFromNotification(data);
      });
    };

    setupNotifications();

    return () => {
      isMounted = false;
      receivedSubscription?.remove?.();
      responseSubscription?.remove?.();
    };
  }, []);

  return null;
}

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
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        onReady={flushPendingNotificationNavigation}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <PushNotificationBridge />
        <TabNavigator />
        <CustomAlertComponent ref={customAlertRef} />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
