import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

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

  const addSchedule = async (cafeId, cafeName, date) => {
    // Schedule notification
    const trigger = new Date(date);
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Café Visit Reminder',
          body: `Time to visit ${cafeName}!`,
          data: { cafeId },
        },
        trigger,
      });

      // Save schedule
      setSchedules(prev => ({
        ...prev,
        [cafeId]: [
          ...(prev[cafeId] || []),
          { id: notificationId, date: date, cafeName }
        ]
      }));

      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  };

  const removeSchedule = async (cafeId, scheduleId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(scheduleId);
      
      setSchedules(prev => ({
        ...prev,
        [cafeId]: (prev[cafeId] || []).filter(
          schedule => schedule.id !== scheduleId
        )
      }));

      return true;
    } catch (error) {
      console.error('Error removing schedule:', error);
      return false;
    }
  };

  const getSchedulesForCafe = (cafeId) => {
    return schedules[cafeId] || [];
  };

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