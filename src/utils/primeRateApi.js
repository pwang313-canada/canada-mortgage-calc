// Bank of Canada Valet API - Prime Rate Service
// Series ID: V41690973 - Chartered bank administered interest rates - prime business

const API_BASE_URL = 'https://www.bankofcanada.ca/valet';

export const fetchCurrentPrimeRate = async () => {
  try {
    console.log('Fetching prime rate from Bank of Canada API...');
    
    const response = await fetch(
      `${API_BASE_URL}/observations/V41690973/json`
    );
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response structure:', Object.keys(data));
    
    // Check if we have the expected structure
    if (!data || !data.observations) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Missing observations in API response');
    }
    
    const observations = data.observations;
    console.log(`Found ${observations.length} observations`);
    
    if (observations.length === 0) {
      throw new Error('No observations found');
    }
    
    // Get the most recent observation
    const latestObservation = observations[0];
    console.log('Latest observation keys:', Object.keys(latestObservation));
    
    // Try different possible field names for prime rate
    let primeRateValue = null;
    
    // The series ID might be V41690973 or different format
    if (latestObservation.V41690973 !== undefined && latestObservation.V41690973 !== '') {
      primeRateValue = latestObservation.V41690973;
    } else if (latestObservation.V41690973 !== undefined) {
      primeRateValue = latestObservation.V41690973;
    } else if (latestObservation.value !== undefined) {
      primeRateValue = latestObservation.value;
    } else {
      // Try to find any numeric value in the observation
      for (const key in latestObservation) {
        if (key !== 'd' && latestObservation[key] && !isNaN(parseFloat(latestObservation[key]))) {
          primeRateValue = latestObservation[key];
          console.log(`Found potential rate in field: ${key} = ${primeRateValue}`);
          break;
        }
      }
    }
    
    if (!primeRateValue) {
      console.error('Could not find prime rate in observation:', latestObservation);
      throw new Error('Prime rate value not found in API response');
    }
    
    const rate = parseFloat(primeRateValue);
    console.log(`Parsed rate: ${rate}`);
    
    if (isNaN(rate)) {
      throw new Error(`Cannot parse prime rate value: ${primeRateValue}`);
    }
    
    const observationDate = latestObservation.d;
    console.log(`Successfully fetched prime rate: ${rate}% as of ${observationDate}`);
    
    return {
      rate: rate,
      date: observationDate,
      success: true
    };
  } catch (error) {
    console.error('Error fetching prime rate:', error.message);
    return {
      rate: null,
      date: null,
      success: false,
      error: error.message
    };
  }
};

// Fallback rates in case API fails
export const getFallbackRates = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  console.log('Using fallback rates');
  return {
    RBC: 4.45,
    SCOTIABANK: 4.45,
    BMO: 4.45,
    CIBC: 4.45,
    NATIONAL_BANK: 4.45,
    TD: 4.60,
    lastUpdated: currentDate,
    isFallback: true
  };
};

// Fetch rates for all banks
export const fetchAllBankPrimeRates = async () => {
  try {
    console.log('Starting to fetch bank prime rates...');
    const primeRateData = await fetchCurrentPrimeRate();
    
    console.log('Prime rate data success:', primeRateData.success);
    
    if (!primeRateData.success || !primeRateData.rate) {
      console.log('Falling back to default rates');
      return getFallbackRates();
    }
    
    const primeRate = primeRateData.rate;
    const lastUpdated = primeRateData.date;
    
    console.log(`Using live prime rate: ${primeRate}% as of ${lastUpdated}`);
    
    return {
      RBC: primeRate,
      SCOTIABANK: primeRate,
      BMO: primeRate,
      CIBC: primeRate,
      NATIONAL_BANK: primeRate,
      TD: 4.60, // TD has its own prime rate
      lastUpdated: lastUpdated,
      isFallback: false
    };
  } catch (error) {
    console.error('Error in fetchAllBankPrimeRates:', error);
    return getFallbackRates();
  }
};