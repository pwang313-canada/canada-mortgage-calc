import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';

// Simple ResultCard component inline
const SimpleResultCard = ({ title, value, subtitle }) => {
  return (
    <View style={resultStyles.card}>
      <Text style={resultStyles.title}>{title}</Text>
      <Text style={resultStyles.value}>{value}</Text>
      {subtitle && <Text style={resultStyles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

// Format currency function
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Calculate mortgage payment
const calculateMortgagePayment = ({
  principal,
  amortizationYears,
  termYears,
  annualRate,
  paymentFrequency
}) => {
  const rateDecimal = annualRate / 100;
  
  // Define payment periods based on frequency
  let periodsPerYear;
  let isAccelerated = false;
  
  switch(paymentFrequency) {
    case 'monthly':
      periodsPerYear = 12;
      isAccelerated = false;
      break;
    case 'biweekly':
      periodsPerYear = 26;
      isAccelerated = false;
      break;
    case 'weekly':
      periodsPerYear = 52;
      isAccelerated = false;
      break;
    case 'accelerated_biweekly':
      periodsPerYear = 26;
      isAccelerated = true;
      break;
    case 'accelerated_weekly':
      periodsPerYear = 52;
      isAccelerated = true;
      break;
    default:
      periodsPerYear = 12;
      isAccelerated = false;
  }
  
  let payment;
  let totalPayments;
  let periodicRate;
  
  if (isAccelerated) {
    // Calculate monthly payment first
    const monthlyRate = rateDecimal / 12;
    const monthlyPayments = amortizationYears * 12;
    
    let monthlyPayment;
    if (monthlyRate === 0) {
      monthlyPayment = principal / monthlyPayments;
    } else {
      const monthlyFactor = Math.pow(1 + monthlyRate, monthlyPayments);
      monthlyPayment = principal * (monthlyRate * monthlyFactor) / (monthlyFactor - 1);
    }
    
    if (paymentFrequency === 'accelerated_biweekly') {
      payment = monthlyPayment / 2;
      totalPayments = amortizationYears * 26;
      periodicRate = rateDecimal / 26;
    } else {
      payment = monthlyPayment / 4;
      totalPayments = amortizationYears * 52;
      periodicRate = rateDecimal / 52;
    }
  } else {
    periodicRate = rateDecimal / periodsPerYear;
    totalPayments = amortizationYears * periodsPerYear;
    
    if (periodicRate === 0) {
      payment = principal / totalPayments;
    } else {
      const factor = Math.pow(1 + periodicRate, totalPayments);
      payment = principal * (periodicRate * factor) / (factor - 1);
    }
  }
  
  // Calculate term payments
  const termPeriods = termYears * periodsPerYear;
  const termPrincipal = calculateRemainingBalance(
    principal, 
    periodicRate, 
    termPeriods, 
    payment
  );
  
  return {
    periodicPayment: payment || 0,
    annualPayment: (payment || 0) * periodsPerYear,
    totalPayments: totalPayments || 0,
    totalInterest: ((payment || 0) * (totalPayments || 0)) - principal,
    termRemainingBalance: termPrincipal || principal,
    effectiveAnnualRate: (Math.pow(1 + (periodicRate || 0), periodsPerYear) - 1) * 100
  };
};

const calculateRemainingBalance = (principal, ratePerPeriod, paymentsMade, payment) => {
  if (!principal || !payment) return principal;
  if (ratePerPeriod === 0 || ratePerPeriod === undefined) {
    return Math.max(0, principal - (payment * paymentsMade));
  }
  const result = principal * Math.pow(1 + ratePerPeriod, paymentsMade) - 
         payment * (Math.pow(1 + ratePerPeriod, paymentsMade) - 1) / ratePerPeriod;
  return Math.max(0, result);
};

const ResultScreen = ({ route, navigation }) => {
  // Safely get params with default values
  const params = route.params || {};
  
  const principal = params.principal || 0;
  const amortizationYears = params.amortizationYears || 25;
  const termYears = params.termYears || 5;
  const annualRate = params.annualRate || 0;
  const paymentFrequency = params.paymentFrequency || 'monthly';
  const mortgageType = params.mortgageType || 'variable';
  const selectedBank = params.selectedBank || 'Unknown';
  const spread = params.spread || '0';
  const primeRateUsed = params.primeRateUsed || 0;
  
  const results = calculateMortgagePayment({
    principal: principal,
    amortizationYears: amortizationYears,
    termYears: termYears,
    annualRate: annualRate,
    paymentFrequency: paymentFrequency
  });
  
  // Get frequency label based on value
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
  
  const frequencyLabel = getFrequencyLabel(paymentFrequency);
  const periodsPerYear = getPeriodsPerYear(paymentFrequency);
  
  // Calculate per year breakdown for the term
  const calculateYearlyBreakdown = () => {
    const annualRateDecimal = annualRate / 100;
    const paymentPerPeriod = results.periodicPayment;
    const paymentsPerYear = periodsPerYear;
    
    let yearlyInterest = 0;
    let yearlyPrincipal = 0;
    let currentPrincipal = principal;
    
    for (let i = 0; i < paymentsPerYear; i++) {
      let periodRate;
      
      if (paymentsPerYear === 12) {
        periodRate = annualRateDecimal / 12;
      } else if (paymentsPerYear === 26) {
        periodRate = annualRateDecimal / 26;
      } else {
        periodRate = annualRateDecimal / 52;
      }
      
      const periodInterest = currentPrincipal * periodRate;
      const periodPrincipal = paymentPerPeriod - periodInterest;
      
      if (periodPrincipal > 0) {
        yearlyInterest += periodInterest;
        yearlyPrincipal += periodPrincipal;
        currentPrincipal -= periodPrincipal;
      }
    }
    
    return {
      yearlyInterest: yearlyInterest > 0 ? yearlyInterest : 0,
      yearlyPrincipal: yearlyPrincipal > 0 ? yearlyPrincipal : 0,
      totalPayment: (yearlyInterest + yearlyPrincipal) > 0 ? (yearlyInterest + yearlyPrincipal) : 0
    };
  };
  
  const yearlyBreakdown = calculateYearlyBreakdown();
  
  return (
    <ScrollView style={resultStyles.container}>
      <View style={resultStyles.header}>
        <Text style={resultStyles.subtitle}>
          Based on {formatCurrency(principal)} at {annualRate}%
        </Text>
      </View>
      
      {/* Rate Details Card */}
      <View style={resultStyles.rateDetailsCard}>
        <Text style={resultStyles.rateDetailsTitle}>Rate Details</Text>
        <View style={resultStyles.rateDetailsRow}>
          <Text style={resultStyles.rateDetailsLabel}>Bank:</Text>
          <Text style={resultStyles.rateDetailsValue}>{selectedBank}</Text>
        </View>
        <View style={resultStyles.rateDetailsRow}>
          <Text style={resultStyles.rateDetailsLabel}>Mortgage Type:</Text>
          <Text style={resultStyles.rateDetailsValue}>
            {mortgageType === 'fixed' ? 'Fixed Rate' : 'Variable Rate'}
          </Text>
        </View>
        {mortgageType === 'variable' && spread && spread !== '0' && (
          <View style={resultStyles.rateDetailsRow}>
            <Text style={resultStyles.rateDetailsLabel}>Spread/Discount:</Text>
            <Text style={resultStyles.rateDetailsValue}>{spread}%</Text>
          </View>
        )}
        {mortgageType === 'variable' && primeRateUsed > 0 && (
          <View style={resultStyles.rateDetailsRow}>
            <Text style={resultStyles.rateDetailsLabel}>Prime Rate Used:</Text>
            <Text style={resultStyles.rateDetailsValue}>{primeRateUsed}%</Text>
          </View>
        )}
        <View style={resultStyles.rateDetailsDivider} />
        <View style={resultStyles.rateDetailsRow}>
          <Text style={resultStyles.rateDetailsLabel}>Final Rate Used:</Text>
          <Text style={resultStyles.finalRateValue}>{annualRate}%</Text>
        </View>
      </View>
      
      <SimpleResultCard
        title={`${frequencyLabel} Payment`}
        value={formatCurrency(results.periodicPayment)}
        subtitle={`${frequencyLabel.toLowerCase()} payment for principal & interest`}
      />
      
      <SimpleResultCard
        title="Annual Payment"
        value={formatCurrency(results.annualPayment)}
        subtitle="Total payments per year"
      />
      
      <SimpleResultCard
        title="Total Interest Over Amortization"
        value={formatCurrency(results.totalInterest)}
        subtitle={`Over ${amortizationYears} years`}
      />
      
      <SimpleResultCard
        title="Balance at End of Term"
        value={formatCurrency(results.termRemainingBalance)}
        subtitle={`After ${termYears} year term`}
      />
      
      {/* Yearly Breakdown Section */}
      {yearlyBreakdown.totalPayment > 0 && (
        <View style={resultStyles.breakdownSection}>
          <Text style={resultStyles.breakdownTitle}>First Year Breakdown (Term)</Text>
          <View style={resultStyles.breakdownCard}>
            <View style={resultStyles.breakdownRow}>
              <Text style={resultStyles.breakdownLabel}>Total Annual Payment:</Text>
              <Text style={resultStyles.breakdownValue}>{formatCurrency(yearlyBreakdown.totalPayment)}</Text>
            </View>
            <View style={resultStyles.breakdownDivider} />
            <View style={resultStyles.breakdownRow}>
              <Text style={resultStyles.breakdownLabel}>Interest Portion:</Text>
              <Text style={[resultStyles.breakdownValue, resultStyles.interestColor]}>
                {formatCurrency(yearlyBreakdown.yearlyInterest)}
              </Text>
            </View>
            <View style={resultStyles.breakdownRow}>
              <Text style={resultStyles.breakdownLabel}>Principal Portion:</Text>
              <Text style={[resultStyles.breakdownValue, resultStyles.principalColor]}>
                {formatCurrency(yearlyBreakdown.yearlyPrincipal)}
              </Text>
            </View>
            <View style={resultStyles.breakdownDivider} />
            <View style={resultStyles.breakdownRow}>
              <Text style={resultStyles.breakdownLabel}>Interest % of Payment:</Text>
              <Text style={resultStyles.breakdownValue}>
                {yearlyBreakdown.totalPayment > 0 
                  ? ((yearlyBreakdown.yearlyInterest / yearlyBreakdown.totalPayment) * 100).toFixed(1)
                  : 0}%
              </Text>
            </View>
            <View style={resultStyles.breakdownRow}>
              <Text style={resultStyles.breakdownLabel}>Principal % of Payment:</Text>
              <Text style={resultStyles.breakdownValue}>
                {yearlyBreakdown.totalPayment > 0 
                  ? ((yearlyBreakdown.yearlyPrincipal / yearlyBreakdown.totalPayment) * 100).toFixed(1)
                  : 0}%
              </Text>
            </View>
          </View>
          <Text style={resultStyles.breakdownNote}>
            * Based on first year of your {termYears}-year term
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={resultStyles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={resultStyles.backButtonText}>Back to Calculator</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const resultStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  subtitle: {
    fontSize: 18,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
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