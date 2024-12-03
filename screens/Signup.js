import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { auth } from '../Firebase/firebaseSetup'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Colors from '../constants/Colors';

export default function Signup({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);

  // Function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to validate password requirements
  const isValidPassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
  };

  const getPasswordErrors = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('• At least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('• One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('• One lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('• One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('• One special character (!@#$%^&*(),.?":{}|<>)');
    }
    
    return errors;
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordErrors(getPasswordErrors(text));
  };

  const handleSignup = async () => {
    // Check if email is valid
    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Check password requirements
    if (!isValidPassword(password)) {
      return; 
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      // Firebase function to create a user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User registered:', user);
      
      navigation.replace('MainApp');
      
    } catch (error) {
      console.error('Error during signup:', error);
      Alert.alert('Signup Error', error.message); // Display error message
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
            <Text style={styles.header}>Create Account</Text>
            <Text style={styles.subHeader}>Join our coffee-loving community</Text>
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
            onChangeText={handlePasswordChange}
            style={styles.input}
            secureTextEntry
            placeholderTextColor={Colors.textSecondary}
          />
          {passwordErrors.length > 0 && (
            <Text style={styles.passwordHint}>
              Password must contain:{'\n'}
              {passwordErrors.join('\n')}
            </Text>
          )}
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            style={styles.input}
            secureTextEntry
            placeholderTextColor={Colors.textSecondary}
          />
          
          
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={handleSignup}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchTextHighlight}>Log in</Text>
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
  passwordHint: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'left',
    paddingHorizontal: 16,
  },
  signupButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signupButtonText: {
    color: Colors.white,
    fontSize: 18,
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
});
