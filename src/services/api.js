import * as apiService from '../apiService';
// src/services/apiService.js
import apiEndpoints from '../apis.json';

const BASE_URL = 'https://energy-forecasting.onrender.com/api'; // Replace with your actual API server URL

/**
 * A generic function to fetch data from the API.
 * @param {string} endpoint - The API endpoint to call.
 * @returns {Promise<Object>} - A promise that resolves to the JSON response.
 */
const fetchData = async (endpoint) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);

    if (!response.ok) {
      // Throws an error if the HTTP response is not successful (e.g., 404, 500)
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    // Re-throw the error to be caught by the component
    throw error;
  }
};

// Export specific functions for your monitoring tab
export const getSystemStatus = () => {
  return fetchData(apiEndpoints.monitoring.getSystemStatus);
};

export const getMetrics = () => {
  return fetchData(apiEndpoints.monitoring.getMetrics);
};

export const getLogs = () => {
  return fetchData(apiEndpoints.monitoring.getLogs);
};


export const fetchAllPlants = apiService.getAllPlants;
export const fetchAllProcesses = apiService.getAllProcesses;
export const fetchProcessesByPlantId = apiService.getProcessesByPlantId;
export const fetchPlantEnergy = apiService.getPlantEnergyData;
export const fetchMonthlyEnergyByPlant = apiService.getMonthlyEnergyByPlant;
export const fetchProcessEnergy = apiService.getProcessEnergyAndEmissions;
export const fetchEquipmentByProcess = apiService.getEquipmentReadings;