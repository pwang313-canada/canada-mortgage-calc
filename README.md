# Canada Mortgage Calculator

A React Native mobile app for calculating Canadian mortgage payments with proper semi-annual compounding rules.
## File Structure
```adlanguage
canada-mortgage-calc/
├── src/
│   ├── components/
│   │   ├── InputField.js
│   │   ├── ResultCard.js
│   │   └── PaymentToggle.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   └── ResultScreen.js
│   ├── utils/
│   │   ├── mortgageCalculations.js
│   │   ├── canadaMortgageRules.js
│   │   └── validators.js
│   ├── constants/
│   │   └── index.js
│   └── navigation/
│       └── AppNavigator.js
├── App.js
├── package.json
└── README.md
```

## Features

- Calculate mortgage payments based on Canadian rules
- Support for fixed and variable rates
- Multiple payment frequencies (monthly, bi-weekly, weekly)
- Proper semi-annual compounding for fixed rates
- Input validation following Canadian guidelines

## Installation

1. Install dependencies:
```bash
npm install

