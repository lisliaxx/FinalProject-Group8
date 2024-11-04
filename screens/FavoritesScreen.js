import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CafeList from '../components/CafeList';

function FavoritesScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Favorites</Text>
      <CafeList 
        favorites={true}
        onCafePress={(cafe) => navigation.navigate('CafeDetails', { cafeId: cafe.id })}
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

export default FavoritesScreen;