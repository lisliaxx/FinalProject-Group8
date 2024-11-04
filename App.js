import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from './screens/MapScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import CafeDetailsScreen from './screens/CafeDetailsScreen.js';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MapStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MapView" 
        component={MapScreen} 
        options={{ title: 'Map' }}
      />
      <Stack.Screen 
        name="CafeDetails" 
        component={CafeDetailsScreen} 
        options={{ title: 'Cafe Details' }}
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
        options={{ title: 'Favorites' }}
      />
      <Stack.Screen 
        name="CafeDetails" 
        component={CafeDetailsScreen} 
        options={{ title: 'Cafe Details' }}
      />
    </Stack.Navigator>
  );
};

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="MapStack" 
          component={MapStackNavigator}
          options={{
            title: 'Map',
          }}
        />
        <Tab.Screen 
          name="FavoritesStack" 
          component={FavoritesStackNavigator}
          options={{
            title: 'Favorites',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Profile',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;