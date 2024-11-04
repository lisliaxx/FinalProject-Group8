import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CafeList from '../components/CafeList';

function MapScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Cafes</Text>
      <CafeList 
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

export default MapScreen;