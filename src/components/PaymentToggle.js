import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

const PaymentToggle = ({ selected, onSelect }) => {
  // Hardcoded payment options to avoid any import issues
  const regularOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Bi-weekly', value: 'biweekly' },
    { label: 'Weekly', value: 'weekly' }
  ];
  
  const acceleratedOptions = [
    { label: 'Accelerated Bi-weekly', value: 'accelerated_biweekly' },
    { label: 'Accelerated Weekly', value: 'accelerated_weekly' }
  ];
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Payment Frequency</Text>
      
      {/* Regular Payment Options */}
      <View style={styles.toggleContainer}>
        {regularOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.toggleButton,
              selected === option.value && styles.toggleButtonActive
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text
              style={[
                styles.toggleText,
                selected === option.value && styles.toggleTextActive
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Accelerated Payment Options */}
      <View style={styles.acceleratedContainer}>
        <Text style={styles.acceleratedLabel}>Accelerated</Text>
        <View style={styles.toggleContainer}>
          {acceleratedOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.toggleButton,
                selected === option.value && styles.toggleButtonActive
              ]}
              onPress={() => onSelect(option.value)}
            >
              <Text
                style={[
                  styles.toggleText,
                  selected === option.value && styles.toggleTextActive
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#007bff',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  acceleratedContainer: {
    marginTop: 12,
  },
  acceleratedLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    marginLeft: 4,
  },
});

export default PaymentToggle;