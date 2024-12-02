import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export const requestAppPermissions = async () => {
  try {
    // Request Location Permission
    const locationStatus = await Location.requestForegroundPermissionsAsync();
    if (locationStatus.status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'SipSpotter needs location access to show nearby cafes. Please enable it in your settings.'
      );
    }

    // Request Notification Permission
    const notificationStatus = await Notifications.requestPermissionsAsync();
    if (notificationStatus.status !== 'granted') {
      Alert.alert(
        'Notification Permission Required',
        'Enable notifications to receive updates about your scheduled visits.'
      );
    }
  } catch (error) {
    console.error('Error requesting permissions:', error);
  }
}; 