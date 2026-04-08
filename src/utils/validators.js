export const validateMortgageInputs = (inputs) => {
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
