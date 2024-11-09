import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../Firebase/firebaseSetup'; 
import { signOut } from 'firebase/auth'; 

function ProfileScreen({ navigation }) {
  const currentUser = auth.currentUser;

// Sign-out function
const handleSignOut = () => {
  signOut(auth)
    .then(() => {
      Alert.alert('Signed out', 'You have successfully signed out.');
      navigation.replace('Login'); // Navigate back to login screen
    })
    .catch((error) => {
      console.error('Error signing out: ', error);
      Alert.alert('Sign-out Error', error.message);
    });
};

  // Set up header with sign-out icon
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSignOut} style={styles.headerButton}>
          <Ionicons name="log-out-outline" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text>Email: {currentUser?.email}</Text>
      <Text>Uid: {currentUser?.uid}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default ProfileScreen;
