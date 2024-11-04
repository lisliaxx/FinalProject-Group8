import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

function CafeDetailsScreen({ route }) {
  const mockCafeDetails = {
    name: 'Sample Cafe',
    rating: 4.5,
    address: '123 Coffee Street',
    hours: '8:00 AM - 8:00 PM',
    features: {
      petFriendly: true,
      hasParking: true,
      wheelchairAccessible: true,
      hasWifi: true
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{mockCafeDetails.name}</Text>
        <Text style={styles.rating}>★ {mockCafeDetails.rating}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <Text>{mockCafeDetails.address}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hours</Text>
        <Text>{mockCafeDetails.hours}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        {mockCafeDetails.features.petFriendly && 
          <Text>🐾 Pet Friendly</Text>}
        {mockCafeDetails.features.hasParking && 
          <Text>🚗 Parking Available</Text>}
        {mockCafeDetails.features.wheelchairAccessible && 
          <Text>♿ Wheelchair Accessible</Text>}
        {mockCafeDetails.features.hasWifi && 
          <Text>📶 Free WiFi</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rating: {
    fontSize: 18,
    color: '#FFD700',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default CafeDetailsScreen;