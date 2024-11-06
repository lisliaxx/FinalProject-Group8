import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import CafeCard from './CafeCard';

function CafeList({ favorites = false, onCafePress }) {
  const mockCafes = [
    {
      id: '1',
      name: 'Sample Cafe 1',
      rating: 4.5,
      address: '123 Coffee St',
    },
    {
      id: '2',
      name: 'Sample Cafe 2',
      rating: 4.2,
      address: '456 Tea Ave',
    },
  ];

  return (
    <FlatList
      data={mockCafes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CafeCard
          cafe={item}
          onPress={() => onCafePress(item)}
        />
      )}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});

export default CafeList;