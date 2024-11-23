import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useReviews } from '../context/ReviewContext';
import ScheduleModal from '../components/ScheduleModal';
import EditReviewModal from '../components/EditReviewModal';
import ReviewItem from '../components/ReviewItem'; 
import { database, auth } from '../Firebase/firebaseSetup'; 
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, getDoc, orderBy } from 'firebase/firestore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFavorites } from '../context/FavoritesContext';

const CafeDetailsScreen = ({ route, navigation }) => {
  const { getReviewsByCafeId, editReview, deleteReview } = useReviews();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [cafeReviews, setCafeReviews] = useState([]);
  const [cafeDetails, setCafeDetails] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [yelpRating, setYelpRating] = useState(0);
  const [combinedRating, setCombinedRating] = useState(0);
  const [totalReviewCount, setTotalReviewCount] = useState(0);

  const cafe = route.params?.cafe;
  const cafeId = cafe?.id;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              console.log('Toggle favorite for:', cafe.name);
              toggleFavorite(cafe);
            }}
          >
            <Ionicons 
              name={isFavorite(cafe.id) ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite(cafe.id) ? Colors.error : Colors.textLight}
            />
          </TouchableOpacity>
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
        </View>
      ),
    });
  }, [navigation, cafe, isFavorite]);

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
      const fetchCafeDetails = async () => {
        try {
          const API_KEY = process.env.EXPO_PUBLIC_YELP_API_KEY?.trim(); // Remove any leading/trailing spaces or extra characters
          if (!API_KEY) {
            console.error('Missing Yelp API Key');
            return;
          }

          const response = await fetch(
            `https://api.yelp.com/v3/businesses/${cafeId}`,
            {
              headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );
          const data = await response.json();
          console.log('Yelp API Response:', data); // Debug log
          setCafeDetails(data);
          setYelpRating(data.rating || 0);
        } catch (error) {
          console.error('Error fetching cafe details:', error);
          Alert.alert('Error', 'Failed to load cafe details');
        }
      };
  
      if (cafeId) {
        fetchCafeDetails();
      }
    }, [cafeId]);
  
  useEffect(() => {
    if (cafeReviews.length > 0) {
      const localTotal = cafeReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgLocalRating = localTotal / cafeReviews.length;
      
      // Combined rating (50% Yelp, 50% local)
      const combined = (yelpRating + avgLocalRating) / 2;
      setCombinedRating(combined);
      
      // Combined review count (Yelp + local)
      setTotalReviewCount(cafe.review_count + cafeReviews.length);
    } else {
      setCombinedRating(yelpRating);
      setTotalReviewCount(cafe.review_count);
    }
  }, [cafeReviews, yelpRating, cafe.review_count]);

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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Fetch cafe details
      const response = await fetch(
        `https://api.yelp.com/v3/businesses/${cafeId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_YELP_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setCafeDetails(data);
      setYelpRating(data.rating || 0);

      // Fetch reviews
      const reviewsRef = collection(database, 'reviews');
      const q = query(
        reviewsRef,
        where('cafeId', '==', cafe.id),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedReviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCafeReviews(fetchedReviews);

      // Update total review count
      setTotalReviewCount(data.review_count + fetchedReviews.length);

    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [cafe?.id, cafeId]);

  // Fetch Yelp details
  useEffect(() => {
    const fetchCafeDetails = async () => {
      try {
        const response = await fetch(
          `https://api.yelp.com/v3/businesses/${cafeId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_YELP_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        setCafeDetails(data);
        setYelpRating(data.rating || 0);
      } catch (error) {
        console.error('Error fetching cafe details:', error);
        Alert.alert('Error', 'Failed to load cafe details');
      }
    };

    if (cafeId) {
      fetchCafeDetails();
    }
  }, [cafeId]);

  const formatHours = (hours) => {
    if (!hours || !hours.length) return 'Hours not available';
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return hours[0].open.map(schedule => {
      const day = daysOfWeek[schedule.day];
      const start = schedule.start.replace(/(\d{2})(\d{2})/, '$1:$2');
      const end = schedule.end.replace(/(\d{2})(\d{2})/, '$1:$2');
      return `${day}: ${start} - ${end}`;
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
       {/* Cafe Info Section */}
      <View style={styles.cafeInfo}>
        {/* Display image_url */}
        {cafeDetails?.image_url && (
          <Image
            source={{ uri: cafeDetails.image_url }}
            style={styles.cafeImage}
          />
        )}
        <Text style={styles.cafeName}>{cafeDetails?.name}</Text>

          {/* Rating Section */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  style={[
                    styles.star,
                    star <= Math.round(combinedRating) ? styles.starFilled : styles.starEmpty
                  ]}
                >
                  ★
                </Text>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {combinedRating.toFixed(1)} ({totalReviewCount} reviews)
            </Text>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.sectionContent}>
            {cafe.location.address1 || 'Address not available'}
            {cafe.location.address2 ? `\n${cafe.location.address2}` : ''}
            {`\n${cafe.location.city}, ${cafe.location.state} ${cafe.location.zip_code}`}
          </Text>
          {cafe.phone && (
            <Text style={styles.phoneNumber}>{cafe.phone}</Text>
          )}
        </View>

        {/* Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours</Text>
          {cafeDetails?.hours ? (
            <View>
              {formatHours(cafeDetails.hours).map((schedule, index) => (
                <Text key={index} style={styles.hoursText}>{schedule}</Text>
              ))}
            </View>
          ) : (
            <Text style={styles.sectionContent}>Hours not available</Text>
          )}
        </View>

        {/* Categories Section */}
        {cafe.categories && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {cafe.categories.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <Text style={styles.categoryText}>{category.title}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

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
  cafePhotos: {
    marginVertical: 16,
  },
  cafePhoto: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },

  cafeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  ratingContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  star: {
    fontSize: 24,
    marginHorizontal: 2,
  },
  starFilled: {
    color: Colors.rating,
  },
  starEmpty: {
    color: Colors.textSecondary,
  },
  ratingText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: 4,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginHorizontal: 8,
    padding: 4,
  },
  cafeImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  priceText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  phoneNumber: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  hoursText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
});

export default CafeDetailsScreen;