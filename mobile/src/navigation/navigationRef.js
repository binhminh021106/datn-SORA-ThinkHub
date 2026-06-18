import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigateFromNotification = (data = {}) => {
  if (!navigationRef.isReady()) {
    return;
  }

  if (data.screen === 'OrderHistory') {
    navigationRef.navigate('OrderHistory');
    return;
  }

  if (data.screen === 'SavedCoupons') {
    navigationRef.navigate('SavedCoupons');
    return;
  }

  navigationRef.navigate('MainTabs', { screen: 'Home' });
};
