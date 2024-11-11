import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { collection, addDoc, getDocs, deleteDoc, doc, where, query } from 'firebase/firestore';
import { auth, database } from '../Firebase/firebaseSetup';
import {  Alert } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [schedules, setSchedules] = useState({});

  // Request notification permissions
  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Please enable notifications to receive visit reminders!');
      }
    }
    requestPermissions();
  }, []);

  const fetchSchedules = async (userId) => {
    try {
      const q = query(collection(database, 'schedules'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const fetchedSchedules = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const cafeId = data.cafeId;
        if (!fetchedSchedules[cafeId]) fetchedSchedules[cafeId] = [];
        fetchedSchedules[cafeId].push({ id: doc.id, ...data });
      });
      setSchedules(fetchedSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const addSchedule = async (cafeId, cafeName, date) => {
    const userId = auth.currentUser.uid;
    const trigger = new Date(date);
  
    // Check if the selected date is in the future
    if (trigger <= new Date()) {
      Alert.alert('Invalid Date', 'Please select a future date and time for the visit.');
      return false;
    }
  
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Café Visit Reminder',
          body: `Time to visit ${cafeName}!`,
          data: { cafeId },
        },
        trigger,
      });
  
      const newSchedule = {
        userId,
        cafeId,
        cafeName,
        date: date.toISOString(),
        notificationId,
      };
  
      const docRef = await addDoc(collection(database, 'schedules'), newSchedule);
  
      setSchedules(prev => ({
        ...prev,
        [cafeId]: [...(prev[cafeId] || []), { id: docRef.id, ...newSchedule }]
      }));
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  };

  const removeSchedule = async (scheduleId) => {
    try {
      const schedulesRef = collection(database, 'schedules');
      const q = query(schedulesRef, where('__name__', '==', scheduleId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const scheduleDoc = querySnapshot.docs[0];
        const schedule = scheduleDoc.data();

        if (schedule.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(schedule.notificationId);
        }

        await deleteDoc(doc(database, 'schedules', scheduleId));

        // Update local state
        setSchedules(prev => {
          const newSchedules = { ...prev };
          Object.keys(newSchedules).forEach(cafeId => {
            newSchedules[cafeId] = newSchedules[cafeId].filter(s => s.id !== scheduleId);
          });
          return newSchedules;
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing schedule:', error);
      return false;
    }
  };

  const getSchedulesForCafe = (cafeId) => {
    return schedules[cafeId] || [];
  };

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) fetchSchedules(userId);
  }, [auth.currentUser]);

  return (
    <ScheduleContext.Provider value={{
      addSchedule,
      removeSchedule,
      getSchedulesForCafe,
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedules = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedules must be used within a ScheduleProvider');
  }
  return context;
};