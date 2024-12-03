import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useSchedules } from '../context/ScheduleContext';

const ScheduleModal = ({ visible, onClose, cafe }) => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const { addSchedule } = useSchedules();
  
  const handleConfirm = async (selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSchedule = async () => {
    if (date <= new Date()) {
      Alert.alert('Invalid Date', 'Please select a future date and time.');
      return;
    }

    const success = await addSchedule(cafe.id, cafe.name, date);
    if (success) {
      Alert.alert('Success', 'Visit scheduled! You will receive a reminder notification.');
      onClose();
    } else {
      // The error message will be shown by the permission request if needed
      // No need for additional alert here
    }
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <DateTimePickerModal
          isVisible={showPicker}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={() => setShowPicker(false)}
          minimumDate={new Date()}
          date={date}
          display="spinner"
          themeVariant="light"
          modalStyleIOS={{
            margin: 0,
            backgroundColor: 'white',
          }}
          pickerContainerStyleIOS={{
            paddingTop: 20,
          }}
        />
      );
    } else {
      return (
        <DateTimePickerModal
          isVisible={showPicker}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={() => setShowPicker(false)}
          minimumDate={new Date()}
          date={date}
          display="default"
        />
      );
    }
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
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowPicker(true)}
            >
              <Ionicons name="calendar" size={24} color={Colors.primary} />
              <Text style={styles.dateButtonText}>
                {date.toLocaleString()}
              </Text>
            </TouchableOpacity>

            {renderDatePicker()}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSchedule}
          >
            <Text style={styles.addButtonText}>Schedule Visit</Text>
          </TouchableOpacity>
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
    width: '100%',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    width: '100%',
    backgroundColor: Colors.background,
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
});

export default ScheduleModal;