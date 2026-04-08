export const calculateMortgagePayment = ({
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

export const calculateRemainingBalance = (principal, ratePerPeriod, paymentsMade, payment) => {
  if (!principal || !payment) return principal;
  if (ratePerPeriod === 0 || ratePerPeriod === undefined) {
    return Math.max(0, principal - (payment * paymentsMade));
  }
  const result = principal * Math.pow(1 + ratePerPeriod, paymentsMade) - 
         payment * (Math.pow(1 + ratePerPeriod, paymentsMade) - 1) / ratePerPeriod;
  return Math.max(0, result);
};

export const formatCurrency = (amount) => {
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