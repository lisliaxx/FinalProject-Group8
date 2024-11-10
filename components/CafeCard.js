import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useFavorites } from '../context/FavoritesContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../Firebase/firebaseSetup';

function CafeCard({ cafe, onPress }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isfav = isFavorite(cafe.id);
  const [cafeRating, setCafeRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsRef = collection(database, 'reviews');
        const q = query(reviewsRef, where('cafeId', '==', cafe.id));
        const querySnapshot = await getDocs(q);
        
        const reviews = querySnapshot.docs.map(doc => doc.data());
        const totalReviews = reviews.length;
        
        if (totalReviews > 0) {
          const avgRating = (
            reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          ).toFixed(1);
          setCafeRating(avgRating);
        }
        
        setReviewCount(totalReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [cafe.id]);

  const handleFavoritePress = (e) => {
    e.stopPropagation();
    toggleFavorite(cafe);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{cafe.name}</Text>
          <TouchableOpacity 
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isfav ? 'heart' : 'heart-outline'}
              size={24}
              color={isfav ? Colors.error : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>
            {reviewCount > 0 ? `★ ${cafeRating}` : 'No ratings yet'}
          </Text>
          {reviewCount > 0 && (
            <Text style={styles.reviewCount}>
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </Text>
          )}
        </View>
        <Text style={styles.address}>{cafe.address}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    color: Colors.rating,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  address: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default CafeCard;