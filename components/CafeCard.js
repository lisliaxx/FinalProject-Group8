import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

function CafeCard({ cafe, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{cafe.name}</Text>
        <Text style={styles.rating}>★ {cafe.rating}</Text>
        <Text style={styles.address}>{cafe.address}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
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
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
});

export default CafeCard;