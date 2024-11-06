import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from './screens/MapScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import CafeDetailsScreen from './screens/CafeDetailsScreen';
import Colors from './constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
    </Stack.Navigator>
  );
};

// Separate stack navigator for Favorites screens
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
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
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
        <Tab.Screen 
          name="Map" 
          component={MapStackNavigator}
        />
        <Tab.Screen 
          name="Favorites" 
          component={FavoritesStackNavigator}
        />
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
    </NavigationContainer>
  );
};

export default App;