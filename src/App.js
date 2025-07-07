import React, { useState, useEffect, useRef, useCallback } from 'react';
// ... other imports
// Add this with your other imports at the top of App.js
import { COST_DATA } from './COST_DATA';import { Money } from 'lucide-react'; // Add Money or another icon for the new tab
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Label, ReferenceDot } from 'recharts';
import { ChevronDown, Droplets ,Factory, TrendingUp, Cpu, Lightbulb, Zap, Clock, Thermometer, Droplet, Calendar, Gauge, AlertTriangle, MessageSquare, HelpCircle, Eye, Cloud, Download, CloudRain, Wind, Info, BellRing, LayoutDashboard, BarChart3, Building2, Activity, Leaf, Power, PowerOff, RefreshCw, DollarSign, Sigma, Bolt, SlidersHorizontal, Settings, TestTube2 } from 'lucide-react';
// Placeholder for API Key (Canvas will inject if needed)
const apiKey = "";


const processes = ['Overall Plant', 'Paint', 'Welder', 'HVAC', 'Conveyor', 'Robotics Arms'];
// Filtered list for dropdowns, removing "Overall Plant"
const processesForSelection = processes.filter(p => p !== 'Overall Plant');

// --- Tech Mahindra Color Palette ---
// NOTE: In a real-world project, these would be defined in tailwind.config.js
const TM_RED = '#ED1C24';
const TM_DARK_BLUE = '#07233B';
const TM_LIGHT_BLUE = '#00A3E0';
const TM_GRAY_TEXT = '#4B5563';
const TM_LIGHT_GRAY_BG = '#F7F7F7';
const TM_WHITE = '#FFFFFF';
const TM_BORDER_GRAY = '#E5E7EB';

const PIE_COLORS = [TM_RED, TM_LIGHT_BLUE, '#FFBB28', '#FF8042']; // Kept some originals for variety
const COLORS = ['#ED1C24', '#07233B', '#00A3E0', '#4B5563', '#a4de6c', '#d0ed57', '#ff7300', '#2E8BC0'];


// --- MOCK DATA ENHANCEMENTS ---

// Mock Database for Equipment per Process
const processEquipmentDB = {
    Paint: [
        { name: 'Electrostatic Sprayer 1', icon: Cpu },
        { name: 'Curing Oven A', icon: Thermometer },
        { name: 'Mixing Vat 3', icon: Droplet },
        { name: 'Conveyor Line P-1', icon: TrendingUp },
    ],
    Welder: [
        { name: 'Spot Welder R-5', icon: Factory },
        { name: 'Arc Welder Z-9', icon: Factory },
        { name: 'Seam Welder T-1', icon: Factory },
    ],
    HVAC: [
        { name: 'Chiller Unit 1', icon: Thermometer },
        { name: 'Air Handler 4', icon: Wind },
        { name: 'Cooling Tower 2', icon: CloudRain },
    ],
    Conveyor: [
        { name: 'Main Assembly Line', icon: TrendingUp },
        { name: 'Parts Transfer Belt', icon: TrendingUp },
        { name: 'Final Inspection Line', icon: TrendingUp },
    ],
    'Robotics Arms': [
        { name: 'Assembly Arm A1', icon: Cpu },
        { name: 'Assembly Arm A2', icon: Cpu },
        { name: 'Welding Arm W1', icon: Cpu },
        { name: 'Painting Arm P1', icon: Cpu },
    ],
};

// New function to generate detailed live data for processes
// const generateLiveProcessData = () => {
//     const processData = {};
//     let totalPlantEnergy = 0;
//     let totalPlantRenewable = 0;
//     let totalPlantNonRenewable = 0;

//     Object.keys(processEquipmentDB).forEach(processName => {
//         let totalProcessEnergy = 0;
//         const equipment = processEquipmentDB[processName].map(equip => {
//             const voltage = parseFloat((220 + (Math.random() - 0.5) * 10).toFixed(2)); // Volts
//             const current = parseFloat((15 + (Math.random() - 0.5) * 5).toFixed(2)); // Amps
//             const energy = parseFloat(((voltage * current) / 1000).toFixed(3)); // kWh
//             totalProcessEnergy += energy;
//             return { ...equip, voltage, current, energy };
//         });

//         const processKey = processName.toLowerCase().replace(/ /g, '');
//         // Simulate a unique renewable mix for each process
//         const processRenewable = totalProcessEnergy * (0.3 + Math.random() * 0.4); // 30-70% renewable mix per process
//         const processNonRenewable = Math.max(0, totalProcessEnergy - processRenewable);
        
//         processData[processKey] = {
//             energy: parseFloat(totalProcessEnergy.toFixed(2)),
//             renewable: parseFloat(processRenewable.toFixed(2)),
//             nonRenewable: parseFloat(processNonRenewable.toFixed(2)),
//             equipment,
//         };
//         totalPlantEnergy += totalProcessEnergy;
//         totalPlantRenewable += processRenewable;
//         totalPlantNonRenewable += processNonRenewable;
//     });
    
//     return {
//         ...processData,
//         totalPlantEnergy: parseFloat(totalPlantEnergy.toFixed(2)),
//         renewable: parseFloat(totalPlantRenewable.toFixed(2)),
//         nonRenewable: parseFloat(totalPlantNonRenewable.toFixed(2)),
//         renewableWind: parseFloat((totalPlantRenewable * 0.3).toFixed(2)),
//         renewableSolar: parseFloat((totalPlantRenewable * 0.5).toFixed(2)),
//         renewableHydro: parseFloat((totalPlantRenewable * 0.2).toFixed(2)),
//     };
// };


// Utility function to get local date time string for input type="datetime-local"
const getLocalDateTimeString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Utility function to parse datetime-local string to Date object
const parseLocalDateTimeString = (dtString) => {
    if (!dtString) return null;
    return new Date(dtString);
};


// Utility function to generate random data
// const generateRandomData = (count, min, max) => {
//   return Array.from({ length: count }, () => parseFloat((Math.random() * (max - min) + min).toFixed(2)));
// };

// Helper to format date for display
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// const generateHistoricalData = (startDateStr, endDateStr, systems) => {
//   const data = [];
//   const startDate = new Date(startDateStr);
//   const endDate = new Date(endDateStr);
//   const diffTime = Math.abs(endDate - startDate);
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//   for (let i = 0; i < diffDays; i++) {
//     const date = new Date(startDate);
//     date.setDate(startDate.getDate() + i);
//     const dayData = {
//       date: date.toISOString().split('T')[0],
//     };
//     let totalEnergy = 0;
//     systems.forEach(system => {
//       const energy = parseFloat((Math.random() * 100 + 500).toFixed(2));
//       dayData[system] = energy;
//       totalEnergy += energy;
//     });
//     dayData['Total Energy'] = parseFloat(totalEnergy.toFixed(2));
//     data.push(dayData);
//   }
//   return data;
// };

// const generateMonthlySummary = () => {
//   const data = [];
//   const systems = ['Paint', 'Welder', 'HVAC', 'Conveyor', 'Robotics Arms'];
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth(); // 0-indexed (Jan is 0)

//   for (let i = 0; i <= currentMonth; i++) { // Generate only up to the current month
//     const date = new Date(currentYear, i, 1);
//     const monthName = date.toLocaleString('default', { month: 'short' });
//     const year = date.getFullYear();
//     const monthData = {
//       month: `${monthName} ${year}`,
//     };
//     let totalEnergy = 0;
//     systems.forEach(system => {
//       const energy = parseFloat((Math.random() * 1000 + 5000).toFixed(2));
//       monthData[system] = energy;
//       totalEnergy += energy;
//     });
//     monthData['Total Energy (kWh)'] = parseFloat(totalEnergy.toFixed(2));
//     data.push(monthData);
//   }
//   return data;
// };

// const generateDailyStackedData = (startDateStr, endDateStr) => {
//   const data = [];
//   const startDate = new Date(startDateStr);
//   const endDate = new Date(endDateStr);
//   const diffTime = Math.abs(endDate - startDate);
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//   for (let i = 0; i < diffDays; i++) {
//     const date = new Date(startDate);
//     date.setDate(startDate.getDate() + i);
//     data.push({
//       date: date.toISOString().split('T')[0],
//       Paint: parseFloat((Math.random() * 500 + 1000).toFixed(2)),
//       Welder: parseFloat((Math.random() * 300 + 800).toFixed(2)),
//       HVAC: parseFloat((Math.random() * 700 + 1500).toFixed(2)),
//       Conveyor: parseFloat((Math.random() * 200 + 600).toFixed(2)),
//       RoboticsArms: parseFloat((Math.random() * 400 + 1200).toFixed(2)),
//     });
//   }
//   return data;
// };

// // --- NEW TIME-SERIES COMPARISON DATA GENERATOR ---
// const generateTimeSeriesComparisonData = (selectedPlants, startDateStr, endDateStr) => {
//   const data = [];
//   const startDate = new Date(startDateStr);
//   const endDate = new Date(endDateStr);
//   const diffTime = Math.abs(endDate - startDate);
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//   for (let i = 0; i < diffDays; i++) {
//     const date = new Date(startDate);
//     date.setDate(startDate.getDate() + i);
//     const dayData = { date: date.toISOString().split('T')[0] };

//     selectedPlants.forEach(plant => {
//       const plantDailyData = generateLiveProcessData(); // Simulate daily data for a plant
//       dayData[`${plant}_totalEnergy`] = plantDailyData.totalPlantEnergy;
//       dayData[`${plant}_renewable`] = plantDailyData.renewable;
//       dayData[`${plant}_nonRenewable`] = plantDailyData.nonRenewable;
      
//       Object.keys(processEquipmentDB).forEach(processName => {
//         const processKey = processName.toLowerCase().replace(/ /g, '');
//         dayData[`${plant}_${processName}`] = plantDailyData[processKey]?.energy || 0;
//       });
//     });
//     data.push(dayData);
//   }
//   return data;
// };


// --- FORECASTING DATA GENERATION ---
const generatePointInTimeForecast = () => {
    // This function generates a forecast for a single point in time,
    // mirroring the structure of `generateLiveProcessData`
    const processData = {};
    let totalPlantEnergy = 0;
    let totalPlantRenewable = 0;
    let totalPlantNonRenewable = 0;

    Object.keys(processEquipmentDB).forEach(processName => {
        let totalProcessEnergy = 0;
        const equipment = processEquipmentDB[processName].map(equip => {
            // Forecasted values have a slightly larger random variance
            const voltage = parseFloat((220 + (Math.random() - 0.5) * 15).toFixed(2)); // Volts
            const current = parseFloat((15 + (Math.random() - 0.5) * 8).toFixed(2));  // Amps
            const energy = parseFloat(((voltage * current) / 1000).toFixed(3));       // kWh
            totalProcessEnergy += energy;
            return { ...equip, voltage, current, energy };
        });

        const processKey = processName.toLowerCase().replace(/ /g, '');
        const processRenewable = totalProcessEnergy * (0.25 + Math.random() * 0.45); // Forecasted mix might vary
        const processNonRenewable = Math.max(0, totalProcessEnergy - processRenewable);
        
        processData[processKey] = {
            energy: parseFloat(totalProcessEnergy.toFixed(2)),
            renewable: parseFloat(processRenewable.toFixed(2)),
            nonRenewable: parseFloat(processNonRenewable.toFixed(2)),
            equipment,
        };
        totalPlantEnergy += totalProcessEnergy;
        totalPlantRenewable += processRenewable;
        totalPlantNonRenewable += processNonRenewable;
    });
    
    return {
        ...processData,
        totalPlantEnergy: parseFloat((totalPlantEnergy * (0.9 + Math.random() * 0.2)).toFixed(2)),
        renewable: parseFloat(totalPlantRenewable.toFixed(2)),
        nonRenewable: parseFloat(totalPlantNonRenewable.toFixed(2)),
        renewableWind: parseFloat((totalPlantRenewable * 0.35).toFixed(2)),
        renewableSolar: parseFloat((totalPlantRenewable * 0.45).toFixed(2)),
        renewableHydro: parseFloat((totalPlantRenewable * 0.20).toFixed(2)),
    };
};


// Modified generateForecastData to accept explicit start and end dates
const generateForecastData = (startDate, endDate, systemsToForecast) => {
  const data = [];
  let totalConsumption = 0;
  const now = new Date();

  // Determine the duration in hours
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const totalHours = Math.ceil(diffTime / (1000 * 60 * 60));

  for (let i = 0; i <= totalHours; i++) {
    const date = new Date(startDate);
    date.setHours(startDate.getHours() + i);

    // Only generate data up to the endDate
    if (date.getTime() > endDate.getTime()) {
      break;
    }

    const actual = parseFloat((Math.random() * 100 + 500).toFixed(2));
    const predicted = parseFloat((actual * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2));
    const lowerBound = parseFloat((predicted * 0.95).toFixed(2));
    const upperBound = parseFloat((predicted * 1.05).toFixed(2));

    let item = {
      time: date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' }),
      actual: date.getTime() < now.getTime() ? actual : null, // Actual for past/current time
      predicted: predicted,
      lowerBound: lowerBound,
      upperBound: upperBound,
      isAnomaly: false,
      anomalyReason: '',
      anomalySeverity: '',
      affectedProcess: 'Overall Plant',
      anomalyId: null,
    };

    // Simulate anomaly injection based on the relative position within the generated range
    const relativeHour = i;
    const totalSimulatedHours = totalHours; // Use the calculated totalHours for proportion
    if (relativeHour === Math.floor(totalSimulatedHours / 3) || relativeHour === Math.floor(totalSimulatedHours * 2 / 3)) {
        const anomalyChance = Math.random();
        if (anomalyChance < 0.4) {
            item.isAnomaly = true;
            item.anomalyId = `anomaly-${Date.now()}-${i}`;
            item.affectedProcess = 'Overall Plant';
            if (Math.random() < 0.5) {
                item.predicted = parseFloat((item.predicted * (1.3 + Math.random() * 0.4)).toFixed(2));
                item.anomalyReason = 'Sudden surge due to unexpected production line activation.';
                item.anomalySeverity = 'Critical';
            } else {
                item.predicted = parseFloat((item.predicted * (0.4 - Math.random() * 0.2)).toFixed(2));
                item.anomalyReason = 'Major equipment failure leading to abrupt shutdown.';
                item.anomalySeverity = 'Critical';
            }
        } else if (anomalyChance < 0.8) {
            item.isAnomaly = true;
            item.anomalyId = `anomaly-${Date.now()}-${i}`;
            item.affectedProcess = ['HVAC', 'Paint'][Math.floor(Math.random() * 2)];
            item.predicted = parseFloat((item.predicted * (1.1 + Math.random() * 0.1)).toFixed(2));
            item.anomalyReason = `${item.affectedProcess} running unusually high for this hour.`;
            item.anomalySeverity = 'Warning';
        } else {
            item.isAnomaly = true;
            item.anomalyId = `anomaly-${Date.now()}-${i}`;
            item.affectedProcess = ['Welder', 'Conveyor'][Math.floor(Math.random() * 2)];
            item.predicted = parseFloat((item.predicted * (1.05 + Math.random() * 0.05)).toFixed(2));
            item.anomalyReason = `${item.affectedProcess} consumption consistently above baseline.`;
            item.anomalySeverity = 'Info';
        }
        item.lowerBound = parseFloat((item.predicted * 0.95).toFixed(2));
        item.upperBound = parseFloat((item.predicted * 1.05).toFixed(2));
    }

    const systemValues = {};
    const systemActuals = {};
    systemsToForecast.forEach(system => {
      let sysPredicted = parseFloat((Math.random() * 50 + 100).toFixed(2));
      let sysActual = date.getTime() < now.getTime() ? parseFloat((sysPredicted * (1 + (Math.random() - 0.5) * 0.05))).toFixed(2) : null;

      if (!item.isAnomaly && Math.random() < 0.05 && system !== 'Overall Plant') {
        item.isAnomaly = true;
        item.anomalyId = `anomaly-${Date.now()}-${i}-${system}`;
        item.affectedProcess = system;
        item.anomalySeverity = 'Warning';
        if (Math.random() < 0.5) {
          sysPredicted = parseFloat((sysPredicted * (1.5 + Math.random() * 0.5)).toFixed(2));
          item.anomalyReason = `${system} saw a sudden spike due to increased activity.`;
          item.anomalySeverity = 'Critical';
        } else {
          sysPredicted = parseFloat((sysPredicted * (0.3 + Math.random() * 0.2)).toFixed(2));
          item.anomalyReason = `${system} experienced a sudden drop due to unexpected downtime.`;
          item.anomalySeverity = 'Warning';
        }
        // Recalculate overall predicted if a system-specific anomaly is injected
        item.predicted = parseFloat((Object.values(systemValues).reduce((sum, val) => sum + val, 0) + sysPredicted).toFixed(2));
        item.lowerBound = parseFloat((item.predicted * 0.95).toFixed(2));
        item.upperBound = parseFloat((item.predicted * 1.05).toFixed(2));
      }

      systemValues[system.replace(' ', '') + 'Predicted'] = sysPredicted;
      systemActuals[system.replace(' ', '') + 'Actual'] = sysActual;
    });

    item = { ...item, ...systemValues, ...systemActuals };
    data.push(item);
    totalConsumption += predicted;
  }

  const mockRenewableMixPercent = parseFloat((Math.random() * 20 + 60).toFixed(2));
  const nonRenewableEnergy = totalConsumption * (1 - (mockRenewableMixPercent / 100));
  const renewableEnergy = totalConsumption * (mockRenewableMixPercent / 100);
  const forecastedEmissions = (nonRenewableEnergy * EMISSION_FACTOR_NON_RENEWABLE_KG_PER_KWH) +
                                (renewableEnergy * EMISSION_FACTOR_RENEWABLE_KG_PER_KWH);

  return { data, totalConsumption, forecastedEmissions: parseFloat(forecastedEmissions.toFixed(2)) };
};


const generateFeatureImportance = () => {
  const features = [
    { name: 'Outside Temperature', contribution: 32 },
    { name: 'Production Schedule', contribution: 21 },
    { name: 'Historical Load', contribution: 18 },
    { name: 'Machinery Load', contribution: 15 },
    { name: 'Shift Schedules', contribution: 9 },
    { name: 'Humidity', contribution: 5 },
  ];
  return features.sort((a, b) => b.contribution - a.contribution);
};

const generateDeviationData = (days = 7) => {
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const forecasted = parseFloat((Math.random() * 2000 + 8000).toFixed(2));
    const actual = parseFloat((forecasted * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2));
    const deviation = parseFloat((((actual - forecasted) / forecasted) * 100).toFixed(2));
    data.push({
      date: date.toISOString().split('T')[0],
      forecasted,
      actual,
      deviation,
    });
  }
  return data.reverse();
};

// const generateWeatherConditions = () => {
//     return {
//       current: {
//         temperature: generateRandomData(1, 15, 30)[0],
//         humidity: generateRandomData(1, 40, 90)[0],
//         windSpeed: generateRandomData(1, 5, 20)[0],
//         conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
//       },
//       forecast: { // Added forecast weather
//         temperature: generateRandomData(1, 18, 32)[0],
//         humidity: generateRandomData(1, 35, 85)[0],
//         windSpeed: generateRandomData(1, 8, 25)[0],
//         conditions: ['Sunny', 'Partly Cloudy', 'Scattered Showers'][Math.floor(Math.random() * 3)],
//       }
//     };
// };

// EMISSION DATA GENERATION FUNCTIONS
const EMISSION_FACTOR_NON_RENEWABLE_KG_PER_KWH = 0.45;
const EMISSION_FACTOR_RENEWABLE_KG_PER_KWH = 0.02;

// const generateEmissionMetrics = (currentEnergyConsumption, renewableMixPercent) => {
//     if (isNaN(currentEnergyConsumption) || isNaN(renewableMixPercent) || currentEnergyConsumption === 0) {
//         return { totalEmissions: 0, processEmissions: [], sourceEmissions: [], emissionIntensity: 0, benchmark: 0.35 };
//     }
//     const nonRenewableEnergy = currentEnergyConsumption * (1 - (renewableMixPercent / 100));
//     const renewableEnergy = currentEnergyConsumption * (renewableMixPercent / 100);

//     const totalEmissions = (nonRenewableEnergy * EMISSION_FACTOR_NON_RENEWABLE_KG_PER_KWH) +
//                               (renewableEnergy * EMISSION_FACTOR_RENEWABLE_KG_PER_KWH);

//     const specificProcesses = processes.filter(p => p !== 'Overall Plant');
//     const processEmissions = specificProcesses.map(processName => {
//         const baseEmission = totalEmissions * (Math.random() * 0.15 + 0.05);
//         return { name: processName, emissions: parseFloat(baseEmission.toFixed(2)) };
//     });

//     const sourceEmissions = [
//         { name: 'Non-Renewable', emissions: parseFloat((nonRenewableEnergy * EMISSION_FACTOR_NON_RENEWABLE_KG_PER_KWH).toFixed(2)) },
//         { name: 'Renewable', emissions: parseFloat((renewableEnergy * EMISSION_FACTOR_RENEWABLE_KG_PER_KWH).toFixed(2)) },
//     ];

//     const emissionIntensity = parseFloat((totalEmissions / currentEnergyConsumption).toFixed(3));

//     return {
//         totalEmissions: parseFloat(totalEmissions.toFixed(2)),
//         processEmissions,
//         sourceEmissions,
//         emissionIntensity,
//         benchmark: 0.35
//     };
// };

// const generateDailyEmissions = (startDateStr, endDateStr) => {
//     const data = [];
//     const startDate = new Date(startDateStr);
//     const endDate = new Date(endDateStr);
//     const diffTime = Math.abs(endDate - startDate);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//     for (let i = 0; i < diffDays; i++) {
//         const date = new Date(startDate);
//         date.setDate(startDate.getDate() + i);
//         const totalConsumption = parseFloat((Math.random() * 10000 + 5000).toFixed(2));
//         const renewableMix = parseFloat((Math.random() * 30 + 50).toFixed(2));
//         const emissionsData = generateEmissionMetrics(totalConsumption, renewableMix);
//         data.push({
//             date: date.toISOString().split('T')[0],
//             totalEmissions: emissionsData.totalEmissions,
//             benchmark: emissionsData.benchmark * totalConsumption
//         });
//     }
//     return data;
// };


const CustomTooltip = ({ active, payload, label, unit = 'kWh' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-lg text-gray-700">
        <p className="font-semibold" style={{color: TM_DARK_BLUE}}>{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value} ${entry.unit || unit}`}
          </p>
        ))}
        {payload[0].payload.isAnomaly && (
            <p style={{color: TM_RED}} className="text-xs mt-1">
                ⚠️ Anomaly: {payload[0].payload.anomalyReason}
            </p>
        )}
      </div>
    );
  }
  return null;
};

const RealtimeClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="text-right" style={{color: TM_DARK_BLUE}}>
            <p className="text-sm font-medium" style={{color: TM_GRAY_TEXT}}>{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-2xl font-bold">{time.toLocaleTimeString()}</p>
        </div>
    );
};

const Header = ({ activeTab, setActiveTab, currentPlant, setCurrentPlant }) => {
  const [plantList, setPlantList] = useState([]);
  
    useEffect(() => {
      fetch('http://localhost:8080/api/plants')
        .then(res => res.json())
        .then(data => {
          setPlantList(data);
          setCurrentPlant(data[0]); // select first plant by default
        })
        .catch(err => console.error('Failed to load plants', err));
      }, []);

  const activeTabStyle = {
    backgroundColor: TM_RED,
    color: TM_WHITE,
  };
  const inactiveTabStyle = {
    color: TM_RED,
  };


  return(
  <header className="w-full bg-white p-4 shadow-md sticky top-0 z-50 border-b-4" style={{borderColor: TM_RED}}>
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between relative">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <img src="https://logowik.com/content/uploads/images/tech-mahindra-new6235.logowik.com.webp" alt="TechM Logo" className="h-10"/>
                    <div>
                        <h1 className="text-3xl font-extrabold" style={{color: TM_RED}}>VoltVisor</h1>
                        <p className="text-sm font-medium mt-1" style={{color: TM_RED}}>
                            AI-Powered Energy Intelligence • Predict • Optimize
                        </p>
                    </div>
                </div>
                {/* <Dropdown
                    label="Plant Selector"
                    options={plantList.map(p => p.plantName)}
                    selected={currentPlant?.plantName || ''}
                    onChange={(selectedName) => {
                    const selectedPlant = plantList.find(p => p.plantName === selectedName);
                    setCurrentPlant(selectedPlant);
                    }}
                /> */}
            </div>
      <nav className="flex items-center space-x-2 md:space-x-4 absolute left-1/2 -translate-x-1/2">
        {['Monitoring', 'Forecasting', 'Insights', 'AI Copilot'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? activeTabStyle : inactiveTabStyle}
            className={`px-4 py-2 rounded-lg font-medium text-base transition-all duration-300
              ${activeTab === tab
                ? 'shadow-lg scale-105'
                : 'hover:bg-gray-100 hover:scale-105'
              }`}
          >
            {tab}
          </button>
        ))}
        </nav>
        <div className="pl-4">
            <Dropdown
                    label="Plant Selector"
                    options={plantList.map(p => p.plantName)}
                    selected={currentPlant?.plantName || ''}
                    onChange={(selectedName) => {
                    const selectedPlant = plantList.find(p => p.plantName === selectedName);
                    setCurrentPlant(selectedPlant);
                    }}
                    size="small"
                />
        </div>
      
    </div>
  </header>
  );
};

const SectionCard = ({ title, children, className = '' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-md border border-gray-200 ${className}`}>
    <h3 className="text-xl font-semibold mb-4" style={{color: TM_DARK_BLUE}}>{title}</h3>
    {children}
  </div>
);

const Dropdown = ({ label, options, selected, onChange, isMulti = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    if (isMulti) {
      const newSelection = selected.includes(option)
        ? selected.filter(item => item !== option)
        : [...selected, option];
      onChange(newSelection);
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left w-full md:w-auto" ref={dropdownRef}>
      <label htmlFor={label} className="sr-only">{label}</label>
      <button
        type="button"
        className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-red-500"
        id={label}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isMulti ? (selected.length > 0 ? selected.join(', ') : `Select ${label}`) : selected}
        <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute z-20 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={label}
        >
          <div className="py-1 max-h-60 overflow-y-auto" role="none">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                role="menuitem"
              >
                {isMulti && (
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => handleSelect(option)}
                    className="form-checkbox h-4 w-4 text-red-600 transition duration-150 ease-in-out bg-gray-100 border-gray-300 rounded"
                  />
                )}
                <span className={isMulti ? 'ml-2' : ''} onClick={() => !isMulti && handleSelect(option)}>{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, unit, color, icon: Icon, className = '', children }) => (
  <div className={`flex flex-col p-5 rounded-xl shadow-lg border-l-4 ${className}`} style={{borderColor: color, backgroundColor: TM_WHITE}}>
    <div className="flex items-center mb-2">
      <div className={`p-3 rounded-full mr-4`} style={{ backgroundColor: `${color}1A` }}>
          {Icon && <Icon className={`h-8 w-8`} style={{ color: color }} />}
      </div>
      <div>
        <p className="text-lg font-medium" style={{color: TM_GRAY_TEXT}}>{title}</p>
        <p className="text-3xl font-bold mt-1" style={{color: TM_DARK_BLUE}}>{value}<span className="text-xl font-semibold" style={{color: TM_GRAY_TEXT}}>{unit}</span></p>
      </div>
    </div>
    {children} {/* For date/time pickers */}
  </div>
);

const DateRangePicker = ({ startDate, endDate, period, onStartDateChange, onEndDateChange, onPeriodChange }) => {
    // Helper function to format date to yyyy-MM-dd
    const formatDateForInput = (date) => {
        if (!date) return '';
        
        // If it's already a string in correct format
        if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return date;
        }
        
        // If it's a Date object or other format
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '';
        
        return dateObj.toISOString().split('T')[0];
    };

    const handleStartDateChange = (e) => {
        const value = e.target.value;
        onStartDateChange(value);
        onPeriodChange('Custom');
    };

    const handleEndDateChange = (e) => {
        const value = e.target.value;
        onEndDateChange(value);
        onPeriodChange('Custom');
    };
    
    const periodBtnStyle = {
      backgroundColor: '#E5E7EB', // bg-gray-200
      color: TM_GRAY_TEXT
    };
    const activePeriodBtnStyle = {
      backgroundColor: TM_RED,
      color: TM_WHITE
    };


    return (
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
    <div className="flex items-center gap-2">
        <label className="text-xs font-medium w-8" style={{color: TM_GRAY_TEXT}}>From:</label>
        <input 
            type="date" 
            value={formatDateForInput(startDate)} 
            onChange={handleStartDateChange}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 w-32"
            style={{color: TM_DARK_BLUE}}
        />
    </div>
    
    <div className="flex items-center gap-2">
        <label className="text-xs font-medium w-8" style={{color: TM_GRAY_TEXT}}>To:</label>
        <input 
            type="date" 
            value={formatDateForInput(endDate)} 
            onChange={handleEndDateChange}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 w-32"
             style={{color: TM_DARK_BLUE}}
        />
    </div>
    
    <div className="flex space-x-1 ml-auto">
        {['1D', '1W', '1M'].map(p => (
            <button 
                key={p} 
                onClick={() => onPeriodChange(p)} 
                style={period === p ? activePeriodBtnStyle : periodBtnStyle}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all duration-200 hover:bg-gray-300`}
            >
                {p}
            </button>
        ))}
    </div>
</div>
    );
};
const generateAlerts = (count = 20) => {
    const alerts = [];
    const now = new Date();
    const severities = ['Critical', 'Warning', 'Info'];
    const types = ['Forecast Anomaly', 'Equipment Spike', 'Deviation', 'Maintenance Alert'];
    const statuses = ['New', 'Acknowledged', 'Resolved'];
    const processesForSelection = ['Paint', 'Welder', 'HVAC', 'Conveyor', 'Robotics Arms'];


    for (let i = 0; i < count; i++) {
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const affectedProcess = processesForSelection[Math.floor(Math.random() * processesForSelection.length)];
        let description = '';
        let recommendation = '';

        switch (severity) {
            case 'Critical':
                description = `Critical power surge predicted for the ${affectedProcess} process. Potential for equipment damage.`;
                recommendation = `Immediately review the production schedule for the ${affectedProcess} process. Consider halting non-essential operations during the predicted surge time.`;
                break;
            case 'Warning':
                description = `Forecasted energy consumption for ${affectedProcess} is 25% above the operational baseline.`;
                recommendation = `Investigate the machinery in the ${affectedProcess} area. Prepare for higher-than-usual energy costs.`;
                break;
            case 'Info':
            default:
                description = `Minor deviation expected in ${affectedProcess} energy usage due to external temperature changes.`;
                recommendation = `No immediate action required. Monitor HVAC efficiency.`;
                break;
        }

        alerts.push({
            id: `alert-${Date.now()}-${i}`,
            severity,
            timestamp: new Date(now.getTime() + i * 6 * 60 * 60 * 1000), // Stagger alerts over the next few days
            type: types[Math.floor(Math.random() * types.length)],
            description,
            affectedProcess,
            status: i < 5 ? 'New' : statuses[Math.floor(Math.random() * statuses.length)], // Make first few 'New'
            recommendation,
        });
    }
    // Sort by status ('New' first), then by timestamp (most recent first)
    return alerts.sort((a, b) => {
        if (a.status === 'New' && b.status !== 'New') return -1;
        if (a.status !== 'New' && b.status === 'New') return 1;
        return b.timestamp - a.timestamp;
    });
};


const COST_PER_KWH = 8.50; // Simulated cost in a local currency (e.g., INR)
const PEAK_DEMAND_CHARGE_PER_KW = 450; // Cost for the highest kW reached in the period


// Generates a baseline 24-hour forecast load profile
const generateBaselineHourlyData = () => {
    const data = [];
    // Typical M-shaped daily load for a 2-shift factory
    const baseLoadShape = [5, 5, 5, 5, 5, 6, 8, 15, 18, 19, 18, 15, 12, 15, 18, 19, 20, 19, 18, 12, 8, 6, 5, 5];
    for (let i = 0; i < 24; i++) {
        data.push({
            hour: `${i}:00`,
            baseline: baseLoadShape[i] * 100 + (Math.random() - 0.5) * 100, // in kWh
            // Breakdown by process (as a percentage of baseline)
            hvac: 0.30,
            paint: 0.25,
            welder: 0.20,
            conveyor: 0.15,
            robotics: 0.10,
        });
    }
    return data;
};

// The core simulation engine
const runSimulation = (baselineData, params) => {
    const scenarioData = baselineData.map(hourData => {
        let scenarioLoad = hourData.baseline;

        // 1. Apply Production Volume Change
        scenarioLoad *= (1 + params.productionVolume / 100);

        // 2. Apply Process Efficiency Gains
        const hvacLoad = scenarioLoad * hourData.hvac * (1 - params.hvacEfficiency / 100);
        const paintLoad = scenarioLoad * hourData.paint * (1 - params.paintEfficiency / 100);
        const welderLoad = scenarioLoad * hourData.welder * (1 - params.welderEfficiency / 100);
        // Assume other processes remain the same proportion of the new load
        const otherLoad = scenarioLoad * (hourData.conveyor + hourData.robotics);
        scenarioLoad = hvacLoad + paintLoad + welderLoad + otherLoad;

        // 3. Add Night Shift Load
        const hour = parseInt(hourData.hour.split(':')[0]);
        if (params.addNightShift && (hour >= 22 || hour <= 5)) {
            scenarioLoad += 800; // Add a flat 800 kWh load for the night shift
        }
        
        return {
            ...hourData,
            scenario: scenarioLoad,
        };
    });

    return scenarioData;
};

// Calculates final metrics from a data series (baseline or scenario)
const calculateMetrics = (data, seriesKey, renewableMix) => {
    const totalKwh = data.reduce((sum, d) => sum + d[seriesKey], 0);
    const peakDemand = Math.max(...data.map(d => d[seriesKey]));
    
    // Cost calculation
    const energyCost = totalKwh * COST_PER_KWH;
    const demandCost = peakDemand * PEAK_DEMAND_CHARGE_PER_KW;
    const totalCost = energyCost + demandCost;

    // Emission calculation
    const renewableEnergy = totalKwh * (renewableMix / 100);
    const nonRenewableEnergy = totalKwh * (1 - renewableMix / 100);
    const totalEmissions = (nonRenewableEnergy * EMISSION_FACTOR_NON_RENEWABLE_KG_PER_KWH) +
                              (renewableEnergy * EMISSION_FACTOR_RENEWABLE_KG_PER_KWH);

    return {
        totalKwh: parseFloat(totalKwh.toFixed(0)),
        peakDemand: parseFloat(peakDemand.toFixed(0)),
        totalCost: parseFloat(totalCost.toFixed(0)),
        totalEmissions: parseFloat(totalEmissions.toFixed(0)),
    };
};


// --- REACT COMPONENT FOR THE SCENARIO PLANNER TAB ---

const ScenarioPlannerTab = () => {
    const [baselineHourlyData] = useState(generateBaselineHourlyData());
    const [baselineMetrics, setBaselineMetrics] = useState(null);
    const [scenarioMetrics, setScenarioMetrics] = useState(null);
    const [combinedData, setCombinedData] = useState(baselineHourlyData.map(d => ({ ...d, scenario: d.baseline })));

    const initialParams = {
        productionVolume: 0,
        addNightShift: false,
        hvacEfficiency: 0,
        paintEfficiency: 0,
        welderEfficiency: 0,
        renewableMix: 40,
    };
    const [params, setParams] = useState(initialParams);

    useEffect(() => {
        const metrics = calculateMetrics(baselineHourlyData, 'baseline', params.renewableMix);
        setBaselineMetrics(metrics);
    }, [baselineHourlyData, params.renewableMix]);

    const handleParamChange = (param, value) => {
        setParams(prev => ({ ...prev, [param]: value }));
    };

    const handleRunSimulation = () => {
        const scenarioHourlyData = runSimulation(baselineHourlyData, params);
        const newScenarioMetrics = calculateMetrics(scenarioHourlyData, 'scenario', params.renewableMix);
        setScenarioMetrics(newScenarioMetrics);
        
        setCombinedData(baselineHourlyData.map((d, i) => ({
            ...d,
            scenario: scenarioHourlyData[i].scenario,
        })));
    };
    
    const handleReset = () => {
        setParams(initialParams);
        setScenarioMetrics(null);
        setCombinedData(baselineHourlyData.map(d => ({ ...d, scenario: d.baseline })));
    }
    
    const ParameterSlider = ({ icon: Icon, label, value, onChange, min, max, step, unit }) => (
        <div>
            <label className="flex items-center font-medium mb-2" style={{color: TM_DARK_BLUE}}>
                <Icon className="h-5 w-5 mr-3" style={{color: TM_LIGHT_BLUE}} />
                {label}
            </label>
            <div className="flex items-center space-x-4">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={e => onChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{ '--thumb-color': TM_RED }}
                />
                <span className="text-lg font-bold w-24 text-right" style={{color: TM_DARK_BLUE}}>{value}{unit}</span>
            </div>
        </div>
    );

    const costDifference = scenarioMetrics && baselineMetrics ? scenarioMetrics.totalCost - baselineMetrics.totalCost : 0;
    const costColor = costDifference >= 0 ? '#EF4444' : '#22C55E';

    return (
        <div className="p-6 min-h-screen" style={{backgroundColor: TM_LIGHT_GRAY_BG, color: TM_GRAY_TEXT}}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Left Column: Control Panel --- */}
                <div className="lg:col-span-1 space-y-6">
                    <SectionCard title="Scenario Parameters">
                        <div className="space-y-8">
                           <ParameterSlider icon={TrendingUp} label="Production Volume" value={params.productionVolume} onChange={v => handleParamChange('productionVolume', v)} min={-50} max={50} step={5} unit="%" />
                           <ParameterSlider icon={Leaf} label="Renewable Energy Mix" value={params.renewableMix} onChange={v => handleParamChange('renewableMix', v)} min={0} max={100} step={5} unit="%" />

                           <div className="pt-4 border-t border-gray-200">
                                <label className="flex items-center font-medium mb-3 text-lg" style={{color: TM_DARK_BLUE}}>
                                   <Factory className="h-6 w-6 mr-3" style={{color: TM_LIGHT_BLUE}} />
                                   Operational Changes
                                </label>
                                <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                                   <span className="font-medium" style={{color: TM_GRAY_TEXT}}>Add Full Night Shift</span>
                                   <label className="relative inline-flex items-center cursor-pointer">
                                       <input type="checkbox" checked={params.addNightShift} onChange={e => handleParamChange('addNightShift', e.target.checked)} className="sr-only peer" />
                                       <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                   </label>
                                </div>
                           </div>
                           
                           <div className="pt-5 border-t border-gray-200">
                                <p className="font-medium mb-4 text-lg" style={{color: TM_DARK_BLUE}}>
                                   Process Efficiency Gains
                                </p>
                                <div className="space-y-6">
                                   <ParameterSlider icon={Thermometer} label="HVAC" value={params.hvacEfficiency} onChange={v => handleParamChange('hvacEfficiency', v)} min={0} max={50} step={5} unit="%" />
                                   <ParameterSlider icon={Power} label="Paint Shop" value={params.paintEfficiency} onChange={v => handleParamChange('paintEfficiency', v)} min={0} max={50} step={5} unit="%" />
                                   <ParameterSlider icon={PowerOff} label="Welding" value={params.welderEfficiency} onChange={v => handleParamChange('welderEfficiency', v)} min={0} max={50} step={5} unit="%" />
                                </div>
                           </div>
                           
                           <div className="flex items-center justify-center space-x-4 pt-6">
                               <button onClick={handleRunSimulation} className="w-2/3 flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg text-lg" style={{backgroundColor: TM_RED}}>
                                   Run Simulation
                               </button>
                               <button onClick={handleReset} title="Reset Parameters" className="p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200" style={{color: TM_DARK_BLUE}}>
                                   <RefreshCw className="h-6 w-6" />
                               </button>
                           </div>
                        </div>
                    </SectionCard>
                </div>

                {/* --- Right Column: Results --- */}
                <div className="lg:col-span-2 space-y-8">
                    <SectionCard title="Scenario Impact Analysis">
                        {!scenarioMetrics && (
                            <div className="text-center py-20 text-gray-500">
                                <SlidersHorizontal className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                <p className="text-xl font-semibold">Tune parameters and run a simulation</p>
                                <p>See how your decisions impact energy, cost, and emissions.</p>
                            </div>
                        )}
                        {scenarioMetrics && baselineMetrics && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard 
                                    title="Projected Cost Change" 
                                    value={Math.abs(costDifference).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                                    unit={costDifference >= 0 ? " Increase" : " Savings"}
                                    color={costColor}
                                    icon={DollarSign}
                                />
                                <StatCard title="New Energy Total" value={scenarioMetrics.totalKwh.toLocaleString()} unit=" kWh" color={TM_LIGHT_BLUE} icon={Power} />
                                <StatCard title="New CO₂ Emissions" value={scenarioMetrics.totalEmissions.toLocaleString()} unit=" kg" color="#10B981" icon={Leaf} />
                            </div>
                        )}
                    </SectionCard>
                    
                    <SectionCard title="Forecasted Load Comparison (Next 24 Hours)">
                       <ResponsiveContainer width="100%" height={350}>
                           <AreaChart data={combinedData}>
                               <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY} />
                               <XAxis dataKey="hour" stroke={TM_GRAY_TEXT} />
                               <YAxis stroke={TM_GRAY_TEXT} label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: TM_GRAY_TEXT }} />
                               <Tooltip content={<CustomTooltip />} />
                               <Legend wrapperStyle={{ color: TM_DARK_BLUE }} />
                               <Area type="monotone" dataKey="baseline" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} name="Baseline Forecast" />
                               <Area type="monotone" dataKey="scenario" stroke={TM_RED} fill={TM_RED} fillOpacity={0.4} name="Scenario Forecast" />
                           </AreaChart>
                       </ResponsiveContainer>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
};
// Paste this entire component into your App.js file
const CostAnalysisSubTab = ({ currentPlant, totalPlantEnergy, renewableBreakdown, processList, historicalData }) => {
    if (!currentPlant) {
        return <SectionCard title="Cost Analysis">Loading plant data...</SectionCard>;
    }

    const location = currentPlant.city;
    const costs = COST_DATA[location];

    if (!costs) {
        return <SectionCard title="Cost Analysis">Cost data not available for {location}.</SectionCard>;
    }

    const { currency, currencySymbol, grid, solar, wind, hydro } = costs;

    const nonRenewableKWh = Math.max(0, totalPlantEnergy - renewableBreakdown.total);
    const costFromGrid = nonRenewableKWh * grid;
    const costFromWind = renewableBreakdown.wind * wind;
    const costFromSolar = renewableBreakdown.solar * solar;
    const costFromHydro = renewableBreakdown.hydro * hydro;
    const totalCost = costFromGrid + costFromWind + costFromSolar + costFromHydro;

    const costBreakdownData = [
        { name: 'Grid (Non-Renewable)', cost: parseFloat(costFromGrid.toFixed(2)), fill: '#ef5350' },
        { name: 'Wind', cost: parseFloat(costFromWind.toFixed(2)), fill: '#82ca9d' },
        { name: 'Solar', cost: parseFloat(costFromSolar.toFixed(2)), fill: '#fdd835' },
        { name: 'Hydro', cost: parseFloat(costFromHydro.toFixed(2)), fill: '#4fc3f7' },
    ];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(value);
    };

    const processCostData = processList.map(process => {
        const processEnergyData = historicalData.reduce((acc, day) => acc + (day[process.processName] || 0), 0);
        const [windPct, solarPct, hydroPct] = process.renewableEnergyPercentage || [0,0,0];

        const processRenewablePct = (windPct + solarPct + hydroPct) / 100;
        const processNonRenewablePct = 1 - processRenewablePct;

        const processWindEnergy = processEnergyData * (windPct / 100);
        const processSolarEnergy = processEnergyData * (solarPct / 100);
        const processHydroEnergy = processEnergyData * (hydroPct / 100);
        const processGridEnergy = processEnergyData * processNonRenewablePct;

        const cost = (processGridEnergy * grid) + (processWindEnergy * wind) + (processSolarEnergy * solar) + (processHydroEnergy * hydro);

        return {
            name: process.processName,
            cost: parseFloat(cost.toFixed(2))
        };
    });

    return (
        <div className="space-y-6">
            <SectionCard title={`Cost Analysis for ${currentPlant.plantName}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard title="Total Estimated Cost" value={formatCurrency(totalCost)} color="#10B981" icon={DollarSign} />
                    <StatCard title="Cost from Mains Power" value={formatCurrency(costFromGrid)} color="#ef5350" icon={Power} />
                    <StatCard title="Cost from Renewables" value={formatCurrency(costFromWind + costFromSolar + costFromHydro)} color="#22C55E" icon={Wind} />
                    <StatCard title="Average Cost / kWh" value={formatCurrency(totalPlantEnergy > 0 ? totalCost / totalPlantEnergy : 0)} color="#F59E0B" icon={Power} />
                </div>
            </SectionCard>

            <SectionCard title="Cost Breakdown by Energy Source">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={costBreakdownData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" stroke="#4B5563" tickFormatter={(tick) => `${currencySymbol}${tick.toLocaleString()}`} />
                        <YAxis type="category" dataKey="name" width={150} stroke="#4B5563" />
                        <Tooltip content={<CustomTooltip unit={currencySymbol} />} formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="cost" name="Cost" barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </SectionCard>

            {/* <SectionCard title="Estimated Cost per Process">
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm font-medium uppercase tracking-wider">
                                <th className="px-4 py-3 rounded-tl-lg">Process</th>
                                <th className="px-4 py-3 rounded-tr-lg">Estimated Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                           {processCostData.sort((a,b) => b.cost - a.cost).map(item => (
                             <tr key={item.name} className="hover:bg-gray-50">
                               <td className="px-4 py-3 font-medium">{item.name}</td>
                               <td className="px-4 py-3 font-bold">{formatCurrency(item.cost)}</td>
                             </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard> */}
        </div>
    );
};
const MonitoringTab = ({ currentPlant }) => {
  const [activeSubTab, setActiveSubTab] = useState('Live');
  const plantId = currentPlant?.plantId; // from Header dropdown
  const [totalPlantEnergy, setTotalPlantEnergy] = useState(0);
  
  
  const [processList, setProcessList] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [processEnergy, setProcessEnergy] = useState(0);
  const [processEmissions, setProcessEmissions] = useState(0);
  // const [startDate, setStartDate] = useState(() => {
  //       const today = new Date();
  //       return today.toISOString().split('T')[0];
  //   });
  //   const [endDate, setEndDate] = useState(() => {
  //       const today = new Date();
  //       return today.toISOString().split('T')[0];
  //   });
  //   const [period, setPeriod] = useState('1D');
  
const [startDate, setStartDate] = useState('2025-06-01');

  // Set the default end date to June 7th of the current year.
  const [endDate, setEndDate] = useState('2025-06-07');
  
  // Set the period to 'Custom' so that '1D', '1W', or '1M' aren't highlighted by default.
  const [period, setPeriod] = useState('Custom'); 
    // Helper function to format date
    const formatDate = (date) => date.toISOString().split('T')[0];

    // Handle period changes - common for all tabs
    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        
        const today = new Date();
        
        switch(newPeriod) {
            case '1D':
                setStartDate(formatDate(today));
                setEndDate(formatDate(today));
                break;
            case '1W':
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                setStartDate(formatDate(weekAgo));
                setEndDate(formatDate(today));
                break;
            case '1M':
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                setStartDate(formatDate(monthAgo));
                setEndDate(formatDate(today));
                break;
            case 'Custom':
                // Don't change dates for custom
                break;
        }
    };

  useEffect(() => {
  if (!currentPlant?.plantId) return;

  fetch(`http://localhost:8080/api/plants/${plantId}`)
    .then(res => res.json())
    .then(data => {
      setProcessList(data); // directly keep it as array of process objects
      setSelectedProcess(data[0]); // default selection
    })
    .catch(err => console.error("Failed to fetch processes", err));
}, [currentPlant]);

  useEffect(() => {
  if (!currentPlant?.plantId) return;

  fetch('http://localhost:8080/api/plants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plantId: currentPlant.plantId,
      startDate,
      endDate
    })
  })
    .then(res => res.json())
    .then(setTotalPlantEnergy)
    .catch(err => console.error('Error fetching total energy:', err));
}, [currentPlant, startDate, endDate]);

const wind = selectedProcess?.renewableEnergyPercentage?.[0] || 0;
const solar = selectedProcess?.renewableEnergyPercentage?.[1] || 0;
const hydro = selectedProcess?.renewableEnergyPercentage?.[2] || 0;
const processId = selectedProcess?.processId;
const totalRenewable = wind + solar + hydro;
const nonRenewable = 100 - totalRenewable;

useEffect(() => {
  if (!selectedProcess?.processId || !startDate || !endDate) return;

  fetch('http://localhost:8080/api/processes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      processId: selectedProcess.processId,
      startDate,
      endDate
    })
  })
    .then(res => res.json())
    .then(data => {
      setProcessEnergy(data.totalEnergyConsumedKWh);
      setProcessEmissions(data.totalCo2EmissionsKg);
    })
    .catch(err => console.error('Error fetching process energy/emissions:', err));
}, [selectedProcess, startDate, endDate]);

const [renewableBreakdown, setRenewableBreakdown] = useState({
  wind: 0,
  solar: 0,
  hydro: 0,
  total: 0,
});

useEffect(() => {
  const fetchEnergyForAllProcesses = async () => {
    if (!processList.length || !startDate || !endDate) return;

    let wind = 0, solar = 0, hydro = 0;

    for (const process of processList) {
      try {
        const res = await fetch('http://localhost:8080/api/processes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            processId: process.processId,
            startDate,
            endDate,
          }),
        });
        const data = await res.json();

        const energy = data.totalEnergyConsumedKWh || 0;
        const [w, s, h] = process.renewableEnergyPercentage || [0, 0, 0];

        wind += (w / 100) * energy;
        solar += (s / 100) * energy;
        hydro += (h / 100) * energy;

      } catch (error) {
        console.error(`Failed to fetch energy for process ${process.processName}`, error);
      }
    }

    setRenewableBreakdown({
      wind: parseFloat(wind.toFixed(2)),
      solar: parseFloat(solar.toFixed(2)), 
      hydro: parseFloat(hydro.toFixed(2)),
      total: parseFloat((wind + solar + hydro).toFixed(2)),
    });
  };

  fetchEnergyForAllProcesses();
}, [processList, startDate, endDate]);

const fetchEnergyForProcessByDate = async (processId, date) => {
  const response = await fetch('http://localhost:8080/api/processes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      processId,
      startDate: date,
      endDate:  date
    })
  });
  const data = await response.json();
  return data.totalEnergyConsumedKWh || 0;
};

const [historicalData, setHistoricalData] = useState([]);

useEffect(() => {
  const loadHistoricalData = async () => {
    if (!currentPlant || !processList.length) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateArray = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateArray.push(new Date(d));
    }

    const data = [];

    for (const date of dateArray) {
      const entry = { date: date.toISOString().split('T')[0] };
      let totalEnergy = 0;

      for (const process of processList) {
        const energy = await fetchEnergyForProcessByDate(process.processId, entry.date);
        entry[process.processName] = energy;
        totalEnergy += energy;
      }

      entry['Total Energy'] = parseFloat(totalEnergy.toFixed(2));
      data.push(entry);
    }

    setHistoricalData(data);
  };

  loadHistoricalData();
}, [startDate, endDate, currentPlant, processList]);

const trendLineOptions = processList.map(p => p.processName).concat('Total Energy');
const [visibleTrendLines, setVisibleTrendLines] = useState(trendLineOptions);

const [monthlySummary, setMonthlySummary] = useState([]);

useEffect(() => {
  if (!currentPlant?.plantId) return;

  const fetchMonthlySummary = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/plants/monthly/${currentPlant.plantId}`);
      const data = await res.json();

      const processWise = data.processWiseMonthly;
      const plantTotals = data.plantMonthlyTotal;

      const months = Object.keys(plantTotals);

      const formatted = months.map(month => {
        const row = { month };
        Object.keys(processWise).forEach(processName => {
          row[processName] = processWise[processName][month] ?? 0;
        });
        row["Total Energy (kWh)"] = plantTotals[month];
        return row;
      });

      setMonthlySummary(formatted);
    } catch (err) {
      console.error("Failed to fetch monthly summary:", err);
    }
  };

  fetchMonthlySummary();
}, [currentPlant]);

const processesForSelection = Object.keys(monthlySummary[0] || {}).filter(k => k !== 'month' && k !== 'Total Energy (kWh)');

const [historicalEmissions, setHistoricalEmissions] = useState([]);
const [totalEmissions, setTotalEmissions] = useState(0);

useEffect(() => {
  const fetchHistoricalEmissions = async () => {
    if (!currentPlant || !processList.length) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateArray = [];

    // Generate daily date strings
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateArray.push(new Date(d));
    }

    const result = [];

    for (const date of dateArray) {
      const formattedDate = date.toISOString().split('T')[0];
      const entry = { date: formattedDate };
      let totalDayEmission = 0;

      // Fetch emissions for each process on this date
      for (const process of processList) {
        try {
          const response = await fetch('http://localhost:8080/api/processes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              processId: process.processId,
              startDate: formattedDate,
              endDate: formattedDate
            })
          });

          const data = await response.json();
          const emission = data.totalCo2EmissionsKg || 0;

          // Store process-specific emission
          entry[process.processName] = emission;
          totalDayEmission += emission;

        } catch (err) {
          console.error(`Emission fetch failed for ${process.processName} on ${formattedDate}:`, err);
        }
      }

      entry["Total Emissions (Kg)"] = parseFloat(totalDayEmission.toFixed(2));
      result.push(entry);
    }

    // Save full array and total sum
    setHistoricalEmissions(result);

    const totalSum = result.reduce((sum, day) => sum + day["Total Emissions (Kg)"], 0);
    setTotalEmissions(parseFloat(totalSum.toFixed(2)));
  };

  fetchHistoricalEmissions();
}, [currentPlant, processList, startDate, endDate]);

const renewableBreakdownData = [
  { name: 'Wind', value: parseFloat(renewableBreakdown.wind), color: '#82ca9d' },
  { name: 'Solar', value: parseFloat(renewableBreakdown.solar), color: '#fdd835' },
  { name: 'Hydro', value: parseFloat(renewableBreakdown.hydro), color: '#4fc3f7' },
  {
    name: 'Non-Renewable',
    value: Math.max(
      parseFloat(renewableBreakdown.total > 0 ? renewableBreakdown.total : 0),
      0
    ) > 0
      ? parseFloat(renewableBreakdown.total) !== 0
        ? totalPlantEnergy - parseFloat(renewableBreakdown.total)
        : 0
      : 0,
    color: '#ef5350',
  },
];

const [processSustainabilityData, setProcessSustainabilityData] = useState([]);

useEffect(() => {
  if (!processList.length) return;

  const formatted = processList.map(proc => {
    const [wind, solar, hydro] = proc.renewableEnergyPercentage || [0, 0, 0];
    const totalRenewable = wind + solar + hydro;
    const nonRenewable = 100 - totalRenewable;

    return {
      name: proc.processName,
      wind: parseFloat(wind.toFixed(2)),
      solar: parseFloat(solar.toFixed(2)),
      hydro: parseFloat(hydro.toFixed(2)),
      nonRenewable: parseFloat(nonRenewable.toFixed(2))
    };
  });

  setProcessSustainabilityData(formatted);
}, [processList]);

const [equipmentData, setEquipmentData] = useState([]);

useEffect(() => {
  const fetchEquipmentData = async () => {
    if (!selectedProcess?.processId) return;

    try {
      const response = await fetch('http://localhost:8080/api/equipment-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processId: selectedProcess?.processId,
          startDate,
          endDate,
        }),
      });

      const data = await response.json();
      
      // Group data by equipment name
      const groupedData = data.reduce((acc, item) => {
        const equipmentName = item.equipmentName;
        
        if (!acc[equipmentName]) {
          acc[equipmentName] = {
            name: equipmentName,
            totalEnergy: 0,
            voltageSum: 0,
            currentSum: 0,
            temperatureSum: 0,
            humiditySum: 0,
            co2Sum: 0,
            count: 0
          };
        }
        
        acc[equipmentName].totalEnergy += item.energyConsumedKWh;
        acc[equipmentName].voltageSum += item.voltageAverage;
        acc[equipmentName].currentSum += item.currentAverage;
        acc[equipmentName].temperatureSum += item.temperatureAverage;
        acc[equipmentName].humiditySum += item.humidityPercentAverage;
        acc[equipmentName].co2Sum += item.co2EmissionsKgAverage;
        acc[equipmentName].count += 1;
        
        return acc;
      }, {});

      // Convert grouped data to array with calculated averages
      const processed = Object.values(groupedData).map(equipment => ({
        name: equipment.name,
        energy: equipment.totalEnergy, // Sum of all energy consumption
        voltage: Math.round(equipment.voltageSum / equipment.count), // Average voltage
        current: Math.round((equipment.currentSum / equipment.count) * 100) / 100, // Average current (2 decimal places)
        temperature: Math.round((equipment.temperatureSum / equipment.count) * 100) / 100, // Average temperature
        humidity: Math.round((equipment.humiditySum / equipment.count) * 100) / 100, // Average humidity
        co2: Math.round((equipment.co2Sum / equipment.count) * 100) / 100, // Average CO2
        icon: Bolt, // or customize based on equipment name if needed
      }));

      setEquipmentData(processed);
    } catch (error) {
      console.error('Error fetching equipment data:', error);
    }
  };

  fetchEquipmentData();
}, [selectedProcess?.processId, startDate, endDate]);

  const [plants, setPlants] = useState([]);
  const [plantNameToIdMap, setPlantNameToIdMap] = useState({});
  const [selectedPlantsForComparison, setSelectedPlantsForComparison] = useState([]);
  const [comparisonProcess, setComparisonProcess] = useState('');
  const [processesForSelectionn, setProcessesForSelectionn] = useState([]);
  const [plantComparisonData, setPlantComparisonData] = useState([]);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/plants');
        const data = await res.json();
        const nameIdMap = {};
        const plantNames = data.map(p => {
          nameIdMap[p.plantName] = p.plantId;
          return p.plantName;
        });
        setPlants(plantNames);
        setPlantNameToIdMap(nameIdMap);
      } catch (error) {
        console.error('Error fetching plants:', error);
      }
    };

    fetchPlants();
  }, []);

  useEffect(() => {
  const fetchComparisonData = async () => {
    if (selectedPlantsForComparison.length === 0 || !startDate || !endDate) {
      console.log('Missing required data for comparison');
      return;
    }

    try {
      console.log('Starting comparison data fetch...');
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      // Initialize data structure
      const newData = Array.from({ length: days }).map((_, idx) => {
        const date = new Date(start);
        date.setDate(start.getDate() + idx);
        return { date: date.toISOString().split('T')[0] };
      });

      console.log(`Fetching data for ${days} days, ${selectedPlantsForComparison.length} plants`);

      // Process each plant
      for (const plantName of selectedPlantsForComparison) {
        const plantId = plantNameToIdMap[plantName];
        
        if (!plantId) {
          console.error(`Plant ID not found for: ${plantName}`);
          continue;
        }

        console.log(`Processing plant: ${plantName} (ID: ${plantId})`);

        // Fetch processes for this plant if not already done
        if (processesForSelectionn.length === 0) {
          try {
            console.log(`Fetching processes for plant ${plantId}`);
            const processRes = await fetch(`http://localhost:8080/api/plants/${plantId}`);
            if (processRes.ok) {
              const processes = await processRes.json();
              const processNames = processes.map(p => p.processName);
              setProcessesForSelectionn(processNames);
              
              // Set default comparison process if not set
              if (!comparisonProcess && processNames.length > 0) {
                setComparisonProcess(processNames[0]);
              }
            }
          } catch (error) {
            console.error(`Error fetching processes for plant ${plantName}:`, error);
          }
        }

        // Fetch data for each date
        for (let i = 0; i < newData.length; i++) {
          const date = newData[i].date;
          
          try {
            // Fetch total plant data
            console.log(`Fetching total data for ${plantName} on ${date}`);
            const totalRes = await fetch(`http://localhost:8080/api/plants`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ plantId, startDate: date, endDate: date })
            });
            
            if (totalRes.ok) {
              const total = await totalRes.json();
              console.log(`Total data for ${plantName} on ${date}:`, total);
              
              // Ensure we have numeric values
              newData[i][`${plantName}_totalEnergy`] = Number(total.totalEnergyConsumedkWh) || 0;
              newData[i][`${plantName}_totalCO2`] = Number(total.totalEmissionsCO2) || 0;
            } else {
              console.warn(`Failed to fetch total data for ${plantName} on ${date}: ${totalRes.status}`);
              newData[i][`${plantName}_totalEnergy`] = 0;
              newData[i][`${plantName}_totalCO2`] = 0;
            }

            // Fetch process-specific data if process is selected
            if (comparisonProcess) {
              try {
                // Get process details
                const processRes = await fetch(`http://localhost:8080/api/plants/${plantId}`);
                if (processRes.ok) {
                  const processes = await processRes.json();
                  const selectedProc = processes.find(p => p.processName === comparisonProcess);
                  
                  if (selectedProc) {
                    console.log(`Fetching process data for ${plantName} - ${comparisonProcess} on ${date}`);
                    const procRes = await fetch(`http://localhost:8080/api/processes`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        processId: selectedProc.processId, 
                        startDate: date, 
                        endDate: date 
                      })
                    });
                    
                    if (procRes.ok) {
                      const procData = await procRes.json();
                      console.log(`Process data for ${plantName} - ${comparisonProcess} on ${date}:`, procData);
                      
                      // Ensure we have numeric values
                      newData[i][`${plantName}_${comparisonProcess}`] = Number(procData.totalEnergyConsumedkWh) || 0;
                      newData[i][`${plantName}_${comparisonProcess}_CO2`] = Number(procData.totalEmissionsCO2) || 0;
                    } else {
                      console.warn(`Failed to fetch process data for ${plantName} - ${comparisonProcess} on ${date}: ${procRes.status}`);
                      newData[i][`${plantName}_${comparisonProcess}`] = 0;
                      newData[i][`${plantName}_${comparisonProcess}_CO2`] = 0;
                    }
                  } else {
                    console.warn(`Process ${comparisonProcess} not found for plant ${plantName}`);
                    newData[i][`${plantName}_${comparisonProcess}`] = 0;
                    newData[i][`${plantName}_${comparisonProcess}_CO2`] = 0;
                  }
                }
              } catch (error) {
                console.error(`Error fetching process data for ${plantName} - ${comparisonProcess} on ${date}:`, error);
                newData[i][`${plantName}_${comparisonProcess}`] = 0;
                newData[i][`${plantName}_${comparisonProcess}_CO2`] = 0;
              }
            }
            
          } catch (error) {
            console.error(`Error fetching data for ${plantName} on ${date}:`, error);
            // Set default values on error
            newData[i][`${plantName}_totalEnergy`] = 0;
            newData[i][`${plantName}_totalCO2`] = 0;
            if (comparisonProcess) {
              newData[i][`${plantName}_${comparisonProcess}`] = 0;
              newData[i][`${plantName}_${comparisonProcess}_CO2`] = 0;
            }
          }
        }
      }

      console.log('Final comparison data:', newData);
      setPlantComparisonData(newData);
      
    } catch (error) {
      console.error('Error in fetchComparisonData:', error);
    }
  };

  fetchComparisonData();
}, [selectedPlantsForComparison, startDate, endDate, comparisonProcess, plantNameToIdMap]);
  const DebugInfo = () => (
  <div className="bg-gray-800 p-4 rounded mb-4 border border-gray-600">
    <h5 className="text-white mb-3 font-semibold">🐛 Debug Info:</h5>
    <div className="space-y-2">
      <p className="text-gray-300">
        <span className="text-blue-400 font-medium">Selected Plants:</span> 
        {selectedPlantsForComparison.length > 0 
          ? selectedPlantsForComparison.join(', ') 
          : '❌ None selected'
        }
      </p>
      <p className="text-gray-300">
        <span className="text-blue-400 font-medium">Date Range:</span> 
        {startDate && endDate 
          ? `${startDate} to ${endDate}` 
          : '❌ Not set'
        }
      </p>
      <p className="text-gray-300">
        <span className="text-blue-400 font-medium">Comparison Process:</span> 
        {comparisonProcess || '❌ Not selected'}
      </p>
      <p className="text-gray-300">
        <span className="text-blue-400 font-medium">Data Points:</span> 
        {plantComparisonData.length} records
      </p>
      <p className="text-gray-300">
        <span className="text-blue-400 font-medium">Available Processes:</span> 
        {processesForSelectionn.length > 0 
          ? processesForSelectionn.join(', ') 
          : '❌ None loaded'
        }
      </p>
      <p className="text-gray-300">
        <span className="text-blue-400 font-medium">Plant Name-ID Map:</span> 
        {Object.keys(plantNameToIdMap).length} plants mapped
      </p>
      {plantComparisonData.length > 0 && (
        <details className="mt-3">
          <summary className="text-yellow-400 cursor-pointer font-medium">
            📊 Sample Data (click to expand)
          </summary>
          <pre className="text-xs text-gray-400 mt-2 overflow-auto max-h-32 bg-gray-900 p-2 rounded">
            {JSON.stringify(plantComparisonData.slice(0, 2), null, 2)}
          </pre>
        </details>
      )}
    </div>
  </div>
);

  const [liveStartDate, setLiveStartDate] = useState(formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
  const [liveEndDate, setLiveEndDate] = useState(formatDate(new Date()));
  
  // State for date ranges
  
  const [livePeriod, setLivePeriod] = useState('1W');
  // New state for Graph section
  const [graphView, setGraphView] = useState('Energy Trends per Process');
  
  // Generic handler for period changes
  
  const subNavItems = [
        { name: 'Live', icon: Activity },
        { name: 'Trends', icon: BarChart3 },
        { name: 'Emissions', icon: Cloud },
        // { name: 'Comparison', icon: Building2 },
        { name: 'Cost Analysis', icon: DollarSign }, // Add the new sub-tab
    ];
  
  const activeSubNavStyle = {
    backgroundColor: TM_RED,
    color: TM_WHITE,
  };
  const inactiveSubNavStyle = {
    color: TM_RED,
  };


  return (
    <div className="p-6 min-h-screen" style={{backgroundColor: TM_LIGHT_GRAY_BG, color: TM_GRAY_TEXT}}>
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Side Navigation */}
            <aside className="lg:w-56 flex-shrink-0 bg-white p-4 rounded-xl self-start sticky top-16 border border-gray-200">
                <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto">
                    {subNavItems.map(item => (
                        <button
                            key={item.name}
                            onClick={() => setActiveSubTab(item.name)}
                            style={activeSubTab === item.name ? activeSubNavStyle : inactiveSubNavStyle}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 whitespace-nowrap 
                              ${activeSubTab === item.name ? 'shadow-md' : 'hover:bg-gray-100'}`}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>
                <div className="flex flex-wrap justify-between items-center gap-8 mt-12">
                     {/* <h2 className="text-2xl font-bold" style={{color: TM_DARK_BLUE}}>{activeSubTab} Dashboard</h2> */}
                     <DateRangePicker 
                        startDate={startDate}
                        endDate={endDate}
                        period={period}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        onPeriodChange={handlePeriodChange}
                    />
                </div>
            </aside>
            
            {/* Main Content Area */}
            <div className="flex-grow flex flex-col gap-6">
                {/* Content Header */}
                

                <main>
                    {activeSubTab === 'Live' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/*Overall Plant Status */}
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col">
                                <div className="mb-6">
                                  <h3 className="text-xl font-semibold mb-2 flex items-center" style={{color: TM_DARK_BLUE}}><Zap className="mr-2 text-yellow-500" />Overall Plant Status</h3>
                                  <p className="text-5xl font-bold mb-2" style={{color: TM_DARK_BLUE}}>{totalPlantEnergy.toFixed(2)} <span className="text-3xl" style={{color: TM_GRAY_TEXT}}>kWh</span></p>
                                  <p className="text-sm" style={{color: TM_GRAY_TEXT}}>Total Energy Consumption for selected period</p>
                                </div>
                                
                                <div className="mb-6">
                                    <p className="text-lg font-semibold mb-2" style={{color: TM_DARK_BLUE}}>Energy Mix</p>
                                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                                        <div className="bg-green-500 h-4 rounded-full" style={{ width: `${((100*(renewableBreakdown.total)/totalPlantEnergy)).toFixed(2)}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <p className="text-green-600">Renewable: {(100*(renewableBreakdown.total)/totalPlantEnergy).toFixed(2)}% ({renewableBreakdown.total} kWh)</p>
                                        <p className="text-orange-600">Non-Renewable: {(100- (100*(renewableBreakdown.total)/totalPlantEnergy)).toFixed(2)}% ({(totalPlantEnergy-renewableBreakdown.total).toFixed(2)} kWh)</p>
                                    </div>
                                </div>  
                                
                                <div className="flex-grow space-y-4">
                                  <div>
                                      <p className="text-lg font-semibold mb-2" style={{color: TM_DARK_BLUE}}>Renewable Sources</p>
                                      <div className="space-y-2" style={{color: TM_GRAY_TEXT}}>
                                          <div className="flex justify-between items-center"><span className="flex items-center"><Wind className="w-4 h-4 mr-2 text-blue-500"/>Wind</span> <span className="font-bold" style={{color: TM_DARK_BLUE}}>{renewableBreakdown.wind} kWh</span></div>
                                          <div className="flex justify-between items-center"><span className="flex items-center"><Lightbulb className="w-4 h-4 mr-2 text-yellow-500"/>Solar</span> <span className="font-bold" style={{color: TM_DARK_BLUE}}>{renewableBreakdown.solar} kWh</span></div>
                                          <div className="flex justify-between items-center"><span className="flex items-center"><Droplet className="w-4 h-4 mr-2 text-teal-500"/>Hydro</span> <span className="font-bold" style={{color: TM_DARK_BLUE}}>{renewableBreakdown.hydro} kWh</span></div>
                                      </div>
                                  </div>
                                  <div>
                                      <p className="text-lg font-semibold mb-2" style={{color: TM_DARK_BLUE}}>CO₂ Emission</p>
                                      <p className="text-2xl font-bold" style={{color: TM_DARK_BLUE}}>{totalEmissions} <span className="text-lg" style={{color: TM_GRAY_TEXT}}>kg CO₂e</span></p>
                                  </div>
                                </div>
                            </div>
                            
                            {/* Process Details */}
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold mb-2 flex items-center" style={{color: TM_DARK_BLUE}}><Zap className="mr-2 text-yellow-500" />Processes Status</h3>
                                      <Dropdown
                                          label="Select Process"
                                          options={(processList.map(process => process.processName))}
                                          selected={selectedProcess?.processName || ''}
                                          onChange={(processName) => {
                                              const selected = processList.find(p => p.processName === processName);
                                              setSelectedProcess(selected);
                                          }}
                                      />
                                  </div>
                                  <p className="text-5xl font-bold mb-2" style={{color: TM_DARK_BLUE}}>{processEnergy.toFixed(2)} <span className="text-3xl" style={{color: TM_GRAY_TEXT}}>kWh</span></p>
                                  <p className="text-sm" style={{color: TM_GRAY_TEXT}}>Total Energy Consumption for {selectedProcess?.processName}</p>
                                </div>
                        
                                <div className="mb-6">
                                    <p className="text-lg font-semibold mb-2" style={{color: TM_DARK_BLUE}}>{selectedProcess?.processName} Energy Mix</p>
                                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                                        <div className="bg-green-500 h-4 rounded-full" style={{ width: `${(totalRenewable).toFixed(2)}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <p className="text-green-600">Renewable: {(totalRenewable).toFixed(2)}% ({renewableBreakdown.total} kWh)</p>
                                        <p className="text-orange-600">Non-Renewable: {(nonRenewable).toFixed(2)}% ({(totalPlantEnergy-renewableBreakdown.total).toFixed(2)} kWh)</p>
                                    </div>
                                </div> 
                                
                                <div className="flex-grow flex flex-col">
                                    <h4 className="text-lg font-semibold mb-2" style={{color: TM_DARK_BLUE}}>Equipment Load</h4>
                                    <div className="flex-grow overflow-y-auto pr-2" style={{ maxHeight: '200px' }}>
                                        <ul className="space-y-3">
                                            {equipmentData
                                            .filter((equip, index, self) => 
                                              index === self.findIndex(e => e.name === equip.name)
                                            )
                                            .map((equip, index) => (
                                              <li key={`${equip.name}-${equip.voltage}-${equip.current}`} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                  <div className="flex items-center justify-between mb-2">
                                                      <span className="font-semibold" style={{color: TM_DARK_BLUE}}>{equip.name}</span>
                                                      <span className="font-bold text-xl" style={{color: TM_DARK_BLUE}}>
                                                        {equip.energy.toFixed(2)} <span className="text-sm font-normal" style={{color: TM_GRAY_TEXT}}>kWh</span>
                                                      </span>
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-2 text-xs px-1" style={{color: TM_GRAY_TEXT}}>
                                                      <span className="flex items-center">
                                                        <Bolt className="h-3 w-3 mr-1 text-yellow-500" />
                                                        {equip.voltage} V
                                                      </span>
                                                      <span className="flex items-center justify-end">
                                                        <Thermometer className="h-3 w-3 mr-1 text-orange-500" />
                                                        {equip.temperature}°C
                                                      </span>
                                                      <span className="flex items-center">
                                                        <Sigma className="h-3 w-3 mr-1 text-red-500" />
                                                        {equip.current} A
                                                      </span>
                                                      <span className="flex items-center justify-end">
                                                        <Droplets className="h-3 w-3 mr-1 text-blue-500" />
                                                        {equip.humidity}%
                                                      </span>
                                                      
                                                
                                                      
                                                  </div>
                                              </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'Trends' && (
                        <div className="space-y-6">
                            <SectionCard title="Historical Trends">
                               <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-4">
                                    <Dropdown
                                        label="Graph Type"
                                        options={['Energy Trends per Process', 'Daily Total Consumption by Process']}
                                        selected={graphView}
                                        onChange={setGraphView}
                                    />
                                    {graphView === 'Energy Trends per Process' && (
                                        <Dropdown
                                            label="Visible Lines"
                                            options={trendLineOptions}
                                            selected={visibleTrendLines}
                                            onChange={setVisibleTrendLines}
                                            isMulti={true}
                                        />
                                    )}
                                    
                               </div>
                               {graphView === 'Energy Trends per Process' ? (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 30, bottom: 25 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY} />
                                        <XAxis dataKey="date" dy={10} stroke={TM_GRAY_TEXT} />
                                        <YAxis dx={-10} label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: TM_GRAY_TEXT }} stroke={TM_GRAY_TEXT} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        {visibleTrendLines.map((line, index) => (
                                            <Line key={line} type="monotone" dataKey={line} stroke={COLORS[index % COLORS.length]} dot={false} strokeWidth={line === 'Total Energy' ? 3 : 2}/>
                                        ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                               ) : (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={historicalData} margin={{ top: 5, right: 30, left: 30, bottom: 25 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY} />
                                        <XAxis dataKey="date" dy={10} stroke={TM_GRAY_TEXT} />
                                        <YAxis dx={-10} label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: TM_GRAY_TEXT }} stroke={TM_GRAY_TEXT}/>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        {processList.map((proc, index) => (
                                          <Bar
                                            key={proc.processId}
                                            dataKey={proc.processName}
                                            stackId="a"
                                            fill={COLORS[index % COLORS.length]}
                                          />
                                        ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                               )}
                            </SectionCard>
                            <SectionCard title="Monthly Consumption Summary (kWh)">
                              <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg">
                                  <thead>
                                    <tr className="bg-gray-100 text-left text-sm font-medium uppercase tracking-wider" style={{color: TM_GRAY_TEXT}}>
                                      <th className="px-4 py-3 rounded-tl-lg">Month</th>
                                      {processesForSelection.map(system => (<th key={system} className="px-4 py-3">{system}</th>))}
                                      <th className="px-4 py-3 rounded-tr-lg">Total Energy (kWh)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {monthlySummary.map((data, index) => (
                                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-4 py-3 whitespace-nowrap" style={{color: TM_GRAY_TEXT}}>{data.month}</td>
                                        {processesForSelection.map(system => {
                                          const value = data[system];
                                          return ( <td key={system} className="px-4 py-3 whitespace-nowrap">{value.toFixed(2)}</td>);
                                        })}
                                        <td className="px-4 py-3 whitespace-nowrap font-bold" style={{color: TM_DARK_BLUE}}>{data['Total Energy (kWh)'].toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </SectionCard>
                        </div>
                    )}

                    {activeSubTab === 'Emissions' && (
                        <div className="space-y-6">
                            
                          <SectionCard title="CO₂ Emissions Analysis">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <StatCard title="Total Plant Emissions (CO₂e)" value={totalEmissions} unit=" kg" color="#10B981" icon={Cloud} />
                                <StatCard title="Emission Intensity" value={(totalEmissions/totalPlantEnergy).toFixed(2)} unit=" kg CO₂e/kWh" color="#F59E0B" icon={Zap} />
                            </div>
                            {/* <p className="text-sm text-gray-400 mb-6 -mt-4 italic">Note: Benchmark target: {benchmark} kg CO₂e/kWh.</p> */}
                            <h4 className="text-lg font-semibold mt-6 mb-2" style={{color: TM_DARK_BLUE}}>Daily CO₂ Emissions Trend (kg CO₂e)</h4>
                              <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={historicalEmissions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY} />
                                  <XAxis dataKey="date" stroke={TM_GRAY_TEXT} />
                                  <YAxis stroke={TM_GRAY_TEXT} />
                                  <Tooltip content={<CustomTooltip unit="kg CO₂e" />} />
                                  <Legend wrapperStyle={{ color: TM_GRAY_TEXT }} />
                                  <Line
                                    type="monotone"
                                    dataKey="Total Emissions (Kg)"
                                    stroke={TM_RED}
                                    name="Total Emissions"
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            <h4 className="text-lg font-semibold mb-2" style={{color: TM_DARK_BLUE}}>Process-Wise Emissions (kg CO₂e)</h4>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={historicalEmissions} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY} />
                                  <XAxis dataKey="date" stroke={TM_GRAY_TEXT} />
                                  <YAxis stroke={TM_GRAY_TEXT} />
                                  <Tooltip content={<CustomTooltip unit="kg CO₂e" />} />
                                  <Legend />
                                  {processList.map((proc, index) => (
                                    <Bar
                                      key={proc.processId}
                                      dataKey={proc.processName}
                                      stackId="a"
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </BarChart>
                              </ResponsiveContainer>

                            
                          </SectionCard>
                          <SectionCard title="Overall Renewable vs Non-Renewable Energy Mix">
                                <ResponsiveContainer width="100%" height={400}>
                                  <PieChart>
                                    <Pie
                                      data={renewableBreakdownData}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={true}
                                      label={({ name, percent, value }) =>
                                        `${name}: ${value.toFixed(0)} kWh (${(percent * 100).toFixed(0)}%)`
                                      }
                                      outerRadius={150}
                                      fill="#8884d8"
                                      dataKey="value"
                                    >
                                      {renewableBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${value.toFixed(2)} kWh`, name]} />
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
                              </SectionCard>

                            <SectionCard title="Process-wise Sustainability Analysis">
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart 
                                  data={processSustainabilityData} 
                                  layout="vertical" 
                                  margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                  <XAxis type="number" unit="%" stroke={TM_GRAY_TEXT}/>
                                  <YAxis type="category" dataKey="name" width={150} stroke={TM_GRAY_TEXT}/>
                                  <Tooltip content={<CustomTooltip unit="%" />} />
                                  <Legend />
                                  <Bar dataKey="wind" stackId="a" fill="#87CEEB" name="Wind" />
                                  <Bar dataKey="solar" stackId="a" fill="#FFD700" name="Solar" />
                                  <Bar dataKey="hydro" stackId="a" fill="#4682B4" name="Hydro" />
                                  <Bar dataKey="nonRenewable" stackId="a" fill="#FF8042" name="Non-Renewable" />
                                </BarChart>
                              </ResponsiveContainer>
                            </SectionCard>

                        </div>
                    )}

                    {/* {activeSubTab === 'Comparison' && (
                      <div className="space-y-6">
                            <SectionCard title="Plants Comparison">
                              <div className="flex flex-col space-y-4 mb-4">
                                <Dropdown label="Plants for Comparison" options={plants} selected={selectedPlantsForComparison} onChange={setSelectedPlantsForComparison} isMulti={true} />
                              </div>
                               <DebugInfo />
                              <h4 className="text-lg font-semibold mb-2" style={{color: TM_DARK_BLUE}}>Total Energy Consumption Comparison</h4>
                              <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={plantComparisonData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY} />
                                  <XAxis dataKey="date" stroke={TM_GRAY_TEXT}/>
                                  <YAxis dx={-10} label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: TM_GRAY_TEXT }} stroke={TM_GRAY_TEXT}/>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                  {selectedPlantsForComparison.map((plant, index) => (
                                    <Line key={plant} type="monotone" dataKey={`${plant}_totalEnergy`} name={plant} stroke={COLORS[index % COLORS.length]} dot={false} />
                                  ))}
                                </LineChart>
                              </ResponsiveContainer>

                                    
                              <h4 className="text-lg font-semibold mb-2" style={{color: TM_DARK_BLUE}}>Total CO₂ Emissions Comparison</h4>
                              <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={plantComparisonData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY} />
                                  <XAxis dataKey="date" stroke={TM_GRAY_TEXT} />
                                  <YAxis dx={-10} label={{ value: 'CO₂ (kg)', angle: -90, position: 'insideLeft', fill: TM_GRAY_TEXT }} stroke={TM_GRAY_TEXT} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                  {selectedPlantsForComparison.map((plant, index) => (
                                    <Line key={plant} type="monotone" dataKey={`${plant}_totalCO2`} name={`${plant} CO₂`} stroke={COLORS[(index + 1) % COLORS.length]} dot={false} />
                                  ))}
                                </LineChart>
                              </ResponsiveContainer>
                              <h4 className="text-lg font-semibold mt-6 mb-2" style={{color: TM_DARK_BLUE}}>Process-wise Energy Consumption</h4>
                              <Dropdown label="Select Process" options={processesForSelectionn} selected={comparisonProcess} onChange={setComparisonProcess} />
                              <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={plantComparisonData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY} />
                                  <XAxis dataKey="date" stroke={TM_GRAY_TEXT}/>
                                  <YAxis dx={-10} label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: TM_GRAY_TEXT }} stroke={TM_GRAY_TEXT} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                  {selectedPlantsForComparison.map((plant, index) => (
                                    <Line key={plant} type="monotone" dataKey={`${plant}_${comparisonProcess}`} name={plant} stroke={COLORS[index % COLORS.length]} dot={false} />
                                  ))}
                                </LineChart>
                              </ResponsiveContainer> 
                              <h4 className="text-lg font-semibold mt-6 mb-2" style={{color: TM_DARK_BLUE}}>Process-wise CO₂ Emissions</h4>
                              <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={plantComparisonData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY} />
                                  <XAxis dataKey="date" stroke={TM_GRAY_TEXT} />
                                  <YAxis dx={-10} label={{ value: 'CO₂ (kg)', angle: -90, position: 'insideLeft', fill: TM_GRAY_TEXT }} stroke={TM_GRAY_TEXT} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                  {selectedPlantsForComparison.map((plant, index) => (
                                    <Line key={plant} type="monotone" dataKey={`${plant}_${comparisonProcess}_CO2`} name={`${plant} ${comparisonProcess} CO₂`} stroke={COLORS[(index + 2) % COLORS.length]} dot={false} />
                                  ))}
                                </LineChart>
                              </ResponsiveContainer>
                            </SectionCard>
                      </div>
                    )} */}
                    {/* Render the new Cost Analysis tab */}
                        {activeSubTab === 'Cost Analysis' && (
                            <CostAnalysisSubTab
                                currentPlant={currentPlant}
                                totalPlantEnergy={totalPlantEnergy}
                                renewableBreakdown={renewableBreakdown}
                                processList={processList}
                                historicalData={historicalData}
                            />
                        )}
                </main>
            </div>
        </div>
    </div>
  );
};
const AlertAndAnomalyContent = () => {
    const [alerts, setAlerts] = useState(generateAlerts(20));
    const [filter, setFilter] = useState('All'); // All, Critical, Warning, Info
    const [searchTerm, setSearchTerm] = useState('');

    const updateAlertStatus = (id, newStatus) => {
        setAlerts(prevAlerts => {
            const updatedAlerts = prevAlerts.map(alert => 
                alert.id === id ? { ...alert, status: newStatus } : alert
            );
            // Re-sort after status update
            return updatedAlerts.sort((a, b) => {
                if (a.status === 'New' && b.status !== 'New') return -1;
                if (a.status !== 'New' && b.status === 'New') return 1;
                return b.timestamp - a.timestamp;
            });
        });
    };

    const filteredAlerts = alerts
        .filter(alert => filter === 'All' || alert.severity === filter)
        .filter(alert =>
            alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.affectedProcess.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'Critical': return { icon: AlertTriangle, color: 'text-red-600', borderColor: 'border-red-500', bgColor: 'bg-red-50' };
            case 'Warning': return { icon: AlertTriangle, color: 'text-yellow-600', borderColor: 'border-yellow-500', bgColor: 'bg-yellow-50' };
            case 'Info':
            default: return { icon: Info, color: 'text-blue-600', borderColor: 'border-blue-500', bgColor: 'bg-blue-50' };
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-600 text-white';
            case 'Acknowledged': return 'bg-yellow-500 text-white';
            case 'Resolved': return 'bg-green-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    }

    const alertCounts = {
        Critical: alerts.filter(a => a.severity === 'Critical' && a.status === 'New').length,
        Warning: alerts.filter(a => a.severity === 'Warning' && a.status === 'New').length,
        Info: alerts.filter(a => a.severity === 'Info' && a.status === 'New').length,
    }

    return (
        <div className="space-y-6">
            <SectionCard title="Active Alerts Summary">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="New Critical Alerts" value={alertCounts.Critical} color="#ED1C24" icon={AlertTriangle} />
                        <StatCard title="New Warning Alerts" value={alertCounts.Warning} color="#F59E0B" icon={AlertTriangle} />
                        <StatCard title="New Info Alerts" value={alertCounts.Info} color="#00A3E0" icon={Info} />
                </div>
            </SectionCard>

            <SectionCard title="Alerts Feed">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                            {['All', 'Critical', 'Warning', 'Info'].map(f => (
                                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === f ? 'text-white shadow-md' : 'bg-transparent hover:bg-gray-200'}`} style={filter === f ? {backgroundColor: TM_RED, color: TM_WHITE} : {color: TM_GRAY_TEXT}}>{f}</button>
                            ))}
                        </div>
                    <div className="relative w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Search alerts by description or process..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            style={{color: TM_DARK_BLUE}}
                        />
                    </div>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                    {filteredAlerts.length > 0 ? filteredAlerts.map(alert => {
                        const { icon: Icon, color, borderColor, bgColor } = getSeverityStyles(alert.severity);
                        return (
                            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${borderColor} ${bgColor} shadow-sm transition-all duration-300`}>
                                <div className="flex flex-col md:flex-row justify-between items-start">
                                    <div className="flex-grow">
                                        <div className="flex items-center mb-2 flex-wrap">
                                            <Icon className={`h-6 w-6 mr-3 ${color}`} />
                                            <span className={`font-semibold text-lg ${color}`}>{alert.severity} - {alert.affectedProcess}</span>
                                            <span className={`ml-4 text-xs font-semibold px-2 py-1 rounded-full ${getStatusStyles(alert.status)}`}>{alert.status}</span>
                                        </div>
                                        <p style={{color: TM_GRAY_TEXT}} className="mb-2">{alert.description}</p>
                                        <div className="text-xs text-gray-500 flex items-center space-x-4">
                                            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1"/>{new Date(alert.timestamp).toLocaleString()}</span>
                                            <span className="flex items-center"><SlidersHorizontal className="h-4 w-4 mr-1"/>{alert.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 mt-3 md:mt-0 md:ml-4 flex items-center space-x-2">
                                         {alert.status === 'New' && <button onClick={() => updateAlertStatus(alert.id, 'Acknowledged')} className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition">Acknowledge</button>}
                                         {alert.status === 'Acknowledged' && <button onClick={() => updateAlertStatus(alert.id, 'Resolved')} className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition">Mark as Resolved</button>}
                                    </div>
                                </div>
                                {alert.status !== 'Resolved' && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <h4 className="text-sm font-semibold mb-1 flex items-center" style={{color: TM_DARK_BLUE}}><Lightbulb className="h-4 w-4 mr-2 text-green-500"/>Recommended Action</h4>
                                        <p className="text-sm" style={{color: TM_GRAY_TEXT}}>{alert.recommendation}</p>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="text-center py-8 text-gray-500">
                            <BellRing className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-lg font-semibold">No Alerts Found</p>
                            <p className="text-sm">There are no alerts that match your current filter criteria.</p>
                        </div>
                    )}
                </div>
            </SectionCard>
        </div>
    );
};
// Forecasting Tab Content - REBUILT
const ForecastingTab = ({ currentPlant }) => {
  const [activeSubTab, setActiveSubTab] = useState('Forecast');
    const plantId = currentPlant?.plantId;
    const [processList, setProcessList] = useState([]);
    const [selectedProcess, setSelectedProcess] = useState(null);
    
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [period, setPeriod] = useState('1D');

    const [equipmentData, setEquipmentData] = useState([]);
    const [processEnergyTotals, setProcessEnergyTotals] = useState({});
    const [totalPlantEnergy, setTotalPlantEnergy] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // State to hold the breakdown of forecasted energy by source
    const [forecastedBreakdown, setForecastedBreakdown] = useState({
        wind: 0,
        solar: 0,
        hydro: 0,
        grid: 0,
        totalRenewable: 0,
    });

    const formatDate = (date) => date.toISOString().split('T')[0];

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        const today = new Date();
        let newEndDate;
        switch(newPeriod) {
            case '1D':
                newEndDate = new Date(today);
                newEndDate.setDate(today.getDate() + 1);
                setStartDate(formatDate(today));
                setEndDate(formatDate(newEndDate));
                break;
            case '1W':
                newEndDate = new Date(today);
                newEndDate.setDate(today.getDate() + 7);
                setStartDate(formatDate(today));
                setEndDate(formatDate(newEndDate));
                break;
            case '1M':
                newEndDate = new Date(today);
                newEndDate.setMonth(today.getMonth() + 1);
                setStartDate(formatDate(today));
                setEndDate(formatDate(newEndDate));
                break;
            case 'Custom':
                // Custom dates are set manually, no change here
                return;
        }
    };

    useEffect(() => {
        if (!currentPlant?.plantId) return;
        fetch(`http://localhost:8080/api/plants/${plantId}`)
            .then(res => res.json())
            .then(data => {
                setProcessList(data);
                if (data.length > 0) {
                    setSelectedProcess(data[0]);
                }
            })
            .catch(err => console.error("Failed to fetch processes", err));
    }, [currentPlant]);

    const fetchAllProcessEnergies = useCallback(async () => {
    if (!processList || processList.length === 0) return;

    setLoading(true);
    const processEnergies = {};
    let plantTotal = 0;
    
    let totalWind = 0, totalSolar = 0, totalHydro = 0;

    for (const process of processList) {
        const response = await fetch(`http://localhost:8080/api/equipment-readings/forecasted`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ processId: process.processId, startDate, endDate })
        });
        const equipmentList = await response.json();
        
        // Aggregate equipment data by equipmentName
        const equipmentMap = {};
        
        equipmentList.forEach(equipment => {
          const { equipmentName } = equipment;
          
          if (!equipmentMap[equipmentName]) {
              equipmentMap[equipmentName] = {
                  equipmentName,
                  processId: equipment.processId,
                  energyConsumedKWh: 0,
                  currentSum: 0,
                  voltageSum: 0,
                  temperatureSum: 0,
                  humiditySum: 0,
                  co2EmissionsSum: 0,
                  count: 0
              };
          }
          
          // Sum energy and other values for averaging
          equipmentMap[equipmentName].energyConsumedKWh += equipment.energyConsumedKWh || 0;
          equipmentMap[equipmentName].currentSum += equipment.currentAverage || 0;
          equipmentMap[equipmentName].voltageSum += equipment.voltageAverage || 0;
          equipmentMap[equipmentName].temperatureSum += equipment.temperatureAverage || 0;
          equipmentMap[equipmentName].humiditySum += equipment.humidityPercentAverage || 0;
          equipmentMap[equipmentName].co2EmissionsSum += equipment.co2EmissionsKgAverage || 0;
          equipmentMap[equipmentName].count++;
      });

      // Convert to final format with averages
      const aggregatedEquipmentList = Object.values(equipmentMap).map(eq => ({
          equipmentName: eq.equipmentName,
          processId: eq.processId,
          energyConsumedKWh: eq.energyConsumedKWh, // Total energy across all dates
          currentAverage: eq.count > 0 ? eq.currentSum / eq.count : 0,
          voltageAverage: eq.count > 0 ? eq.voltageSum / eq.count : 0,
          temperatureAverage: eq.count > 0 ? eq.temperatureSum / eq.count : 0,
          humidityPercentAverage: eq.count > 0 ? eq.humiditySum / eq.count : 0,
          co2EmissionsKgAverage: eq.count > 0 ? eq.co2EmissionsSum / eq.count : 0,
      }));
        
        console.log('Equipment List for process:', process.processName, aggregatedEquipmentList);
        
        // Calculate total energy for this process
        const processEnergy = aggregatedEquipmentList.reduce((total, eq) => total + (eq.energyConsumedKWh || 0), 0);
        
        const [windPct = 0, solarPct = 0, hydroPct = 0] = process.renewableEnergyPercentage || [];
        
        totalWind += processEnergy * (windPct / 100);
        totalSolar += processEnergy * (solarPct / 100);
        totalHydro += processEnergy * (hydroPct / 100);

        processEnergies[process.processId] = {
            processName: process.processName,
            totalEnergy: processEnergy,
            equipmentData: aggregatedEquipmentList,
        };
        plantTotal += processEnergy;
    }

    const totalRenewable = totalWind + totalSolar + totalHydro;
    const totalGrid = Math.max(0, plantTotal - totalRenewable);

    setProcessEnergyTotals(processEnergies);
    setTotalPlantEnergy(plantTotal);
    setForecastedBreakdown({
        wind: totalWind,
        solar: totalSolar,
        hydro: totalHydro,
        grid: totalGrid,
        totalRenewable: totalRenewable,
    });

    // Aggregate equipment data across all processes for the selected process
    if (selectedProcess && processEnergies[selectedProcess.processId]) {
        const selectedEquipmentData = processEnergies[selectedProcess.processId].equipmentData;
        console.log('Setting equipment data for selected process:', selectedProcess.processName, selectedEquipmentData);
        setEquipmentData(selectedEquipmentData);
    } else if (selectedProcess === null && Object.keys(processEnergies).length > 0) {
        // If no specific process is selected, show all equipment
        const allEquipmentData = [];
        Object.values(processEnergies).forEach(process => {
            allEquipmentData.push(...process.equipmentData);
        });
        console.log('Setting all equipment data:', allEquipmentData);
        setEquipmentData(allEquipmentData);
    }
    setLoading(false);
}, [processList, startDate, endDate, selectedProcess]);

    useEffect(() => {
        fetchAllProcessEnergies();
    }, [fetchAllProcessEnergies]);
    
    const getSelectedProcessEnergy = () => {
        if (!selectedProcess || !processEnergyTotals[selectedProcess.processId]) return 0;
        return processEnergyTotals[selectedProcess.processId].totalEnergy;
    };

    // --- Cost Calculation Logic ---
    const location = currentPlant?.city;
    const costs = location ? COST_DATA[location] : null;
    let totalCost = 0, costFromGrid = 0, costFromRenewables = 0, avgCostPerKwh = 0, currencySymbol = '$';
    
    if (costs) {
        currencySymbol = costs.currencySymbol;
        costFromGrid = forecastedBreakdown.grid * costs.grid;
        const costFromWind = forecastedBreakdown.wind * costs.wind;
        const costFromSolar = forecastedBreakdown.solar * costs.solar;
        const costFromHydro = forecastedBreakdown.hydro * costs.hydro;
        costFromRenewables = costFromWind + costFromSolar + costFromHydro;
        totalCost = costFromGrid + costFromRenewables;
        avgCostPerKwh = totalPlantEnergy > 0 ? totalCost / totalPlantEnergy : 0;
    }
    
    const formatCurrency = (value) => {
        if (!costs) return value;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: costs.currency,
            minimumFractionDigits: 2,
        }).format(value);
    };
    const forecastCostBreakdownData = costs ? [
        { name: 'Utility Supply', cost: parseFloat(costFromGrid.toFixed(2)), fill: '#ef5350' },
        { name: 'Wind', cost: parseFloat((forecastedBreakdown.wind * costs.wind).toFixed(2)), fill: '#82ca9d' },
        { name: 'Solar', cost: parseFloat((forecastedBreakdown.solar * costs.solar).toFixed(2)), fill: '#fdd835' },
        { name: 'Hydro', cost: parseFloat((forecastedBreakdown.hydro * costs.hydro).toFixed(2)), fill: '#4fc3f7' },
    ] : [];

    const allProcessOptions = processes.filter(p => p !== 'Overall Plant');
    // State for the point-in-time forecast
    const [forecastDateTime, setForecastDateTime] = useState(getLocalDateTimeString(new Date(Date.now() + 24 * 60 * 60 * 1000))); // Default to 24h ahead
    const [pointInTimeForecastData, setPointInTimeForecastData] = useState(generatePointInTimeForecast());
    const [selectedForecastProcess, setSelectedForecastProcess] = useState('Paint');

    // State for KPIs with their own date ranges
    const [peakDemandStartDate, setPeakDemandStartDate] = useState(formatDate(new Date()));
    const [peakDemandEndDate, setPeakDemandEndDate] = useState(formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)));
    const [emissionsStartDate, setEmissionsStartDate] = useState(formatDate(new Date()));
    const [emissionsEndDate, setEmissionsEndDate] = useState(formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
    
    // KPIs and other data
    const [kpiData, setKpiData] = useState({ peakDemand: 1850.55, totalConsumption: 32050.10, forecastedEmissions: 12500.75, mape: 4.21 });
    // const [weatherConditions, setWeatherConditions] = useState(generateWeatherConditions());
    const [graphStartTime, setGraphStartTime] = useState(getLocalDateTimeString(new Date()));
    const [graphEndTime, setGraphEndTime] = useState(getLocalDateTimeString(new Date(new Date().getTime() + 24 * 60 * 60 * 1000)));
    const [forecastDataAll, setForecastDataAll] = useState([]);

    // Update point-in-time forecast when date/time or plant changes
    // useEffect(() => {
    //     setPointInTimeForecastData(generatePointInTimeForecast());
    //     setWeatherConditions(generateWeatherConditions());
    // }, [forecastDateTime, currentPlant]);
    
    // Update KPIs when their date ranges change
    useEffect(() => {
       // In a real app, you'd fetch/recalculate KPIs based on the new date ranges.
       // Here, we just simulate a change.
       setKpiData(prev => ({
           ...prev,
           peakDemand: parseFloat((1800 + Math.random() * 200).toFixed(2)),
       }));
    }, [peakDemandStartDate, peakDemandEndDate]);
    
    useEffect(() => {
        setKpiData(prev => ({
            ...prev,
            forecastedEmissions: parseFloat((12000 + Math.random() * 1000).toFixed(2)),
        }));
    }, [emissionsStartDate, emissionsEndDate]);

    useEffect(() => {
        const fullForecast = generateForecastData(new Date(), new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), allProcessOptions);
        setForecastDataAll(fullForecast.data);
    }, [currentPlant]);


    const forecastSubNavItems = [
      { name: 'Forecast', icon: TrendingUp },
      // { name: 'Graphs', icon: BarChart3 },
      { name: 'Alert & Anomaly', icon: BellRing },
      {name: 'Scenario Planner', icon: SlidersHorizontal },
      
    ];
    
    const activeSubNavStyle = {
      backgroundColor: TM_RED,
      color: TM_WHITE,
    };
    const inactiveSubNavStyle = {
      color: TM_RED,
    };
    
    // const { totalPlantEnergy, renewable, nonRenewable } = pointInTimeForecastData;
    // const totalEnergySource = renewable + nonRenewable;
    // const plantRenewablePercent = totalEnergySource > 0 ? ((renewable / totalEnergySource) * 100).toFixed(1) : 0;
    // const plantNonRenewablePercent = totalEnergySource > 0 ? ((nonRenewable / totalEnergySource) * 100).toFixed(1) : 0;

    // const selectedProcessKey = selectedForecastProcess.toLowerCase().replace(/ /g, '');
    // const selectedProcessData = pointInTimeForecastData[selectedProcessKey];

    // let processRenewablePercent = 0;
    // let processNonRenewablePercent = 0;
    // if(selectedProcessData) {
    //     const processTotalSource = selectedProcessData.renewable + selectedProcessData.nonRenewable;
    //     processRenewablePercent = processTotalSource > 0 ? ((selectedProcessData.renewable / processTotalSource) * 100).toFixed(1) : 0;
    //     processNonRenewablePercent = processTotalSource > 0 ? ((selectedProcessData.nonRenewable / processTotalSource) * 100).toFixed(1) : 0;
    // }

    return (
        <div className="p-6 min-h-screen" style={{backgroundColor: TM_LIGHT_GRAY_BG, color: TM_GRAY_TEXT}}>
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
            <aside className="lg:w-56 flex-shrink-0 bg-white p-4 rounded-xl self-start sticky top-24 border border-gray-200">
                <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto">
                    {forecastSubNavItems.map(item => (
                        <button key={item.name} onClick={() => setActiveSubTab(item.name)} 
                            style={activeSubTab === item.name ? activeSubNavStyle : inactiveSubNavStyle}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 whitespace-nowrap ${ activeSubTab === item.name ? 'shadow-md' : 'hover:bg-gray-100' }`}>
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>
                <div className="flex flex-wrap justify-between items-center gap-8 mt-12">
                     <DateRangePicker 
                        startDate={startDate}
                        endDate={endDate}
                        period={period}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        onPeriodChange={handlePeriodChange}
                    />
                </div>
            </aside>

            <main className="flex-grow flex flex-col gap-6">
                {activeSubTab === 'Forecast' && (
                    <>
                        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
                            {/* --- MODIFIED: Overall Plant Status Card --- */}
                            <SectionCard className="lg:w-1/2">
                                {/* Top part for Energy */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 flex items-center" style={{color: TM_DARK_BLUE}}><Zap className="mr-2 text-yellow-500" />Overall Plant Status</h3>
                                    <p className="text-5xl font-bold mb-2" style={{color: TM_DARK_BLUE}}>{totalPlantEnergy.toFixed(2)} <span className="text-3xl" style={{color: TM_GRAY_TEXT}}>kWh</span></p>
                                    <p className="text-sm" style={{color: TM_GRAY_TEXT}}>Total Energy Consumption Forecast for selected period</p>
                                </div>

                                {/* --- MOVED HERE: The four cost analysis cards --- */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                                    <StatCard title="Total Cost" value={formatCurrency(totalCost)} color="#10B981" icon={DollarSign} />
                                    <StatCard title="Utility Supply" value={formatCurrency(costFromGrid)} color="#ef5350" icon={Power} />
                                    <StatCard title="Renewables" value={formatCurrency(costFromRenewables)} color="#22C55E" icon={Wind} />
                                    <StatCard title="Avg. Cost / kWh" value={formatCurrency(avgCostPerKwh)} color="#F59E0B" icon={Power} />
                                </div>
                            </SectionCard>
                            
                            {/* Process Details Card (Unchanged) */}
                            <SectionCard className="lg:w-1/2">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold" style={{color: TM_DARK_BLUE}}>Processes Status</h3>
                                    <Dropdown
                                        label="Select Process"
                                        options={(processList.map(process => process.processName))}
                                        selected={selectedProcess?.processName || ''}
                                        onChange={(processName) => {
                                            const selected = processList.find(p => p.processName === processName);
                                            setSelectedProcess(selected);
                                        }}
                                    />
                                </div>
                                <p className="text-5xl font-bold mb-2" style={{color: TM_DARK_BLUE}}>{getSelectedProcessEnergy().toFixed(2)} <span className="text-3xl" style={{color: TM_GRAY_TEXT}}>kWh</span></p>
                                <p className="text-sm mb-4" style={{color: TM_GRAY_TEXT}}>Total Energy Consumption for {selectedProcess?.processName}</p>
                                    
                                    <h4 className="text-lg font-semibold mb-2" style={{color: TM_DARK_BLUE}}>Equipment Load</h4>
                                    <div className="flex-grow overflow-y-auto pr-2" style={{ maxHeight: '200px' }}>
                                        {/* Equipment list rendering here, now properly filtered by equipmentId */}
                                        <ul className="space-y-3">
                                            {equipmentData

                                                .map((equip, index) => (
                                                    <li key={`${equip.equipmentName}-${index}`}  className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-semibold" style={{color: TM_DARK_BLUE}}>
                                                                {equip.equipmentName}
                                                            </span>
                                                            <span className="font-bold text-xl" style={{color: TM_DARK_BLUE}}>
                                                                {equip.energyConsumedKWh.toFixed(2)} <span className="text-sm font-normal" style={{color: TM_GRAY_TEXT}}>kWh</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-xs px-1" style={{color: TM_GRAY_TEXT}}>
                                                            <span className="flex items-center">
                                                                <Bolt className="h-3 w-3 mr-1 text-yellow-500" />
                                                                {equip.voltageAverage.toFixed(0)} V
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Sigma className="h-3 w-3 mr-1 text-red-500" />
                                                                {equip.currentAverage.toFixed(2)} A
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-xs px-1 mt-1" style={{color: TM_GRAY_TEXT}}>
                                                            <span className="flex items-center">
                                                                <Thermometer className="h-3 w-3 mr-1 text-orange-500" />
                                                                {equip.temperatureAverage.toFixed(1)}°C
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Droplet className="h-3 w-3 mr-1 text-blue-500" />
                                                                {equip.humidityPercentAverage.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        
                                                    </li>
                                                ))
                                            }
                                    </ul>
                                    {equipmentData.length === 0 && (
                                        <div className="text-center py-8" style={{color: TM_GRAY_TEXT}}>
                                            <p>No equipment data available</p>
                                            <p className="text-sm">Select a process to view equipment details</p>
                                        </div>
                                    )}
                                    </div>
                                </SectionCard>
                            </div>
                            <SectionCard title="Forecasted Cost Breakdown by Source">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={forecastCostBreakdownData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY}/>
                                        <XAxis type="number" stroke={TM_GRAY_TEXT} tickFormatter={(tick) => `${currencySymbol}${tick.toLocaleString()}`} />
                                        <YAxis type="category" dataKey="name" width={110} stroke={TM_DARK_BLUE} />
                                        <Tooltip
                                            content={<CustomTooltip unit={currencySymbol} />}
                                            formatter={(value) => formatCurrency(value)}
                                            cursor={{ fill: 'rgba(230, 230, 230, 0.5)' }}
                                        />
                                        <Bar dataKey="cost" name="Cost" barSize={35}>
                                            {forecastCostBreakdownData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </SectionCard>
                            
                            {/* --- NEW: Forecasted Cost Analysis Section --- */}
                            
                        </>
                    )}
                    {/* {activeSubTab === 'Graphs' && (
                        <SectionCard title="Predicted vs Actual Energy Consumption">
                            <div className="flex flex-col sm:flex-row justify-end mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
                                <label htmlFor="graphStart" className="whitespace-nowrap" style={{color: TM_GRAY_TEXT}}>From:</label>
                                <input type="datetime-local" id="graphStart" value={graphStartTime} onChange={(e) => setGraphStartTime(e.target.value)} className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" style={{color: TM_DARK_BLUE}}/>
                                <label htmlFor="graphEnd" className="whitespace-nowrap" style={{color: TM_GRAY_TEXT}}>To:</label>
                                <input type="datetime-local" id="graphEnd" value={graphEndTime} onChange={(e) => setGraphEndTime(e.target.value)} className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" style={{color: TM_DARK_BLUE}} />
                            </div>
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={forecastDataAll}>
                                    <defs>
                                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={TM_RED} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={TM_RED} stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={TM_LIGHT_BLUE} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={TM_LIGHT_BLUE} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY} />
                                    <XAxis dataKey="time" stroke={TM_GRAY_TEXT}/>
                                    <YAxis stroke={TM_GRAY_TEXT}/>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: TM_DARK_BLUE }}/>
                                    <Area type="monotone" dataKey="upperBound" stroke="none" fill="#CBD5E1" fillOpacity={0.4} name="Confidence Interval" />
                                    <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#CBD5E1" fillOpacity={0.4} />
                                    <Area type="monotone" dataKey="predicted" stroke={TM_RED} fillOpacity={1} fill="url(#colorPredicted)" name="Predicted" />
                                    <Area type="monotone" dataKey="actual" stroke={TM_LIGHT_BLUE} fillOpacity={1} fill="url(#colorActual)" name="Actual (Past)" />
                                    {forecastDataAll.filter(d => d.isAnomaly).map(d => (
                                      <ReferenceDot key={d.anomalyId} x={d.time} y={d.predicted} r={8} fill="red" stroke="white" ifOverflow="visible">
                                        <Label value="!" position="center" fill="white" fontSize="10px" />
                                      </ReferenceDot>
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </SectionCard>
                    )} */}
                    {activeSubTab === 'Alert & Anomaly' && (
                        <AlertAndAnomalyContent />
                    )}
                    {activeSubTab === 'Scenario Planner' && (
                        <ScenarioPlannerTab />
                    )}
                 </main>
            </div>
        </div>
    );
};


// LLM Explainer Tab Content (Unchanged from previous versions)
const LLMExplainerTab = () => {
  const [llmSummary, setLlmSummary] = useState("The predicted energy spike on Wednesday is primarily due to increased HVAC usage during peak external temperatures and an unexpected surge in Paint shop activity. The model also identified a minor influence from a scheduled maintenance downtime, which reduced overall consumption slightly on Thursday.");
  const featureImportance = generateFeatureImportance();
  const forecastDeviation = generateDeviationData();

  const [aiRecommendations, setAiRecommendations] = useState("AI is generating recommendations...");
  useEffect(() => {
    const generateAiRecommendations = async () => {
        const prompt = `Based on a hypothetical energy forecast with a potential peak demand, suggest actionable recommendations to optimize energy consumption and potentially reduce emissions.`;
        const simulatedResponse = `To optimize energy consumption during predicted peaks, consider:
1. Adjusting non-critical production schedules to off-peak hours.
2. Pre-cooling/heating facilities during off-peak times to leverage lower energy rates.
3. Increasing reliance on renewable energy sources if available on-site or through grid purchasing agreements.
4. Implementing demand-response strategies in coordination with your utility provider to reduce load during high-cost periods.
5. Performing routine maintenance on energy-intensive equipment to ensure optimal efficiency and prevent unexpected energy surges.
6. Engaging employees in energy-saving initiatives through awareness campaigns and incentives.`;
        setAiRecommendations(simulatedResponse);
    };
    generateAiRecommendations();
  }, []);


  const handlePresetQuestion = async (question) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const prompt = `Explain the energy forecast based on the following question: "${question}". Assume typical automotive manufacturing energy data.`;
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setLlmSummary(text);
      } else {
        setLlmSummary("Could not get a response from the LLM for this question.");
      }
    } catch (error) {
      console.error("Error calling LLM API:", error);
      setLlmSummary("Failed to get an explanation due to a network error or API issue.");
    }
  };

  return (
    <div className="p-6 min-h-screen" style={{backgroundColor: TM_LIGHT_GRAY_BG, color: TM_GRAY_TEXT}}>
      <SectionCard title="Forecast Rationale (LLM-Generated Summary)" className="mb-6">
        <p className="text-lg leading-relaxed" style={{color: TM_GRAY_TEXT}}>{llmSummary}</p>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Feature Importance">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={featureImportance}>
              <XAxis type="number" stroke={TM_GRAY_TEXT} />
              <YAxis type="category" dataKey="name" width={120} axisLine={false} tickLine={false} stroke={TM_GRAY_TEXT} />
              <Tooltip formatter={(value) => `${value}% Contribution`} />
              <Bar dataKey="contribution" fill={TM_RED}>
                {featureImportance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Prediction Breakdown (e.g., 10 AM Tomorrow)">
          <div className="space-y-4">
            {featureImportance.slice(0, 3).map((feature, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
                <span className="font-semibold" style={{color: TM_DARK_BLUE}}>{feature.name}</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-24 h-3 rounded-full ${feature.contribution > 20 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${feature.contribution * 2}px` }}></div>
                  <span style={{color: TM_GRAY_TEXT}}>{feature.contribution}% Influence</span>
                </div>
              </div>
            ))}
            <p className="text-sm text-gray-500 mt-2">
              <strong style={{color: TM_DARK_BLUE}}>Interpretation:</strong> For 10 AM tomorrow, outside temperature and production schedule are the primary drivers of the forecast, increasing predicted consumption. Historical load also contributes positively.
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Forecast Deviation Analysis">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastDeviation}>
            <CartesianGrid strokeDasharray="3 3" stroke={TM_BORDER_GRAY} />
            <XAxis dataKey="date" stroke={TM_GRAY_TEXT}/>
            <YAxis stroke={TM_GRAY_TEXT}/>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="forecasted" stroke="#8884d8" name="Forecasted" dot={false} />
            <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" dot={false} />
            <Line type="monotone" dataKey="deviation" stroke="#ffc658" name="Deviation (%)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-4">
          <strong style={{color: TM_DARK_BLUE}}>Insights:</strong> Observe periods where the 'Deviation (%)' line shows significant spikes or dips, indicating where the model's predictions varied most from this. This helps identify blind spots or areas for model refinement.
        </p>
      </SectionCard>

      <SectionCard title="AI-Powered Recommendations">
          <p className="text-sm italic leading-relaxed whitespace-pre-line" style={{color: TM_GRAY_TEXT}}>
              {aiRecommendations}
          </p>
          <div className="flex justify-end mt-4">
              <button className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity duration-200`} style={{backgroundColor: TM_RED}}>
                  Implement Suggestions
              </button>
          </div>
      </SectionCard>

      <SectionCard title="Ask the LLM">
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => handlePresetQuestion("Why did the forecast increase this week?")}
            className={`px-4 py-2 text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center space-x-2`}
            style={{backgroundColor: TM_LIGHT_BLUE}}
          >
            <HelpCircle className="h-5 w-5" /> <span>Why did the forecast increase this week?</span>
          </button>
          <button
            onClick={() => handlePresetQuestion("Which factor contributed most to yesterday’s error?")}
            className={`px-4 py-2 text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center space-x-2`}
            style={{backgroundColor: TM_LIGHT_BLUE}}
          >
            <HelpCircle className="h-5 w-5" /> <span>Which factor contributed most to yesterday’s error?</span>
          </button>
        </div>
        <p className="text-sm text-gray-500">Click a question to see the LLM's explanation.</p>
      </SectionCard>
    </div>
  );
};

// AI Copilot Tab Content (Unchanged from previous versions)
const AICopilotTab = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newUserMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInput('');

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const prompt = `As an energy forecasting AI, answer the following question about automotive manufacturing energy consumption: "${input}"`;
    let chatHistory = messages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        const aiResponse = { sender: 'ai', text: result.candidates[0].content.parts[0].text };
        setMessages(prevMessages => [...prevMessages, aiResponse]);
      } else {
        setMessages(prevMessages => [...prevMessages, { sender: 'ai', text: "I couldn't process that. Could you please rephrase?" }]);
      }
    } catch (error) {
      console.error("Error calling LLM API:", error);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', text: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="p-6 min-h-screen flex flex-col" style={{backgroundColor: TM_LIGHT_GRAY_BG, color: TM_GRAY_TEXT}}>
      <SectionCard title="AI Copilot: Your Energy Insights Assistant" className="flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {messages.length === 0 && (
            <p className="text-gray-500 text-center italic">Type a question to get started with your energy copilot!</p>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3/4 p-3 rounded-lg shadow-md ${
                  msg.sender === 'user'
                    ? 'text-white'
                    : 'bg-white border border-gray-200'
                }`}
                style={msg.sender === 'user' ? {backgroundColor: TM_RED, color: TM_WHITE} : {color: TM_DARK_BLUE}}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about energy forecast..."
            className="flex-grow px-4 py-2 rounded-l-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            style={{color: TM_DARK_BLUE}}
          />
          <button
            onClick={handleSendMessage}
            className={`px-6 py-2 text-white rounded-r-lg hover:opacity-90 transition-opacity duration-200 flex items-center justify-center space-x-2`}
            style={{backgroundColor: TM_RED}}
          >
            <MessageSquare className="h-5 w-5" /> <span>Send</span>
          </button>
        </div>
      </SectionCard>
    </div>
  );
};


const App = () => {
  const [activeTab, setActiveTab] = useState('Monitoring'); // Default to Forecasting
  const [currentPlant, setCurrentPlant] = useState();

  return (
    <div className="font-sans antialiased" style={{backgroundColor: TM_LIGHT_GRAY_BG}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #A0AEC0 #F7FAFC;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #A0AEC0;
          border-radius: 10px;
          border: 2px solid #F7FAFC;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background-color: #F7FAFC;
          border-radius: 10px;
        }
        /* Custom styles for slider thumb */
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 1.25rem;
            height: 1.25rem;
            background: ${TM_RED};
            cursor: pointer;
            border-radius: 50%;
        }
        input[type=range]::-moz-range-thumb {
            width: 1.25rem;
            height: 1.25rem;
            background: ${TM_RED};
            cursor: pointer;
            border-radius: 50%;
            border: none;
        }
      `}</style>
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentPlant={currentPlant}
        setCurrentPlant={setCurrentPlant} 
      />
      <main>
        {activeTab === 'Monitoring' && (
          <MonitoringTab
            currentPlant={currentPlant}
          />
        )}
        {activeTab === 'Forecasting' && (
          <ForecastingTab
            currentPlant={currentPlant}
          />
        )}
        {activeTab === 'Insights' && <LLMExplainerTab />}
        {activeTab === 'AI Copilot' && <AICopilotTab />}
      </main>
    </div>
  );
};

export default App;