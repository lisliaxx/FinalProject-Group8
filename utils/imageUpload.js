import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../Firebase/firebaseSetup';

export const uploadImage = async (uri, path) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const fileSize = blob.size / (1024 * 1024);
    if (fileSize > 5) {
      throw new Error('Image file size too large');
    }

    const filename = `${path}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    
    const metadata = {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=3600',
    };

    await uploadBytes(storageRef, blob, metadata);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
}; 