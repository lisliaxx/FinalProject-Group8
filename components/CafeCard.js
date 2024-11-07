import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useFavorites } from '../context/FavoritesContext';

function CafeCard({ cafe, onPress }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isfav = isFavorite(cafe.id);

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
            {cafe.rating > 0 ? `★ ${cafe.rating}` : 'No ratings yet'}
          </Text>
          {cafe.reviewCount > 0 && (
            <Text style={styles.reviewCount}>
              ({cafe.reviewCount} {cafe.reviewCount === 1 ? 'review' : 'reviews'})
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