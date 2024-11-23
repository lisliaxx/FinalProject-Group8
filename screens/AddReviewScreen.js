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
import { database, auth, storage } from '../Firebase/firebaseSetup'; 
import { collection, addDoc } from 'firebase/firestore';
import { uploadImage } from '../utils/imageUpload';
import * as ImageManipulator from 'expo-image-manipulator';

const AddReviewScreen = ({ navigation, route }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { cafeId, cafeName } = route.params;
  
  const handleAddPhoto = async () => {
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const resizedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        setImages((prevImages) => [...prevImages, resizedImage.uri]);
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert('Error', 'Could not add photo. Please try again.');
    }
  };
  
  const handleRemovePhoto = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!rating || !review.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    setUploading(true);
    try {
      const photoUrls = [];
      for (const image of images) {
        const url = await uploadImage(image, `reviews/${auth.currentUser.uid}`);
        photoUrls.push(url);
      }

      const newReview = {
        userId: auth.currentUser.uid,
        email: auth.currentUser?.email,
        cafeId,
        cafeName,
        rating,
        review: review.trim(),
        photoUrls,
        date: new Date().toISOString(),
      };

      await addDoc(collection(database, 'reviews'), newReview);
      Alert.alert('Success', `Your review for ${cafeName} has been posted!`);
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
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
          <Text style={styles.sectionTitle}>Photos</Text>
          <TouchableOpacity style={styles.photoButton} onPress={handleAddPhoto}>
            <Ionicons name="camera-outline" size={24} color={Colors.primary} />
            <Text style={styles.photoButtonText}>Add Photo</Text>
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Ionicons name="close" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
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
  imageScroll: { 
    flexDirection: 'row', 
    marginTop: 8 
  },
  imageContainer: { 
    marginRight: 12, 
    position: 'relative' 
  },
  imagePreview: { 
    width: 120, 
    height: 120, 
    borderRadius: 8 
  },
  removeImageButton: { 
    position: 'absolute', 
    top: -10, 
    right: -10 
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