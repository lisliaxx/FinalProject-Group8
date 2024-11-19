import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../Firebase/firebaseSetup';

const YELP_API_KEY = process.env.EXPO_PUBLIC_YELP_API_KEY;

function MapScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [cafeRatings, setCafeRatings] = useState({});

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

  const formatDistance = (meters) => {
    if (!meters) return 'Distance unknown';
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const calculateCombinedRating = (yelpRating, localReviews) => {
    if (localReviews.length === 0) return yelpRating;
    
    const localTotal = localReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgLocalRating = localTotal / localReviews.length;
    return (yelpRating + avgLocalRating) / 2;
  };

  const fetchLocalReviews = async (cafeId) => {
    try {
      const reviewsRef = collection(database, 'reviews');
      const q = query(reviewsRef, where('cafeId', '==', cafeId));
      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return reviews;
    } catch (error) {
      console.error('Error fetching local reviews:', error);
      return [];
    }
  };

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
        
        const ratings = {};
        await Promise.all(
          data.businesses.map(async (cafe) => {
            const localReviews = await fetchLocalReviews(cafe.id);
            const combinedRating = calculateCombinedRating(cafe.rating, localReviews);
            ratings[cafe.id] = {
              rating: combinedRating,
              totalReviews: cafe.review_count + localReviews.length
            };
          })
        );
        setCafeRatings(ratings);
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
        >
          {cafes.length > 0 && cafes.map((cafe) => {
            const distance = location ? calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              cafe.coordinates.latitude,
              cafe.coordinates.longitude
            ) : null;

            const cafeRating = cafeRatings[cafe.id] || { rating: cafe.rating, totalReviews: cafe.review_count };

            return (
              <Marker
                key={cafe.id}
                coordinate={{
                  latitude: cafe.coordinates.latitude,
                  longitude: cafe.coordinates.longitude,
                }}
                image={require('../assets/CafeMarker.png')}
              >
                <Callout
                  onPress={() => {
                    console.log('Navigating to details for:', cafe.name);
                    navigation.navigate('CafeDetails', { cafe });
                  }}
                >
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{cafe.name}</Text>
                    <Text style={styles.calloutAddress}>{cafe.location.address1}</Text>
                    <View style={styles.calloutInfo}>
                      <Text style={styles.calloutRating}>
                        ★ {cafeRating.rating.toFixed(1)} ({cafeRating.totalReviews})
                      </Text>
                      <Text style={styles.calloutDistance}>
                        {formatDistance(distance)}
                      </Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            );
          })}
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
  calloutContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  calloutAddress: {
    color: 'gray',
    fontSize: 12,
    marginBottom: 5,
  },
  calloutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calloutRating: {
    color: '#FFD700',
    fontSize: 12,
  },
  calloutDistance: {
    color: 'gray',
    fontSize: 12,
    marginLeft: 8,
  },
});

export default MapScreen;
