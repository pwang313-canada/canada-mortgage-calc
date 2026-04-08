import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import ResultCard from '../components/ResultCard';
import { calculateMortgagePayment, formatCurrency } from '../utils/mortgageCalculations';

const ResultScreen = ({ route, navigation }) => {
  const { calculationParams } = route.params;
  
  const results = calculateMortgagePayment({
    principal: calculationParams.principal,
    amortizationYears: calculationParams.amortizationYears,
    termYears: calculationParams.termYears,
    annualRate: calculationParams.annualRate,
    paymentFrequency: calculationParams.paymentFrequency
  });
  
  // Get frequency label based on value (hardcoded to avoid imports)
  const getFrequencyLabel = (frequency) => {
    switch(frequency) {
      case 'monthly':
        return 'Monthly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'weekly':
        return 'Weekly';
      case 'accelerated_biweekly':
        return 'Accelerated Bi-weekly';
      case 'accelerated_weekly':
        return 'Accelerated Weekly';
      default:
        return 'Monthly';
    }
  };
  
  // Get periods per year based on frequency
  const getPeriodsPerYear = (frequency) => {
    switch(frequency) {
      case 'monthly':
        return 12;
      case 'biweekly':
        return 26;
      case 'weekly':
        return 52;
      case 'accelerated_biweekly':
        return 26;
      case 'accelerated_weekly':
        return 52;
      default:
        return 12;
    }
  };
  
  const frequencyLabel = getFrequencyLabel(calculationParams.paymentFrequency);
  const periodsPerYear = getPeriodsPerYear(calculationParams.paymentFrequency);
  
  // Calculate per year breakdown for the term
  const calculateYearlyBreakdown = () => {
    const annualRate = calculationParams.annualRate / 100;
    const paymentPerPeriod = results.periodicPayment;
    const paymentsPerYear = periodsPerYear;
    
    let yearlyInterest = 0;
    let yearlyPrincipal = 0;
    let currentPrincipal = calculationParams.principal;
    
    for (let i = 0; i < paymentsPerYear; i++) {
      let periodRate;
      
      if (paymentsPerYear === 12) {
        periodRate = annualRate / 12;
      } else if (paymentsPerYear === 26) {
        periodRate = annualRate / 26;
      } else {
        periodRate = annualRate / 52;
      }
      
      const periodInterest = currentPrincipal * periodRate;
      const periodPrincipal = paymentPerPeriod - periodInterest;
      
      yearlyInterest += periodInterest;
      yearlyPrincipal += periodPrincipal;
      currentPrincipal -= periodPrincipal;
    }
    
    return {
      yearlyInterest: yearlyInterest > 0 ? yearlyInterest : 0,
      yearlyPrincipal: yearlyPrincipal > 0 ? yearlyPrincipal : 0,
      totalPayment: (yearlyInterest + yearlyPrincipal) > 0 ? (yearlyInterest + yearlyPrincipal) : 0
    };
  };
  
  const yearlyBreakdown = calculateYearlyBreakdown();
  
  // Get bank name safely
  const getBankName = () => {
    if (!calculationParams.selectedBank) return 'Not specified';
    if (calculationParams.selectedBank === 'OTHER') return 'Other Bank';
    
    const bankNames = {
      RBC: 'RBC Royal Bank',
      SCOTIABANK: 'Scotiabank',
      BMO: 'BMO',
      CIBC: 'CIBC',
      NATIONAL_BANK: 'National Bank',
      TD: 'TD Canada Trust'
    };
    
    return bankNames[calculationParams.selectedBank] || calculationParams.selectedBank;
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Based on {formatCurrency(calculationParams.principal)} at {calculationParams.annualRate}%
        </Text>
      </View>
      
      {/* Rate Details Card */}
      <View style={styles.rateDetailsCard}>
        <Text style={styles.rateDetailsTitle}>Rate Details</Text>
        <View style={styles.rateDetailsRow}>
          <Text style={styles.rateDetailsLabel}>Bank:</Text>
          <Text style={styles.rateDetailsValue}>{getBankName()}</Text>
        </View>
        <View style={styles.rateDetailsRow}>
          <Text style={styles.rateDetailsLabel}>Mortgage Type:</Text>
          <Text style={styles.rateDetailsValue}>
            {calculationParams.mortgageType === 'fixed' ? 'Fixed Rate' : 'Variable Rate'}
          </Text>
        </View>
        {calculationParams.mortgageType === 'variable' && calculationParams.spread && calculationParams.spread !== '0' && (
          <View style={styles.rateDetailsRow}>
            <Text style={styles.rateDetailsLabel}>Spread/Discount:</Text>
            <Text style={styles.rateDetailsValue}>{calculationParams.spread}%</Text>
          </View>
        )}
        <View style={styles.rateDetailsDivider} />
        <View style={styles.rateDetailsRow}>
          <Text style={styles.rateDetailsLabel}>Final Rate Used:</Text>
          <Text style={styles.finalRateValue}>{calculationParams.annualRate}%</Text>
        </View>
      </View>
      
      <ResultCard
        title={`${frequencyLabel} Payment`}
        value={formatCurrency(results.periodicPayment)}
        subtitle={`${frequencyLabel.toLowerCase()} payment for principal & interest`}
      />
      
      <ResultCard
        title="Annual Payment"
        value={formatCurrency(results.annualPayment)}
        subtitle="Total payments per year"
      />
      
      <ResultCard
        title="Total Interest Over Amortization"
        value={formatCurrency(results.totalInterest)}
        subtitle={`Over ${calculationParams.amortizationYears} years`}
      />
      
      <ResultCard
        title="Balance at End of Term"
        value={formatCurrency(results.termRemainingBalance)}
        subtitle={`After ${calculationParams.termYears} year term`}
      />
      
      {/* Yearly Breakdown Section */}
      {yearlyBreakdown.totalPayment > 0 && (
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>First Year Breakdown (Term)</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Total Annual Payment:</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(yearlyBreakdown.totalPayment)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Interest Portion:</Text>
              <Text style={[styles.breakdownValue, styles.interestColor]}>
                {formatCurrency(yearlyBreakdown.yearlyInterest)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Principal Portion:</Text>
              <Text style={[styles.breakdownValue, styles.principalColor]}>
                {formatCurrency(yearlyBreakdown.yearlyPrincipal)}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Interest % of Payment:</Text>
              <Text style={styles.breakdownValue}>
                {((yearlyBreakdown.yearlyInterest / yearlyBreakdown.totalPayment) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Principal % of Payment:</Text>
              <Text style={styles.breakdownValue}>
                {((yearlyBreakdown.yearlyPrincipal / yearlyBreakdown.totalPayment) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
          <Text style={styles.breakdownNote}>
            * Based on first year of your {calculationParams.termYears}-year term
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Calculator</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    textAlign: 'center',
  },
  rateDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rateDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  rateDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rateDetailsLabel: {
    fontSize: 14,
    color: '#666',
  },
  rateDetailsValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  finalRateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  rateDetailsDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  breakdownSection: {
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  interestColor: {
    color: '#dc3545',
  },
  principalColor: {
    color: '#28a745',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  breakdownNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6c757d',
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResultScreen;