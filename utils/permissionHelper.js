import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import { auth } from '../Firebase/firebaseSetup';

export const PermissionsHandler = ({ children }) => {
  const [permissionsReady, setPermissionsReady] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request Location Permission
      const locationStatus = await Location.requestForegroundPermissionsAsync();
      if (locationStatus.status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to find cafes near you.',
          [
            {
              text: 'Try Again',
              onPress: requestPermissions
            },
            {
              text: 'Continue Anyway',
              onPress: () => setPermissionsReady(true)
            }
          ]
        );
        return;
      }

      // Only request notification permissions if user is authenticated
      if (auth.currentUser) {
        const notificationStatus = await Notifications.requestPermissionsAsync();
        if (notificationStatus.status !== 'granted') {
          Alert.alert(
            'Notification Permission Required',
            'Please enable notifications to receive visit reminders.',
            [
              {
                text: 'Try Again',
                onPress: requestPermissions
              },
              {
                text: 'Continue Anyway',
                onPress: () => setPermissionsReady(true)
              }
            ]
          );
          return;
        }
      }

      setPermissionsReady(true);
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert(
        'Error',
        'Failed to request permissions. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: requestPermissions
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