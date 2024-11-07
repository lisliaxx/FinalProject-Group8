import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { useReviews } from '../context/ReviewContext';

const AddReviewScreen = ({ navigation, route }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [image, setImage] = useState(null);
  
  // Get both cafeId and cafeName from route params
  const { cafeId, cafeName } = route.params;
  const { addReview } = useReviews();

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to add images.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (review.trim().length < 3) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    const newReview = {
      id: Date.now().toString(),
      author: 'You',
      rating: rating,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      content: review.trim(),
      photoUrl: image,
      cafeId: cafeId 
    };

    addReview(cafeId, newReview);
    
    Alert.alert(
      'Success',
      `Your review for ${cafeName} has been posted!`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Rating Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rating</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={32}
                color={star <= rating ? Colors.rating : Colors.disabled}
                style={styles.star}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Review Text Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Review</Text>
        <TextInput
          style={styles.reviewInput}
          multiline
          placeholder="Share your experience..."
          value={review}
          onChangeText={setReview}
          textAlignVertical="top"
        />
      </View>

      {/* Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Photo</Text>
        <TouchableOpacity 
          style={styles.photoButton}
          onPress={pickImage}
        >
          <Ionicons 
            name="camera-outline" 
            size={24} 
            color={Colors.primary}
          />
          <Text style={styles.photoButtonText}>
            Choose from gallery
          </Text>
        </TouchableOpacity>
        
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: image }}
              style={styles.imagePreview}
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setImage(null)}
            >
              <Ionicons 
                name="close-circle" 
                size={24} 
                color={Colors.error}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!rating || !review.trim()) && styles.submitButtonDisabled
        ]}
        onPress={handleSubmitReview}
        disabled={!rating || !review.trim()}
      >
        <Text style={styles.submitButtonText}>Post Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 8,
  },
  reviewInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    height: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  photoButtonText: {
    marginLeft: 8,
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    marginTop: 16,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddReviewScreen;