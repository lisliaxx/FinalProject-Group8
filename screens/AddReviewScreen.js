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
import { database, auth, storage } from '../Firebase/firebaseSetup'; 
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddReviewScreen = ({ navigation, route }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { cafeId, cafeName } = route.params;
  

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        maxWidth: 1000,
        maxHeight: 1000,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImageAsync = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log('XHR error:', e);
        reject(new Error('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    try {
      const fileRef = ref(storage, `reviews/${auth.currentUser.uid}_${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob);
      blob.close(); // Important: close the blob when done

      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0 || review.trim().length < 3) {
      Alert.alert('Error', 'Please complete the review and rating.');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;
      
      if (image) {
        console.log('Starting image upload...');
        try {
          imageUrl = await uploadImageAsync(image);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          Alert.alert(
            'Warning',
            'Failed to upload image, but we can still post your review without it. Would you like to continue?',
            [
              {
                text: 'Cancel',
                onPress: () => {
                  setUploading(false);
                  return;
                },
                style: 'cancel',
              },
              {
                text: 'Continue',
                onPress: async () => {
                  await submitReviewToFirestore(null);
                },
              },
            ]
          );
          return;
        }
      }

      await submitReviewToFirestore(imageUrl);
    } catch (error) {
      console.error('Review submission error:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const submitReviewToFirestore = async (imageUrl) => {
    try {
      const newReview = {
        userId: auth.currentUser.uid,
        email: auth.currentUser?.email,
        cafeId,
        cafeName,
        rating,
        review: review.trim(),
        photoUrl: imageUrl,
        date: new Date().toISOString(),
      };

      console.log('Submitting review to Firestore:', newReview);
      
      const docRef = await addDoc(collection(database, 'reviews'), newReview);
      console.log('Review submitted successfully, doc ID:', docRef.id);
      
      Alert.alert(
        'Success',
        `Your review for ${cafeName} has been posted!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Firestore submission error:', error);
      throw error;
    }
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
          (!rating || !review.trim() || uploading) && styles.submitButtonDisabled
        ]}
        onPress={handleSubmitReview}
        disabled={!rating || !review.trim() || uploading}
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