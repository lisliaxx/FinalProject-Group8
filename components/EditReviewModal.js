import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { storage, database } from '../Firebase/firebaseSetup'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EditReviewModal = ({ visible, onClose, reviewId, onSave }) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

    // Fetch review data from Firebase Firestore
    useEffect(() => {
      if (visible && reviewId) {
        const fetchReview = async () => {
          try {
            console.log("Fetching review data...");
            const reviewDocRef = doc(database, 'reviews', reviewId);
            const reviewSnap = await getDoc(reviewDocRef);
            if (reviewSnap.exists()) {
              const reviewData = reviewSnap.data();
              console.log("Review data fetched:", reviewData);
              setRating(reviewData.rating);
              setContent(reviewData.review);
              setImage(reviewData.photoUrl);
            } else {
              Alert.alert("Error", "Review not found.");
            }
          } catch (error) {
            Alert.alert("Error", "Failed to load review data.");
          }
        };
  
        fetchReview();
      }
    }, [visible, reviewId]);

  const pickImage = async () => {
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
        const imageUri = result.assets[0].uri;
  
        // Upload image to Firebase Storage
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const imageRef = ref(storage, `reviews/${reviewId}_${Date.now()}.jpg`);
        await uploadBytes(imageRef, blob);
  
        // Get the download URL
        const downloadUrl = await getDownloadURL(imageRef);
        setImage(downloadUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Review content cannot be empty');
      return;
    }
  
    let updatedPhotoUrl = image; // Start with the current image URL
  
    // If a new image was picked, upload it to Firebase Storage
    if (image && image.startsWith('file://')) {
      try {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `reviews/${reviewId}_${Date.now()}.jpg`);
        await uploadBytes(imageRef, blob);
        updatedPhotoUrl = await getDownloadURL(imageRef); // Get the new URL
      } catch (error) {
        Alert.alert("Error", "Failed to upload new image.");
        return;
      }
    }
  
    const updatedReview = {
      rating,
      review: content.trim(),
      photoUrl: updatedPhotoUrl, // Use the new or existing URL
      edited: true,
      date: new Date().toISOString(),
    };
  
    try {
      const reviewDocRef = doc(database, 'reviews', reviewId);
      await updateDoc(reviewDocRef, updatedReview); // Update Firestore with the edited review
      onSave({ ...updatedReview, id: reviewId }); // Pass updated review back to parent
      onClose(); // Close modal after saving
      Alert.alert("Success", "Review updated successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to update review.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Review</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

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

          <TextInput
            style={styles.input}
            multiline
            value={content}
            onChangeText={setContent}
            placeholder="Edit your review..."
            textAlignVertical="top"
          />

          <View style={styles.photoSection}>
            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity 
                  style={styles.removeImage}
                  onPress={() => setImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.photoButton}
                onPress={pickImage}
              >
                <Ionicons name="camera-outline" size={24} color={Colors.primary} />
                <Text style={styles.photoButtonText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    height: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    fontSize: 16,
  },
  photoSection: {
    marginBottom: 20,
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
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditReviewModal;