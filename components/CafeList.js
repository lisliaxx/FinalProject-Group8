import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import CafeCard from './CafeCard';

function CafeList({ cafes, onCafePress }) {
  return (
    <FlatList
      data={cafes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CafeCard
          cafe={item}
          distance={item.distance}
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