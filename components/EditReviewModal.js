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
import { storage, database, auth } from '../Firebase/firebaseSetup'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import ImagePickerComponent from './ImagePickerComponent';
import { uploadImage } from '../utils/imageUpload';

const EditReviewModal = ({ isVisible, onClose, review, onSave }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setReviewText(review.review);
      setImage(review.photoUrl);
    }
  }, [review]);

  if (!review) {
    return null;
  }

  const handleSave = async () => {
    if (!rating) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!review) {
      Alert.alert('Error', 'Review data not found');
      return;
    }

    setIsUploading(true);
    try {
      let photoUrl = null;
      
      if (image) {
        if (!image.startsWith('http')) {
          photoUrl = await uploadImage(image, `reviews/${auth.currentUser.uid}`);
        } else {
          photoUrl = image;
        }
      }

      const updatedReview = {
        cafeId: review.cafeId,
        cafeName: review.cafeName,
        date: new Date().toISOString(),
        email: auth.currentUser.email,
        photoUrl: photoUrl,
        rating: rating,
        review: reviewText.trim(),
        userId: auth.currentUser.uid
      };

      await updateDoc(doc(database, 'reviews', review.id), updatedReview);
      onSave({ ...updatedReview, id: review.id });
      onClose();
      Alert.alert("Success", "Review updated successfully.");
    } catch (error) {
      console.error('Error saving review:', error);
      Alert.alert("Error", "Failed to update review.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = () => {
    setImage(null);
  };

  const handleAddImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Review</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Text style={[
                    styles.star,
                    star <= rating ? styles.starFilled : styles.starEmpty
                  ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.reviewContainer}>
            <Text style={styles.label}>Review:</Text>
            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={4}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Write your review here..."
            />
          </View>

          <View style={styles.imageSection}>
            {image ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: image }}
                  style={styles.reviewImage}
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handleAddImage}
            >
              <Ionicons name="camera" size={30} color={Colors.textSecondary} />
              <Text style={styles.addImageText}>Add Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  star: {
    fontSize: 30,
    marginHorizontal: 4,
  },
  starFilled: {
    color: Colors.rating || '#FFD700',
  },
  starEmpty: {
    color: Colors.textSecondary,
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
  imageSection: {
    marginVertical: 16,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  reviewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addImageButton: {
    width: 200,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  addImageText: {
    marginLeft: 8,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: Colors.secondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: Colors.white,
  },
});

export default EditReviewModal;