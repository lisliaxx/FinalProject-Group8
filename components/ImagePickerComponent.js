import React from 'react';
import { TouchableOpacity, Image, View, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const ImagePickerComponent = ({ image, onImagePick, size = 200 }) => {
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
        maxWidth: 1200,
        maxHeight: 1200,
        compress: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Size check
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const fileSize = blob.size / (1024 * 1024);

        if (fileSize > 5) {
          Alert.alert(
            'Image Too Large', 
            'Please select an image smaller than 5MB'
          );
          return;
        }

        onImagePick(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} style={[styles.container, { width: size, height: size }]}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="camera" size={size / 4} color={Colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.disabled,
  },
});

export default ImagePickerComponent; 