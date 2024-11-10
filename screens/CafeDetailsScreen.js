import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useReviews } from '../context/ReviewContext';
import ScheduleModal from '../components/ScheduleModal';
import EditReviewModal from '../components/EditReviewModal';
import ReviewItem from '../components/ReviewItem'; 
import { database, auth, storage } from '../Firebase/firebaseSetup'; 
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, getDoc, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const CafeDetailsScreen = ({ route, navigation }) => {
  const { getReviewsByCafeId, editReview, deleteReview } = useReviews();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [cafeReviews, setCafeReviews] = useState([]); // State to hold fetched reviews
  const [averageRating, setAverageRating] = useState(0);

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

    useEffect(() => {
      const fetchReviews = async () => {
        try {
          const reviewsRef = collection(database, 'reviews');
          const q = query(
            reviewsRef,
            where('cafeId', '==', cafe.id),
            orderBy('date', 'desc')
          );
          
          const querySnapshot = await getDocs(q);
          const reviews = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log('Fetched reviews:', reviews);
          setCafeReviews(reviews);
        } catch (error) {
          console.error('Error fetching reviews:', error);
          Alert.alert('Error', 'Failed to load reviews');
        }
      }

      fetchReviews();
    }, [cafeId]);

  useEffect(() => {
    if (cafeReviews.length > 0) {
      const total = cafeReviews.reduce((sum, review) => sum + review.rating, 0);
      const avg = total / cafeReviews.length;
      setAverageRating(avg);
    }
  }, [cafeReviews]);

  const handleEditReview = (review) => {
    if (auth.currentUser?.uid === review.userId) {
      setEditingReview(review);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteDoc(doc(database, 'reviews', reviewId));
      setCafeReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      Alert.alert('Error', 'Failed to delete review');
    }
  };

  const handleSaveEdit = (updatedReview) => {
    const updatedReviews = cafeReviews.map(review => 
      review.id === updatedReview.id ? updatedReview : review
    );
    setCafeReviews(updatedReviews);
    setEditingReview(null);
    Alert.alert("Success", "Review updated successfully.");
  };

  const handleEditPress = (reviewItem) => {
    setEditingReview(reviewItem);
  };

  const renderReview = (review) => {
    return (
      <View key={review.id} style={styles.reviewItem}>
        {review.userId === auth.currentUser?.uid && (
          <TouchableOpacity 
            onPress={() => handleEditPress(review)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Cafe Info Section */}
        <View style={styles.cafeInfo}>
          <Text style={styles.cafeName}>{cafe.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>★ {averageRating ? averageRating.toFixed(1) : 'N/A'}</Text>
            <Text style={styles.reviewCount}>({cafeReviews.length} reviews)</Text>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.sectionContent}>{cafe.address}</Text>
        </View>

        {/* Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours</Text>
          <Text style={styles.sectionContent}>{cafe.hours}</Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>🐾 Pet Friendly</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>🅿️ Parking Available</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>♿️ Wheelchair Accessible</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>📶 Free WiFi</Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
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

          {cafeReviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              isEditable={review.userId === auth.currentUser?.uid}
              onEdit={setEditingReview}
              onDelete={handleDeleteReview}
            />
          ))}
        </View>
      </ScrollView>

      {/* Modals */}
      <ScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        cafe={cafe}
      />
      <EditReviewModal
        isVisible={!!editingReview}
        onClose={() => setEditingReview(null)}
        review={editingReview}
        onSave={handleEditReview}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cafeInfo: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  cafeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    color: Colors.rating,
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.white,
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  featureItem: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addReviewButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addReviewText: {
    color: Colors.white,
    fontWeight: '500',
  },
});

export default CafeDetailsScreen;