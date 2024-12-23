import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { auth, database, storage } from '../Firebase/firebaseSetup';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useSchedules } from '../context/ScheduleContext';
import { collection, query, where, getDocs } from 'firebase/firestore';

const separateSchedules = (schedules) => {
  const now = new Date();
  return {
    upcoming: schedules.filter(schedule => schedule.date > now)
      .sort((a, b) => a.date - b.date),
    past: schedules.filter(schedule => schedule.date <= now)
      .sort((a, b) => b.date - a.date) 
  };
};

const ProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: auth.currentUser?.email || '',
    photoURL: null,
  });
  const [tempProfileData, setTempProfileData] = useState({ ...profileData });
  const [userSchedules, setUserSchedules] = useState([]);
  const { removeSchedule } = useSchedules();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserSchedules();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={{ marginRight: 16 }}
          onPress={handleLogout}
        >
          <Ionicons 
            name="log-out-outline" 
            size={24} 
            color={Colors.textLight} 
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(database, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfileData(userData);
        setTempProfileData(userData);
      } else {
        const initialData = {
          name: '',
          email: auth.currentUser?.email || '',
          photoURL: null,
        };
        await setDoc(doc(database, 'users', auth.currentUser.uid), initialData);
        setProfileData(initialData);
        setTempProfileData(initialData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const fetchUserSchedules = async () => {
    try {
      const schedulesRef = collection(database, 'schedules');
      const q = query(schedulesRef, where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const schedules = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: new Date(doc.data().date)
      }));
      setUserSchedules(schedules.sort((a, b) => a.date - b.date));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      Alert.alert('Error', 'Failed to load schedules');
    }
  };

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
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setTempProfileData(prev => ({
          ...prev,
          photoURL: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profiles/${auth.currentUser.uid}/profile.jpg`;
      const imageRef = ref(storage, filename);
      await uploadBytes(imageRef, blob);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let photoURL = tempProfileData.photoURL;

      if (photoURL && photoURL.startsWith('file://')) {
        photoURL = await uploadImage(photoURL);
      }

      const updatedData = {
        ...tempProfileData,
        photoURL,
      };

      await updateDoc(doc(database, 'users', auth.currentUser.uid), updatedData);
      setProfileData(updatedData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await removeSchedule(scheduleId);
              if (success) {
                fetchUserSchedules();
              } else {
                Alert.alert('Error', 'Failed to delete schedule');
              }
            } catch (error) {
              console.error('Error deleting schedule:', error);
              Alert.alert('Error', 'Failed to delete schedule');
            }
          }
        }
      ]
    );
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchUserSchedules()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]} 
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.mainContent}>
        {/* Left Side - Profile Image */}
        <View style={styles.imageSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={isEditing ? pickImage : null}
          >
            {tempProfileData.photoURL ? (
              <Image
                source={{ uri: tempProfileData.photoURL }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color={Colors.textLight} />
              </View>
            )}
            {isEditing && (
              <View style={styles.editOverlay}>
                <Ionicons name="camera" size={20} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Right Side - User Info */}
        <View style={styles.infoSection}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={tempProfileData.name}
                onChangeText={(text) => setTempProfileData(prev => ({ ...prev, name: text }))}
                editable={isEditing}
                placeholder="Enter your name"
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={tempProfileData.email}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* Edit Icon */}
        <TouchableOpacity
          style={styles.editIconContainer}
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Ionicons 
            name={isEditing ? "checkmark-circle" : "pencil"} 
            size={20}
            color={isEditing ? Colors.success : Colors.primary}
          />
        </TouchableOpacity>

        {/* Cancel Icon */}
        {isEditing && (
          <TouchableOpacity
            style={styles.cancelIconContainer}
            onPress={() => {
              setTempProfileData(profileData);
              setIsEditing(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Upcoming Schedules Section */}
      <View style={styles.schedulesSection}>
        <Text style={styles.sectionTitle}>Upcoming Visits</Text>
        {separateSchedules(userSchedules).upcoming.length === 0 ? (
          <Text style={styles.noSchedulesText}>No upcoming visits</Text>
        ) : (
          separateSchedules(userSchedules).upcoming.map((schedule) => (
            <View key={schedule.id} style={styles.scheduleCard}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.cafeName}>{schedule.cafeName}</Text>
                <Text style={styles.scheduleDate}>
                  {schedule.date.toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteScheduleButton}
                onPress={() => handleDeleteSchedule(schedule.id)}
              >
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Past Schedules Section */}
      <View style={styles.schedulesSection}>
        <Text style={styles.sectionTitle}>Past Visits</Text>
        {separateSchedules(userSchedules).past.length === 0 ? (
          <Text style={styles.noSchedulesText}>No past visits</Text>
        ) : (
          separateSchedules(userSchedules).past.map((schedule) => (
            <View key={schedule.id} style={[styles.scheduleCard, styles.pastScheduleCard]}>
              <View style={styles.scheduleInfo}>
                <Text style={[styles.cafeName, styles.pastText]}>{schedule.cafeName}</Text>
                <Text style={[styles.scheduleDate, styles.pastText]}>
                  {schedule.date.toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContent: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    margin: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  imageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16,
  },
  infoSection: {
    flex: 1.5,
    justifyContent: 'center',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: Colors.disabled,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputDisabled: {
    backgroundColor: Colors.disabled,
    color: Colors.textSecondary,
  },
  editIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
  },
  cancelIconContainer: {
    position: 'absolute',
    top: 8,
    right: 38,
    padding: 6,
  },
  schedulesSection: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  noSchedulesText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  },
  scheduleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scheduleInfo: {
    flex: 1,
  },
  cafeName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  scheduleDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  deleteScheduleButton: {
    padding: 8,
  },
  pastScheduleCard: {
    backgroundColor: Colors.surface,
    opacity: 0.8,
  },
  pastText: {
    color: Colors.textSecondary,
  },
});

export default ProfileScreen;
