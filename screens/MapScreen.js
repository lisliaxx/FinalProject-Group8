import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// Add your Yelp API key to .env file
const YELP_API_KEY = process.env.EXPO_PUBLIC_YELP_API_KEY;

function MapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);
  const [cafes, setCafes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        
        // Set a tighter zoom level
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,    // Even smaller zoom level
          longitudeDelta: 0.01,   // Even smaller zoom level
        });

        await fetchNearbyCafes(currentLocation.coords);
      } catch (error) {
        setErrorMsg('Error getting location');
        console.error(error);
      }
    })();
  }, []);

  const fetchNearbyCafes = async (coords) => {
    try {
      const response = await fetch(
        `https://api.yelp.com/v3/businesses/search?term=cafe&latitude=${coords.latitude}&longitude=${coords.longitude}&radius=1000&limit=15&sort_by=distance`, // Added sort_by=distance
        {
          headers: {
            Authorization: `Bearer ${YELP_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Yelp API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Found ${data.businesses?.length} cafes nearby`);
      setCafes(data.businesses);
    } catch (error) {
      console.error('Error fetching cafes:', error);
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
        >
          {cafes.map((cafe) => (
            <Marker
              key={cafe.id}
              coordinate={{
                latitude: cafe.coordinates.latitude,
                longitude: cafe.coordinates.longitude,
              }}
              title={cafe.name}
              description={`${cafe.location.address1} • Rating: ${cafe.rating}⭐️`}
              pinColor="red"
              image={require('../assets/CafeMarker.png')} // Optional: Add a custom cafe marker icon
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