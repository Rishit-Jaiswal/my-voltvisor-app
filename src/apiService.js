const BASE_URL = 'https://energy-forecasting.onrender.com/api';

/**
 * A generic and robust function to fetch data from the API.
 * It handles GET and POST requests, JSON stringification, and error cases.
 * @param {string} endpoint - The API endpoint (e.g., '/plants').
 * @param {string} method - The HTTP method ('GET', 'POST', etc.).
 * @param {Object} [body=null] - The request body for POST/PUT requests.
 * @returns {Promise<Object>} - A promise that resolves to the JSON response.
 */
const apiRequest = async (endpoint, method, body = null) => {
  const options = {
    method,
    headers: {},
  };

  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error Response: ${errorBody}`);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
    }
    
    // Handle cases where the response might be empty
    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : {};

  } catch (error) {
    console.error(`Failed to execute API request to ${endpoint}:`, error);
    throw error;
  }
};

// --- Plant APIs ---
export const getAllPlants = () => apiRequest('/plants', 'GET');
export const getProcessesByPlantId = (plantId) => apiRequest(`/plants/${plantId}`, 'GET');
export const getPlantEnergyData = (plantId, startDate, endDate) => apiRequest('/plants', 'POST', { plantId, startDate, endDate });
export const getMonthlyEnergyByPlant = (plantId) => apiRequest(`/plants/monthly/${plantId}`, 'GET');

// --- Process APIs ---
export const getAllProcesses = () => apiRequest('/processes', 'GET');
export const getProcessEnergyAndEmissions = (processId, startDate, endDate) => apiRequest('/processes', 'POST', { processId, startDate, endDate });

// --- Equipment APIs ---
export const getEquipmentReadings = (processId, startDate, endDate) => apiRequest('/equipment-readings', 'POST', { processId, startDate, endDate });

// --- Comparison API ---
// Note: The backend doesn't seem to have a dedicated multi-plant comparison endpoint.
// We will call the single plant energy endpoint for each plant and combine the results.
export const getComparisonData = async (plantIds, startDate, endDate) => {
    const promises = plantIds.map(plantId => 
        getPlantEnergyData(plantId, startDate, endDate)
            .then(data => ({ ...data, plantId })) // Add plantId to the result for identification
    );
    return Promise.all(promises);
};