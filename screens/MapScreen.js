import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const YELP_API_KEY = process.env.EXPO_PUBLIC_YELP_API_KEY;

function MapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    console.log('Cafes updated:', cafes.length);
  }, [cafes]);

  useEffect(() => {
    console.log('Map ready state:', isMapReady);
  }, [isMapReady]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        console.log('Got location:', currentLocation.coords);
        setLocation(currentLocation);
        
        const newRegion = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        
        setRegion(newRegion);
      } catch (error) {
        console.error('Location error:', error);
        setErrorMsg('Error getting location');
      }
    })();
  }, []);

  useEffect(() => {
    if (location && isMapReady) {
      console.log('Fetching cafes...');
      fetchNearbyCafes(location.coords);
    }
  }, [location, isMapReady]);

  useEffect(() => {
    loadSavedCafes();
  }, []);

  useEffect(() => {
    if (cafes.length > 0) {
      saveCafes(cafes);
    }
  }, [cafes]);

  const saveCafes = async (cafesData) => {
    try {
      await AsyncStorage.setItem('savedCafes', JSON.stringify(cafesData));
      console.log('Cafes saved to storage');
    } catch (error) {
      console.error('Error saving cafes:', error);
    }
  };

  const loadSavedCafes = async () => {
    try {
      const savedCafes = await AsyncStorage.getItem('savedCafes');
      if (savedCafes) {
        setCafes(JSON.parse(savedCafes));
        console.log('Loaded saved cafes');
      }
    } catch (error) {
      console.error('Error loading saved cafes:', error);
    }
  };

  const fetchNearbyCafes = async (coords) => {
    try {
      console.log('Fetching new cafes...');
      const url = `https://api.yelp.com/v3/businesses/search?term=cafe&latitude=${coords.latitude}&longitude=${coords.longitude}&radius=2000&limit=20`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Yelp API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.businesses && data.businesses.length > 0) {
        setCafes(data.businesses);
      }
    } catch (error) {
      console.error('Error fetching cafes:', error);
      setErrorMsg('Error fetching cafes');
    }
  };

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton
          onMapReady={() => {
            console.log('Map is ready');
            setIsMapReady(true);
          }}
          onRegionChangeComplete={(newRegion) => {
            setRegion(newRegion);
          }}
        >
          {cafes.length > 0 && cafes.map((cafe) => (
            <Marker
              key={cafe.id}
              coordinate={{
                latitude: cafe.coordinates.latitude,
                longitude: cafe.coordinates.longitude,
              }}
              title={cafe.name}
              description={`${cafe.location.address1} • Rating: ${cafe.rating}⭐️`}
              image={require('../assets/CafeMarker.png')}
            />
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default MapScreen;
