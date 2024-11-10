import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from './screens/MapScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import CafeDetailsScreen from './screens/CafeDetailsScreen';
import AddReviewScreen from './screens/AddReviewScreen';
import Colors from './constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ReviewProvider } from './context/ReviewContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Firebase/firebaseSetup';
import Login from './screens/Login';
import Signup from './screens/Signup';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

const MapStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MapView"
        component={MapScreen}
        options={{
          title: 'Map',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.textLight,
        }}
      />
      <Stack.Screen 
        name="CafeDetails"
        component={CafeDetailsScreen}
        options={{
          title: 'Cafe Details',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.textLight,
        }}
      />
      <Stack.Screen 
        name="AddReview"
        component={AddReviewScreen}
        options={{
          title: 'Write a Review',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.textLight,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const FavoritesStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FavoritesList"
        component={FavoritesScreen}
        options={{
          title: 'Favorites',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.textLight,
        }}
      />
      <Stack.Screen 
        name="CafeDetails"
        component={CafeDetailsScreen}
        options={{
          title: 'Cafe Details',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.textLight,
        }}
      />
      <Stack.Screen 
        name="AddReview"
        component={AddReviewScreen}
        options={{
          title: 'Write a Review',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.textLight,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.disabled,
        tabBarStyle: {
          backgroundColor: Colors.background,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Map" component={MapStackNavigator} />
      <Tab.Screen name="Favorites" component={FavoritesStackNavigator} />
      <Tab.Screen 
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.textLight,
        }}
      />
    </Tab.Navigator>
  );
};


// Defines the stack navigator for authentication screens
const AuthStackNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
    <AuthStack.Screen name="Signup" component={Signup} options={{ title: 'Signup',headerLeft: () => null, }} />
  </AuthStack.Navigator>
);

// Wraps the TabNavigator in a stack navigator to manage screen transitions and conditional navigation
const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={TabNavigator} />
  </Stack.Navigator>
);

// Main entry point of the application
const App = () => {
  // State to keep track of user authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Listen for authentication changes (e.g., user logging in or out)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Set isAuthenticated to true if user is logged in, false otherwise
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, []);

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 16,
    padding: 8,
  },
});

return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <ScheduleProvider>
      <FavoritesProvider>
        <ReviewProvider>
          <NavigationContainer>
            {isAuthenticated ? <MainStack /> : <AuthStackNavigator />}
          </NavigationContainer>
        </ReviewProvider>
      </FavoritesProvider>
    </ScheduleProvider>
  </GestureHandlerRootView>
  );
};
export default App;
