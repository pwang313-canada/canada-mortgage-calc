import { CANADA_RULES } from '../constants';

export const validateAmortization = (years) => {
  const num = parseFloat(years);
  if (isNaN(num)) return 'Please enter a valid number';
  if (num < CANADA_RULES.MIN_AMORTIZATION) 
    return `Amortization must be at least ${CANADA_RULES.MIN_AMORTIZATION} years`;
  if (num > CANADA_RULES.MAX_AMORTIZATION) 
    return `Amortization cannot exceed ${CANADA_RULES.MAX_AMORTIZATION} years`;
  return null;
};

export const validateTerm = (years) => {
  const num = parseFloat(years);
  if (isNaN(num)) return 'Please enter a valid number';
  if (num < CANADA_RULES.MIN_TERM) 
    return `Term must be at least ${CANADA_RULES.MIN_TERM} year`;
  if (num > CANADA_RULES.MAX_TERM) 
    return `Term cannot exceed ${CANADA_RULES.MAX_TERM} years`;
  return null;
};

export const validateRate = (rate) => {
  const num = parseFloat(rate);
  if (isNaN(num)) return 'Please enter a valid number';
  if (num < CANADA_RULES.MIN_INTEREST_RATE) 
    return `Rate must be at least ${CANADA_RULES.MIN_INTEREST_RATE}%`;
  if (num > CANADA_RULES.MAX_INTEREST_RATE) 
    return `Rate cannot exceed ${CANADA_RULES.MAX_INTEREST_RATE}%`;
  return null;
};

export const calculateEffectiveRate = (nominalRate, isFixed = true, paymentFrequency) => {
  let periodsPerYear;
  switch(paymentFrequency) {
    case 'weekly': periodsPerYear = 52; break;
    case 'biweekly': periodsPerYear = 26; break;
    default: periodsPerYear = 12;
  }
  
  if (isFixed) {
    const semiAnnualRate = nominalRate / 2;
    const effectiveAnnualRate = Math.pow(1 + semiAnnualRate, 2) - 1;
    return Math.pow(1 + effectiveAnnualRate, 1 / periodsPerYear) - 1;
  } else {
    return nominalRate / periodsPerYear;
  }
};
