import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

// Separate function to request notification permissions
export const requestNotificationPermission = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Notification Permission Required',
        'Please enable notifications in your device settings to receive visit reminders.',
        [{ text: 'OK', style: 'default' }]
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const PermissionsHandler = ({ children }) => {
  const [permissionsReady, setPermissionsReady] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === 'granted') {
        setPermissionsReady(true);
        return;
      }

      const locationStatus = await Location.requestForegroundPermissionsAsync();
      if (locationStatus.status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to find cafes near you.',
          [
            {
              text: 'Try Again',
              onPress: requestLocationPermission
            },
            {
              text: 'Continue Anyway',
              onPress: () => setPermissionsReady(true)
            }
          ]
        );
        return;
      }

      setPermissionsReady(true);
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert(
        'Error',
        'Failed to request location permission. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: requestLocationPermission
          },
          {
            text: 'Continue Anyway',
            onPress: () => setPermissionsReady(true)
          }
        ]
      );
    }
  };

  if (!permissionsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default PermissionsHandler; 