import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useSchedules } from '../context/ScheduleContext';

const ScheduleModal = ({ visible, onClose, cafe }) => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const { addSchedule, removeSchedule, getSchedulesForCafe } = useSchedules();
  
  const schedules = getSchedulesForCafe(cafe?.id);

  const handleConfirm = async () => {
    if (await addSchedule(cafe.id, cafe.name, date)) {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }
      alert('Visit scheduled! You will receive a reminder notification.');
    } else {
      alert('Failed to schedule visit. Please try again.');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (await removeSchedule(cafe.id, scheduleId)) {
      alert('Schedule removed successfully.');
    } else {
      alert('Failed to remove schedule. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Schedule Visit</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.datePickerContainer}>
            {(showPicker || Platform.OS === 'ios') && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                    if (Platform.OS === 'android') {
                      setShowPicker(false);
                    }
                  }
                }}
              />
            )}
            
            {Platform.OS === 'android' && !showPicker && (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPicker(true)}
              >
                <Ionicons name="calendar" size={24} color={Colors.primary} />
                <Text style={styles.dateButtonText}>
                  Select Date and Time
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleConfirm}
          >
            <Text style={styles.addButtonText}>Schedule Visit</Text>
          </TouchableOpacity>

          {schedules.length > 0 && (
            <>
              <Text style={styles.schedulesTitle}>Scheduled Visits</Text>
              <ScrollView style={styles.schedulesList}>
                {schedules.map((schedule) => (
                  <View key={schedule.id} style={styles.scheduleItem}>
                    <Text style={styles.scheduleDate}>
                      {formatDate(schedule.date)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDelete(schedule.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
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
  closeButton: {
    padding: 4,
  },
  datePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dateButtonText: {
    marginLeft: 8,
    color: Colors.primary,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  schedulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  schedulesList: {
    maxHeight: 200,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginVertical: 4,
  },
  scheduleDate: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  deleteButton: {
    padding: 4,
  },
});

export default ScheduleModal;