import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { auth } from '../Firebase/firebaseSetup'; 

const ReviewItem = ({ review, onEdit, onDelete }) => {
  const swipeableRef = useRef(null);

  const currentUser = auth.currentUser;

  const handleDelete = () => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        {
          text: "Cancel",
          onPress: () => swipeableRef.current?.close(),
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            swipeableRef.current?.close();
            onDelete(review.id);
          },
          style: "destructive"
        }
      ]
    );
  };

  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={handleDelete}
      >
        <Ionicons name="trash-outline" size={24} color={Colors.white} />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
    >
      <TouchableOpacity 
        style={styles.reviewItem}
        onPress={() => review?.author === 'You' && onEdit(review)}
      >
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{review?.author?.[0] || 'U'}</Text>
            </View>
            <View>
              <Text style={styles.authorName}>{currentUser?.email || 'Unknown'}</Text>
              <Text style={styles.date}>
                {review?.date|| 'N/A'}
                {review?.edited && ' (edited)'}
              </Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.reviewRating}>{'★'.repeat(review?.rating)}</Text>
            <Text style={styles.unfilledStars}>{'★'.repeat(5 - review?.rating)}</Text>
          </View>
        </View>
        <Text style={styles.reviewText}>{review?.review || 'No review available'}</Text>
        {review?.photoUrl ? (
          <Image 
            source={{ uri: review.photoUrl }} 
            style={styles.reviewImage}
            resizeMode="cover"
          />
        ): null}
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
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
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewRating: {
    color: Colors.rating,
    fontSize: 16,
  },
  unfilledStars: {
    color: Colors.border,
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
  deleteAction: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
});

export default ReviewItem;