import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useReviews } from '../context/ReviewContext';
import ScheduleModal from '../components/ScheduleModal';

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
      <View style={styles.ratingContainer}>
        <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}</Text>
        <Text style={styles.unfilledStars}>{'★'.repeat(5 - review.rating)}</Text>
      </View>
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
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const cafe = route.params?.cafe;
  const cafeId = cafe?.id;
  const cafeReviews = getReviewsByCafeId(cafeId);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowScheduleModal(true)}
        >
          <Ionicons 
            name="calendar-outline" 
            size={24} 
            color={Colors.textLight}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const averageRating = cafeReviews.length > 0
    ? (cafeReviews.reduce((sum, review) => sum + review.rating, 0) / cafeReviews.length).toFixed(1)
    : '0';

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.name}>{cafe?.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {averageRating}</Text>
            <Text style={styles.reviewCount}>({cafeReviews.length} reviews)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text>{cafe?.address}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours</Text>
          <Text>{cafe?.hours || '8:00 AM - 8:00 PM'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresContainer}>
            {cafe?.features?.petFriendly && (
              <View style={styles.featureItem}>
                <Text style={styles.featureText}>🐾 Pet Friendly</Text>
              </View>
            )}
            {cafe?.features?.hasParking && (
              <View style={styles.featureItem}>
                <Text style={styles.featureText}>🚗 Parking Available</Text>
              </View>
            )}
            {cafe?.features?.wheelchairAccessible && (
              <View style={styles.featureItem}>
                <Text style={styles.featureText}>♿ Wheelchair Accessible</Text>
              </View>
            )}
            {cafe?.features?.hasWifi && (
              <View style={styles.featureItem}>
                <Text style={styles.featureText}>📶 Free WiFi</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity 
              style={styles.addReviewButton}
              onPress={() => navigation.navigate('AddReview', { 
                cafeId: cafeId,
                cafeName: cafe?.name 
              })}
            >
              <Text style={styles.addReviewText}>+ Add Review</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.reviewsList}>
            {cafeReviews.length > 0 ? (
              cafeReviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))
            ) : (
              <Text style={styles.noReviewsText}>
                No reviews yet. Be the first to review!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <ScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        cafe={cafe}
      />
    </>
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
  headerButton: {
    marginRight: 16,
    padding: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.textPrimary,
  },
  scheduleButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignSelf: 'flex-start',
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  noReviewsText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 16,
    padding: 20,
  },
  unfilledStars: {
    color: Colors.border,
    fontSize: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  featureItem: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
});

export default CafeDetailsScreen;