import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { auth } from '../Firebase/firebaseSetup'; 
import { signInWithEmailAndPassword, sendPasswordResetEmail  } from 'firebase/auth'; 
import Colors from '../constants/Colors';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in:', user);
      navigation.replace('MainApp');
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Login Error', error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email to reset your password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset',
        'A password reset email has been sent. Please check your inbox.'
      );
    } catch (error) {
      console.error('Error sending password reset email:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.logoSection}>
            <Image 
              source={require('../assets/Logo.png')} 
              style={styles.logo}
            />
            <Text style={styles.header}>Welcome Back</Text>
            <Text style={styles.subHeader}>Login to find your perfect cafe</Text>
          </View>
          
          <TextInput
            placeholder="Email Address"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.textSecondary}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
            secureTextEntry
            placeholderTextColor={Colors.textSecondary}
          />
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.switchText}>
              New User? <Text style={styles.switchTextHighlight}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPasswordText: {
    marginTop: 16,
    textAlign: 'center',
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    marginTop: 24,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 16,
  },
  switchTextHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 2,
    resizeMode: 'contain',
  },
});
