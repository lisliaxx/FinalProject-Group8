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
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { useReviews } from '../context/ReviewContext';
import { database, auth, storage } from '../Firebase/firebaseSetup'; 
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadImage } from '../utils/imageUpload';
import * as ImageManipulator from 'expo-image-manipulator';

const AddReviewScreen = ({ navigation, route }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { cafeId, cafeName } = route.params;
  
// Open the camera to take a photo

const handleTakePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Denied',
      'Camera permission is required to take photos.'
    );
    return;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaType.Images, // Updated from deprecated MediaTypeOptions
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Resize and compress the image
      const resizedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }], // Resize width to 800px
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress to 70% quality
      );
      setImage(resizedImage.uri); // Set the URI of the resized/compressed image
    }
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Could not take photo. Please try again.');
  }
};

const handleSubmit = async () => {
  if (!rating) {
    Alert.alert('Error', 'Please select a rating');
    return;
  }

  setUploading(true);
  try {
    let photoUrl = null;
    if (image) {
      photoUrl = await uploadImage(image, `reviews/${auth.currentUser.uid}`);
    }

    const newReview = {
      userId: auth.currentUser.uid,
      email: auth.currentUser?.email,
      cafeId,
      cafeName,
      rating,
      review: review.trim(),
      photoUrl,
      date: new Date().toISOString(),
    };

    await addDoc(collection(database, 'reviews'), newReview);
    Alert.alert('Success', `Your review for ${cafeName} has been posted!`);
    navigation.goBack();
  } catch (error) {
    console.error('Error submitting review:', error);
    Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
  } finally {
    setUploading(false);
  }
};

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          <Text style={styles.sectionTitle}>Take Photo</Text>
          <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
            <Ionicons name="camera-outline" size={24} color={Colors.primary} />
            <Text style={styles.photoButtonText}>Take Photo</Text>
          </TouchableOpacity>
          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <Ionicons name="close" size={24} color={Colors.error} />
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
        onPress={handleSubmit}
        disabled={!rating || !review.trim() || uploading}
      >
        <Text style={styles.submitButtonText}>Post Review</Text>
      </TouchableOpacity>
    </ScrollView>
  </TouchableWithoutFeedback>
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