import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingNotificationData = null;

const runNotificationNavigation = (data = {}) => {
  if (data.screen === 'OrderHistory') {
    navigationRef.navigate('OrderHistory');
    return;
  }

  if (data.screen === 'SavedCoupons') {
    navigationRef.navigate('SavedCoupons');
    return;
  }

  if (data.screen === 'Affiliate') {
    navigationRef.navigate('Affiliate');
    return;
  }

  navigationRef.navigate('MainTabs', { screen: 'Home' });
};

export const navigateFromNotification = (data = {}) => {
  if (!navigationRef.isReady()) {
    pendingNotificationData = data;
    return;
  }

  runNotificationNavigation(data);
};

export const flushPendingNotificationNavigation = () => {
  if (!navigationRef.isReady() || !pendingNotificationData) {
    return;
  }

  const data = pendingNotificationData;
  pendingNotificationData = null;
  runNotificationNavigation(data);
};
