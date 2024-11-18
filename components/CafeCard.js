import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useFavorites } from '../context/FavoritesContext';

function CafeCard({ cafe, onPress, distance }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isfav = isFavorite(cafe.id);

  const formatDistance = (meters) => {
    if (!meters) return 'Distance unknown';
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

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
        <View style={styles.infoContainer}>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {cafe.rating}</Text>
            <Text style={styles.reviewCount}>
              ({cafe.review_count} reviews)
            </Text>
          </View>
          <Text style={styles.distance}>{formatDistance(distance)}</Text>
        </View>
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
    marginBottom: 8,
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
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  distance: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default CafeCard;