import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const ReviewItem = ({ review, onEdit, onDelete, isEditable }) => {
  const formattedDate = new Date(review.date).toLocaleString();
  const images = review.photoUrls || (review.photoUrl ? [review.photoUrl] : []);
  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            "Delete Review",
            "Are you sure you want to delete this review?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => onDelete(review.id) }
            ]
          );
        }}
      >
        <Ionicons name="trash-outline" size={24} color={Colors.white} />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      renderRightActions={isEditable ? renderRightActions : null}
      rightThreshold={40}
    >
      <TouchableOpacity 
        style={styles.reviewContainer}
        onPress={() => isEditable && onEdit(review)}
      >
        {/* User Info and Rating */}
        <View style={styles.headerRow}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{review.email[0].toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.emailText}>{review.email}</Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text
                key={star}
                style={[styles.star, star <= review.rating ? styles.starFilled : styles.starEmpty]}
              >
                ★
              </Text>
            ))}
          </View>
        </View>

        {/* Review Text */}
        <Text style={styles.reviewText}>{review.review}</Text>

        {/* Images */}
        {images.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {images.map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.reviewImage}
              />
            ))}
          </ScrollView>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
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
  emailText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 18,
    marginHorizontal: 1,
  },
  starFilled: {
    color: Colors.rating || '#FFD700',
  },
  starEmpty: {
    color: Colors.textSecondary,
  },
  reviewText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 22,
  },
  imageScroll: {
    marginVertical: 8,
  },
  reviewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
});

export default ReviewItem;