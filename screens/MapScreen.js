import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CafeList from '../components/CafeList';
import { useReviews } from '../context/ReviewContext';

function MapScreen({ navigation }) {
  const { getReviewsByCafeId } = useReviews();

  // Mock cafe data with unique IDs
  const mockCafes = [
    {
      id: '1',
      name: 'Sample Cafe 1',
      address: '123 Coffee St',
    },
    {
      id: '2',
      name: 'Sample Cafe 2',
      address: '456 Tea Ave',
    },
  ];

  // Calculate average rating for a cafe
  const calculateAverageRating = (cafeId) => {
    const reviews = getReviewsByCafeId(cafeId);
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  // Prepare cafe data with ratings
  const cafesWithRatings = mockCafes.map(cafe => ({
    ...cafe,
    rating: calculateAverageRating(cafe.id),
    reviewCount: getReviewsByCafeId(cafe.id).length
  }));

  const handleCafePress = (cafe) => {
    navigation.navigate('CafeDetails', {
      cafe: {
        ...cafe,
        hours: '9:00 AM - 8:00 PM',
        features: {
          petFriendly: true,
          hasParking: true,
          wheelchairAccessible: true,
          hasWifi: true
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Cafes</Text>
      <CafeList
        cafes={cafesWithRatings}
        onCafePress={handleCafePress}
      />
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
});

export default MapScreen;