import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CafeList from '../components/CafeList';
import { useFavorites } from '../context/FavoritesContext';
import Colors from '../constants/Colors';

function FavoritesScreen({ navigation }) {
  const { getFavorites } = useFavorites();
  const favoriteCafes = getFavorites();

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
      <Text style={styles.title}>Favorite Cafes</Text>
      {favoriteCafes.length > 0 ? (
        <CafeList
          cafes={favoriteCafes}
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