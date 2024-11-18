import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import CafeList from '../components/CafeList';
import { useFavorites } from '../context/FavoritesContext';
import Colors from '../constants/Colors';

function FavoritesScreen({ navigation }) {
  const { getFavorites } = useFavorites();
  const [userLocation, setUserLocation] = useState(null);
  const [sortedCafes, setSortedCafes] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    if (userLocation) {
      const favoriteCafes = getFavorites();
      const cafesWithDistance = favoriteCafes.map(cafe => ({
        ...cafe,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          cafe.coordinates.latitude,
          cafe.coordinates.longitude
        )
      }));

      // Sort by distance
      const sorted = cafesWithDistance.sort((a, b) => a.distance - b.distance);
      setSortedCafes(sorted);
    }
  }, [userLocation, getFavorites]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; 
  };

  const handleCafePress = (cafe) => {
    navigation.navigate('CafeDetails', { cafe });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Cafes</Text>
      {sortedCafes.length > 0 ? (
        <CafeList
          cafes={sortedCafes}
          onCafePress={handleCafePress}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorite cafes yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on any cafe to add it to your favorites
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default FavoritesScreen;