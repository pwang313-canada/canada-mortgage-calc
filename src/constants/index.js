export const PAYMENT_FREQUENCIES = {
  MONTHLY: { label: 'Monthly', value: 'monthly', periodsPerYear: 12, accelerated: false },
  BIWEEKLY: { label: 'Bi-weekly', value: 'biweekly', periodsPerYear: 26, accelerated: false },
  WEEKLY: { label: 'Weekly', value: 'weekly', periodsPerYear: 52, accelerated: false },
  ACCELERATED_BIWEEKLY: { label: 'Bi-weekly', value: 'accelerated_biweekly', periodsPerYear: 26, accelerated: true },
  ACCELERATED_WEEKLY: { label: 'Weekly', value: 'accelerated_weekly', periodsPerYear: 52, accelerated: true }
};

export const CANADA_RULES = {
  MAX_AMORTIZATION: 30,
  MIN_AMORTIZATION: 5,
  MAX_TERM: 10,
  MIN_TERM: 0.5,
  MAX_INTEREST_RATE: 20,
  MIN_INTEREST_RATE: 0.1
};