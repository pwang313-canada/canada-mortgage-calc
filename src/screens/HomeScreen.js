import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput
} from 'react-native';

// Simple InputField component inline to avoid imports
const SimpleInputField = ({ label, value, onChangeText, placeholder, rightLabel, error }) => (
  <View style={localStyles.inputContainer}>
    <Text style={localStyles.inputLabel}>{label}</Text>
    <View style={[localStyles.inputWrapper, error && localStyles.inputError]}>
      <TextInput
        style={localStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />
      {rightLabel && <Text style={localStyles.inputRightLabel}>{rightLabel}</Text>}
    </View>
    {error && <Text style={localStyles.inputErrorText}>{error}</Text>}
  </View>
);

// Simple PaymentToggle component inline
const SimplePaymentToggle = ({ selected, onSelect }) => {
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
    <View style={localStyles.toggleSection}>
      <Text style={localStyles.toggleLabel}>Payment Frequency</Text>
      <View style={localStyles.toggleRow}>
        {regularOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              localStyles.toggleButton,
              selected === option.value && localStyles.toggleButtonActive
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              localStyles.toggleText,
              selected === option.value && localStyles.toggleTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={localStyles.acceleratedContainer}>
        <Text style={localStyles.acceleratedLabel}>Accelerated</Text>
        <View style={localStyles.toggleRow}>
          {acceleratedOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                localStyles.toggleButton,
                selected === option.value && localStyles.toggleButtonActive
              ]}
              onPress={() => onSelect(option.value)}
            >
              <Text style={[
                localStyles.toggleText,
                selected === option.value && localStyles.toggleTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

// Validation function
const validateInputs = (inputs) => {
  const errors = {};
  if (!inputs.principal || inputs.principal <= 0) {
    errors.principal = 'Please enter a valid mortgage amount';
  }
  if (!inputs.amortization || inputs.amortization < 5 || inputs.amortization > 30) {
    errors.amortization = 'Amortization must be between 5 and 30 years';
  }
  if (!inputs.term || inputs.term < 0.5 || inputs.term > 10) {
    errors.term = 'Term must be between 0.5 and 10 years';
  }
  if (!inputs.rate || inputs.rate < 0.1 || inputs.rate > 20) {
    errors.rate = 'Interest rate must be between 0.1% and 20%';
  }
  return errors;
};

const HomeScreen = ({ navigation }) => {
  const [principal, setPrincipal] = useState('');
  const [amortization, setAmortization] = useState('25');
  const [term, setTerm] = useState('5');
  const [mortgageType, setMortgageType] = useState('variable');
  const [spread, setSpread] = useState('');
  const [customRate, setCustomRate] = useState('');
  const [finalRate, setFinalRate] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [errors, setErrors] = useState({});
  const [loadingRates, setLoadingRates] = useState(false);

  // Bank rates with different prime rates
  const bankRates = {
    RBC: { name: 'RBC', primeRate: 4.45, displayRate: '4.45%' },
    SCOTIABANK: { name: 'Scotiabank', primeRate: 4.45, displayRate: '4.45%' },
    BMO: { name: 'BMO', primeRate: 4.45, displayRate: '4.45%' },
    CIBC: { name: 'CIBC', primeRate: 4.45, displayRate: '4.45%' },
    NATIONAL_BANK: { name: 'National Bank', primeRate: 4.45, displayRate: '4.45%' },
    TD: { name: 'TD', primeRate: 4.60, displayRate: '4.60%' }
  };
  
  const [selectedBank, setSelectedBank] = useState('RBC');

  // Calculate final rate
  useEffect(() => {
    let rate = null;
    
    if (mortgageType === 'variable') {
      const primeRate = bankRates[selectedBank].primeRate;
      const spreadValue = spread ? parseFloat(spread) : 0;
      rate = primeRate + spreadValue;
    } else {
      rate = customRate ? parseFloat(customRate) : null;
    }
    
    if (rate && !isNaN(rate) && isFinite(rate)) {
      setFinalRate(rate.toFixed(2));
    } else {
      setFinalRate('');
    }
  }, [selectedBank, mortgageType, spread, customRate]);

  const handleCalculate = () => {
    const inputs = {
      principal: parseFloat(principal),
      amortization: parseFloat(amortization),
      term: parseFloat(term),
      rate: parseFloat(finalRate)
    };
    
    const validationErrors = validateInputs(inputs);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert('Validation Error', Object.values(validationErrors)[0]);
      return;
    }
    
    if (!finalRate) {
      Alert.alert('Error', 'Please calculate a valid interest rate first');
      return;
    }
    
    setErrors({});
    
    navigation.navigate('Result', {
      principal: inputs.principal,
      amortizationYears: inputs.amortization,
      termYears: inputs.term,
      annualRate: inputs.rate,
      paymentFrequency,
      mortgageType,
      selectedBank: bankRates[selectedBank].name,
      spread: spread || '0',
      primeRateUsed: bankRates[selectedBank].primeRate
    });
  };

  if (loadingRates) {
    return (
      <View style={localStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={localStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={localStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={localStyles.scrollContainer}>
        <View style={localStyles.row}>
          <View style={localStyles.halfWidth}>
            <SimpleInputField
              label="Mortgage Amount"
              value={principal}
              onChangeText={setPrincipal}
              placeholder="Enter amount"
              rightLabel="CAD"
              error={errors.principal}
            />
          </View>
          <View style={localStyles.halfWidth}>
            <SimpleInputField
              label="Amortization"
              value={amortization}
              onChangeText={setAmortization}
              placeholder="25"
              rightLabel="years"
              error={errors.amortization}
            />
          </View>
        </View>
        
        <View style={localStyles.row}>
          <View style={localStyles.halfWidth}>
            <SimpleInputField
              label="Term"
              value={term}
              onChangeText={setTerm}
              placeholder="5"
              rightLabel="years"
              error={errors.term}
            />
          </View>
        </View>
        
        {/* Mortgage Type */}
        <View style={localStyles.typeContainer}>
          <Text style={localStyles.label}>Mortgage Type</Text>
          <View style={localStyles.typeRow}>
            <TouchableOpacity
              style={[localStyles.typeButton, mortgageType === 'variable' && localStyles.typeButtonActive]}
              onPress={() => setMortgageType('variable')}
            >
              <Text style={[localStyles.typeText, mortgageType === 'variable' && localStyles.typeTextActive]}>
                Variable Rate
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[localStyles.typeButton, mortgageType === 'fixed' && localStyles.typeButtonActive]}
              onPress={() => setMortgageType('fixed')}
            >
              <Text style={[localStyles.typeText, mortgageType === 'fixed' && localStyles.typeTextActive]}>
                Fixed Rate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bank Selection with Prime Rate Display */}
        <View style={localStyles.bankContainer}>
          <Text style={localStyles.label}>Select Bank</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={localStyles.bankRow}>
              {Object.entries(bankRates).map(([key, bank]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    localStyles.bankButton,
                    selectedBank === key && localStyles.bankButtonActive
                  ]}
                  onPress={() => setSelectedBank(key)}
                >
                  <Text style={[
                    localStyles.bankName,
                    selectedBank === key && localStyles.bankTextActive
                  ]}>
                    {bank.name}
                  </Text>
                  {/* Show prime rate under bank name when selected */}
                  {selectedBank === key && (
                    <Text style={localStyles.bankPrimeRate}>
                      Prime: {bank.displayRate}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        
        {/* Spread for Variable Rate */}
        {mortgageType === 'variable' && (
          <SimpleInputField
            label="Spread/Discount (e.g., -0.95, -1.05)"
            value={spread}
            onChangeText={setSpread}
            placeholder="-0.95"
            rightLabel="%"
          />
        )}
        
        {(mortgageType === 'fixed') && (
          <SimpleInputField
            label={mortgageType === 'fixed' ? "Fixed Rate (%)" : "Custom Interest Rate (%)"}
            value={customRate}
            onChangeText={setCustomRate}
            placeholder="Enter rate"
            rightLabel="%"
          />
        )}
        
        {/* Rate Preview */}
        {finalRate && (
          <View style={localStyles.ratePreview}>
            <Text style={localStyles.ratePreviewLabel}>Final Rate:</Text>
            {mortgageType === 'variable' && finalRate && (
              <View style={localStyles.formulaBox}>
                <Text style={localStyles.ratePreviewLabel}>
                  {bankRates[selectedBank].primeRate}% + ({parseFloat(spread) > 0 ? '+' : ''}{spread || 0}%) = {finalRate}%
                </Text>
              </View>
            )}
        
        {/* Fixed Rate Display - Just show the rate */}
        {mortgageType === 'fixed' && finalRate && (
          <View style={localStyles.formulaBox}>
            <Text style={localStyles.formulaText}>
              Fixed Rate: {finalRate}%
            </Text>
          </View>
        )}
          </View>
        )}
        
        <SimplePaymentToggle
          selected={paymentFrequency}
          onSelect={setPaymentFrequency}
        />
        
        <TouchableOpacity style={localStyles.calculateButton} onPress={handleCalculate}>
          <Text style={localStyles.calculateButtonText}>Calculate Payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  typeContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeButtonActive: {
    backgroundColor: '#007bff',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  bankContainer: {
    marginBottom: 20,
  },
  bankRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bankButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  bankButtonActive: {
    backgroundColor: '#28a745',
  },
  bankName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bankTextActive: {
    color: '#fff',
  },
  bankPrimeRate: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  ratePreview: {
    backgroundColor: '#e8f4fd',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratePreviewLabel: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  ratePreviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  formulaBox: {
    backgroundColor: '#e8f4fd',
    borderRadius: 4,
    padding: 4,
    marginBottom: 2,
    alignItems: 'center',
  },
  formulaText: {
    fontSize: 16,
    color: '#007bff',
  },
  calculateButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputRightLabel: {
    paddingRight: 12,
    fontSize: 16,
    color: '#666',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  inputErrorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  toggleSection: {
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  toggleRow: {
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

export default HomeScreen;