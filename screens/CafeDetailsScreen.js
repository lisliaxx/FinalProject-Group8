import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useReviews } from '../context/ReviewContext';
import ScheduleModal from '../components/ScheduleModal';
import EditReviewModal from '../components/EditReviewModal';
import ReviewItem from '../components/ReviewItem'; 
import { database, auth } from '../Firebase/firebaseSetup'; 
import { collection, query, where, getDocs } from 'firebase/firestore';

const CafeDetailsScreen = ({ route, navigation }) => {
  const { getReviewsByCafeId, editReview, deleteReview } = useReviews();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [cafeReviews, setCafeReviews] = useState([]); // State to hold fetched reviews

  const cafe = route.params?.cafe;
  const cafeId = cafe?.id;

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

    // Fetch reviews from Firestore that match the cafeId and the current user's uid
    useEffect(() => {
      const fetchUserReviews = async () => {
        try {
          const userId = auth.currentUser?.uid;
          if (!userId) {
            Alert.alert("Error", "User is not logged in.");
            return;
          }
  
          const reviewsRef = collection(database, 'reviews');
          const q = query(reviewsRef, where('cafeId', '==', cafeId), where('userId', '==', userId));
          const querySnapshot = await getDocs(q);
  
          const reviews = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setCafeReviews(reviews);
        } catch (error) {
          Alert.alert("Error", "Failed to load reviews.");
        }
      };
  
      fetchUserReviews();
    }, [cafeId]);

  const handleEditReview = (review) => {
    if (review.author === 'You') {
      setEditingReview(review);
    }
  };

  const handleDeleteReview = (reviewId) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteReview(reviewId) }
      ]
    );
  };

  const handleSaveEdit = (updatedReview) => {
    const updatedReviews = cafeReviews.map(review => 
      review.id === updatedReview.id ? updatedReview : review
    );
    setCafeReviews(updatedReviews);
    setEditingReview(null);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.name}>{cafe?.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {cafeReviews.length > 0 
              ? (cafeReviews.reduce((sum, review) => sum + review.rating, 0) / cafeReviews.length).toFixed(1)
              : '0'}</Text>
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
                <ReviewItem 
                  key={review.id} 
                  review={review}
                  onEdit={handleEditReview}
                  onDelete={review.userId === auth.currentUser.uid ? handleDeleteReview : undefined}
                />
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

      {editingReview && (
        <EditReviewModal
          visible={!!editingReview}
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSave={handleSaveEdit}
        />
      )}
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