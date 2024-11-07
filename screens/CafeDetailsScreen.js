import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Colors from '../constants/Colors';
import { useReviews } from '../context/ReviewContext';

const ReviewItem = ({ review }) => (
  <View style={styles.reviewItem}>
    <View style={styles.reviewHeader}>
      <View style={styles.reviewerInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{review.author[0]}</Text>
        </View>
        <View>
          <Text style={styles.authorName}>{review.author}</Text>
          <Text style={styles.date}>{review.date}</Text>
        </View>
      </View>
      <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}</Text>
    </View>
    <Text style={styles.reviewText}>{review.content}</Text>
    {review.photoUrl && (
      <Image 
        source={{ uri: review.photoUrl }} 
        style={styles.reviewImage}
        resizeMode="cover"
      />
    )}
  </View>
);

const CafeDetailsScreen = ({ route, navigation }) => {
  const { getReviewsByCafeId } = useReviews();
  const cafeId = route?.params?.id || 'sample-cafe';
  const reviews = getReviewsByCafeId(cafeId);

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

      {/* Reviews Section */}
      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <TouchableOpacity 
            style={styles.addReviewButton}
            onPress={() => navigation.navigate('AddReview', { cafeId })}
          >
            <Text style={styles.addReviewText}>+ Add Review</Text>
          </TouchableOpacity>
        </View>
        
        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.textPrimary,
  },
  rating: {
    fontSize: 18,
    color: Colors.rating,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.primary,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addReviewButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addReviewText: {
    color: Colors.white,
    fontWeight: '600',
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reviewRating: {
    color: Colors.rating,
    fontSize: 16,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});

export default CafeDetailsScreen;