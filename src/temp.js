import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Label, ReferenceDot } from 'recharts';
import { ChevronDown, Factory, TrendingUp, Cpu, Lightbulb, Zap, Clock, Thermometer, Droplet, Calendar, Gauge, AlertTriangle, MessageSquare, HelpCircle, Eye, Cloud, Download, CloudRain, Wind, Info, BellRing, LayoutDashboard, BarChart3, Building2, Activity, Leaf, Power, Sigma, Bolt, SlidersHorizontal, Settings, TestTube2 } from 'lucide-react';

// Placeholder for API Key (Canvas will inject if needed)
const apiKey = "";

const plants = ['Plant A', 'Plant B', 'Plant C', 'Plant D'];
const processes = ['Overall Plant', 'Paint', 'Welder', 'HVAC', 'Conveyor', 'Robotics Arms'];
// Filtered list for dropdowns, removing "Overall Plant"
const processesForSelection = processes.filter(p => p !== 'Overall Plant');
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#f199e4', '#a4de6c', '#d0ed57', '#ff7300', '#d82884'];

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
const generateLiveProcessData = () => {
    const processData = {};
    let totalPlantEnergy = 0;
    let totalPlantRenewable = 0;
    let totalPlantNonRenewable = 0;

    Object.keys(processEquipmentDB).forEach(processName => {
        let totalProcessEnergy = 0;
        const equipment = processEquipmentDB[processName].map(equip => {
            const voltage = parseFloat((220 + (Math.random() - 0.5) * 10).toFixed(2)); // Volts
            const current = parseFloat((15 + (Math.random() - 0.5) * 5).toFixed(2)); // Amps
            const energy = parseFloat(((voltage * current) / 1000).toFixed(3)); // kWh
            totalProcessEnergy += energy;
            return { ...equip, voltage, current, energy };
        });

        const processKey = processName.toLowerCase().replace(/ /g, '');
        // Simulate a unique renewable mix for each process
        const processRenewable = totalProcessEnergy * (0.3 + Math.random() * 0.4); // 30-70% renewable mix per process
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
        totalPlantEnergy: parseFloat(totalPlantEnergy.toFixed(2)),
        renewable: parseFloat(totalPlantRenewable.toFixed(2)),
        nonRenewable: parseFloat(totalPlantNonRenewable.toFixed(2)),
        renewableWind: parseFloat((totalPlantRenewable * 0.3).toFixed(2)),
        renewableSolar: parseFloat((totalPlantRenewable * 0.5).toFixed(2)),
        renewableHydro: parseFloat((totalPlantRenewable * 0.2).toFixed(2)),
    };
};


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
const generateRandomData = (count, min, max) => {
  return Array.from({ length: count }, () => parseFloat((Math.random() * (max - min) + min).toFixed(2)));
};

// Helper to format date for display
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const generateHistoricalData = (startDateStr, endDateStr, systems) => {
  const data = [];
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 0; i < diffDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dayData = {
      date: date.toISOString().split('T')[0],
    };
    let totalEnergy = 0;
    systems.forEach(system => {
      const energy = parseFloat((Math.random() * 100 + 500).toFixed(2));
      dayData[system] = energy;
      totalEnergy += energy;
    });
    dayData['Total Energy'] = parseFloat(totalEnergy.toFixed(2));
    data.push(dayData);
  }
  return data;
};

const generateMonthlySummary = () => {
  const data = [];
  const systems = ['Paint', 'Welder', 'HVAC', 'Conveyor', 'Robotics Arms'];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed (Jan is 0)

  for (let i = 0; i <= currentMonth; i++) { // Generate only up to the current month
    const date = new Date(currentYear, i, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const monthData = {
      month: `${monthName} ${year}`,
    };
    let totalEnergy = 0;
    systems.forEach(system => {
      const energy = parseFloat((Math.random() * 1000 + 5000).toFixed(2));
      monthData[system] = energy;
      totalEnergy += energy;
    });
    monthData['Total Energy (kWh)'] = parseFloat(totalEnergy.toFixed(2));
    data.push(monthData);
  }
  return data;
};

const generateDailyStackedData = (startDateStr, endDateStr) => {
  const data = [];
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 0; i < diffDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    data.push({
      date: date.toISOString().split('T')[0],
      Paint: parseFloat((Math.random() * 500 + 1000).toFixed(2)),
      Welder: parseFloat((Math.random() * 300 + 800).toFixed(2)),
      HVAC: parseFloat((Math.random() * 700 + 1500).toFixed(2)),
      Conveyor: parseFloat((Math.random() * 200 + 600).toFixed(2)),
      RoboticsArms: parseFloat((Math.random() * 400 + 1200).toFixed(2)),
    });
  }
  return data;
};

// --- NEW TIME-SERIES COMPARISON DATA GENERATOR ---
const generateTimeSeriesComparisonData = (selectedPlants, startDateStr, endDateStr) => {
  const data = [];
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 0; i < diffDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dayData = { date: date.toISOString().split('T')[0] };

    selectedPlants.forEach(plant => {
      const plantDailyData = generateLiveProcessData(); // Simulate daily data for a plant
      dayData[`${plant}_totalEnergy`] = plantDailyData.totalPlantEnergy;
      dayData[`${plant}_renewable`] = plantDailyData.renewable;
      dayData[`${plant}_nonRenewable`] = plantDailyData.nonRenewable;
      
      Object.keys(processEquipmentDB).forEach(processName => {
        const processKey = processName.toLowerCase().replace(/ /g, '');
        dayData[`${plant}_${processName}`] = plantDailyData[processKey]?.energy || 0;
      });
    });
    data.push(dayData);
  }
  return data;
};


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

const generateWeatherConditions = () => {
    return {
      current: {
        temperature: generateRandomData(1, 15, 30)[0],
        humidity: generateRandomData(1, 40, 90)[0],
        windSpeed: generateRandomData(1, 5, 20)[0],
        conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
      },
      forecast: { // Added forecast weather
        temperature: generateRandomData(1, 18, 32)[0],
        humidity: generateRandomData(1, 35, 85)[0],
        windSpeed: generateRandomData(1, 8, 25)[0],
        conditions: ['Sunny', 'Partly Cloudy', 'Scattered Showers'][Math.floor(Math.random() * 3)],
      }
    };
};

// EMISSION DATA GENERATION FUNCTIONS
const EMISSION_FACTOR_NON_RENEWABLE_KG_PER_KWH = 0.45;
const EMISSION_FACTOR_RENEWABLE_KG_PER_KWH = 0.02;

const generateEmissionMetrics = (currentEnergyConsumption, renewableMixPercent) => {
    if (isNaN(currentEnergyConsumption) || isNaN(renewableMixPercent) || currentEnergyConsumption === 0) {
        return { totalEmissions: 0, processEmissions: [], sourceEmissions: [], emissionIntensity: 0, benchmark: 0.35 };
    }
    const nonRenewableEnergy = currentEnergyConsumption * (1 - (renewableMixPercent / 100));
    const renewableEnergy = currentEnergyConsumption * (renewableMixPercent / 100);

    const totalEmissions = (nonRenewableEnergy * EMISSION_FACTOR_NON_RENEWABLE_KG_PER_KWH) +
                           (renewableEnergy * EMISSION_FACTOR_RENEWABLE_KG_PER_KWH);

    const specificProcesses = processes.filter(p => p !== 'Overall Plant');
    const processEmissions = specificProcesses.map(processName => {
        const baseEmission = totalEmissions * (Math.random() * 0.15 + 0.05);
        return { name: processName, emissions: parseFloat(baseEmission.toFixed(2)) };
    });

    const sourceEmissions = [
        { name: 'Non-Renewable', emissions: parseFloat((nonRenewableEnergy * EMISSION_FACTOR_NON_RENEWABLE_KG_PER_KWH).toFixed(2)) },
        { name: 'Renewable', emissions: parseFloat((renewableEnergy * EMISSION_FACTOR_RENEWABLE_KG_PER_KWH).toFixed(2)) },
    ];

    const emissionIntensity = parseFloat((totalEmissions / currentEnergyConsumption).toFixed(3));

    return {
        totalEmissions: parseFloat(totalEmissions.toFixed(2)),
        processEmissions,
        sourceEmissions,
        emissionIntensity,
        benchmark: 0.35
    };
};

const generateDailyEmissions = (startDateStr, endDateStr) => {
    const data = [];
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < diffDays; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const totalConsumption = parseFloat((Math.random() * 10000 + 5000).toFixed(2));
        const renewableMix = parseFloat((Math.random() * 30 + 50).toFixed(2));
        const emissionsData = generateEmissionMetrics(totalConsumption, renewableMix);
        data.push({
            date: date.toISOString().split('T')[0],
            totalEmissions: emissionsData.totalEmissions,
            benchmark: emissionsData.benchmark * totalConsumption
        });
    }
    return data;
};


const CustomTooltip = ({ active, payload, label, unit = 'kWh' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-lg text-gray-800">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value} ${entry.unit || unit}`}
          </p>
        ))}
        {payload[0].payload.isAnomaly && (
            <p className="text-red-500 text-xs mt-1">
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
        <div className="text-right text-white">
            <p className="text-sm font-medium text-blue-200">{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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

  return(
  <header className="w-full bg-gradient-to-r from-blue-600 to-indigo-800 p-4 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">VoltVisor</h1>
                    <p className="text-blue-100 text-sm font-medium mt-1">
                        AI-Powered Energy Intelligence • Predict • Optimize
                    </p>
                </div>
                <Dropdown
                    label="Plant Selector"
                    options={plantList.map(p => p.plantName)}
                    selected={currentPlant?.plantName || ''}
                    onChange={(selectedName) => {
                    const selectedPlant = plantList.find(p => p.plantName === selectedName);
                    setCurrentPlant(selectedPlant);
                    }}
                />
            </div>
      <nav className="flex items-center space-x-2 md:space-x-4">
        {['Monitoring', 'Forecasting', 'Insights', 'AI Copilot'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium text-lg transition-all duration-300
              ${activeTab === tab
                ? 'bg-white text-blue-700 shadow-lg scale-105'
                : 'text-white hover:bg-white hover:bg-opacity-20 hover:scale-105'
              }`}
          >
            {tab}
          </button>
        ))}
        <div className="pl-4">
            <RealtimeClock />
        </div>
      </nav>
    </div>
  </header>
  );
};

const SectionCard = ({ title, children, className = '' }) => (
  <div className={`bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 ${className}`}>
    <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
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
        className="inline-flex justify-between w-full rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
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
          className="origin-top-right absolute z-20 mt-2 w-full rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={label}
        >
          <div className="py-1 max-h-60 overflow-y-auto" role="none">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white cursor-pointer"
                role="menuitem"
              >
                {isMulti && (
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => handleSelect(option)}
                    className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out bg-gray-800 border-gray-600 rounded"
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
  <div className={`flex flex-col p-5 rounded-xl shadow-lg border ${color} bg-opacity-10 backdrop-blur-sm ${className}`}>
    <div className="flex items-center mb-2">
      <div className={`p-3 rounded-full ${color} bg-opacity-30 mr-4`}>
        {Icon && <Icon className={`h-8 w-8 text-${color.split('-')[1]}-400`} />}
      </div>
      <div>
        <p className="text-lg font-medium text-gray-300">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}<span className="text-xl font-semibold text-gray-300">{unit}</span></p>
      </div>
    </div>
    {children} {/* For date/time pickers */}
  </div>
);

const DateRangePicker = ({ startDate, endDate, period, onStartDateChange, onEndDateChange, onPeriodChange }) => {
    // Helper function to format date to YYYY-MM-DD
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

    return (
        <div className="flex flex-wrap justify-end items-center gap-4 bg-gray-800/50 p-2 rounded-lg">
          <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-300">From:</label>
              <input 
                  type="date" 
                  value={formatDateForInput(startDate)} 
                  onChange={handleStartDateChange}
                  className="px-2 py-1 text-sm bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
          </div>
          
          <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-300">To:</label>
              <input 
                  type="date" 
                  value={formatDateForInput(endDate)} 
                  onChange={handleEndDateChange}
                  className="px-2 py-1 text-sm bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
          </div>
          
          <div className="flex space-x-1">
              {['1D', '1W', '1M'].map(p => (
                  <button 
                      key={p} 
                      onClick={() => onPeriodChange(p)} 
                      className={`px-2.5 py-1 text-sm rounded-md font-medium transition-all duration-200 ${
                          period === p 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                      {p}
                  </button>
              ))}
          </div>
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
  const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [period, setPeriod] = useState('1D');

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
      wind: wind.toFixed(2),
      solar: solar.toFixed(2),
      hydro: hydro.toFixed(2),
      total: (wind + solar + hydro).toFixed(2),
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
    if (!selectedProcess?.processId || !startDate || !endDate) return;

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
      const processed = data.map(e => ({
        name: e.equipmentName,
        energy: e.energyConsumedKWh,
        voltage: e.voltageAverage,
        current: e.currentAverage,
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
      if (selectedPlantsForComparison.length === 0 || !startDate || !endDate) return;

      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const newData = Array.from({ length: days }).map((_, idx) => {
        const date = new Date(start);
        date.setDate(start.getDate() + idx);
        return { date: date.toISOString().split('T')[0] };
      });

      for (const plantName of selectedPlantsForComparison) {
        const plantId = plantNameToIdMap[plantName];

        const processRes = await fetch(`http://localhost:8080/api/plants/${plantId}`);
        const processes = await processRes.json();

        if (processesForSelectionn.length === 0) {
          setProcessesForSelectionn(processes.map(p => p.processName));
        }

        const selectedProc = processes.find(p => p.processName === comparisonProcess);

        for (let i = 0; i < newData.length; i++) {
          const date = newData[i].date;

          const totalRes = await fetch(`http://localhost:8080/api/plants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plantId, startDate: date, endDate: date })
          });
          const total = await totalRes.json();
          newData[i][`${plantName}_totalEnergy`] = total.totalEnergyConsumedkWh;
          newData[i][`${plantName}_totalCO2`] = total.totalEmissionsCO2;

          if (selectedProc) {
            const procRes = await fetch(`http://localhost:8080/api/processes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ processId: selectedProc.processId, startDate: date, endDate: date })
            });
            const procData = await procRes.json();
            newData[i][`${plantName}_${comparisonProcess}`] = procData.totalEnergyConsumedkWh;
            newData[i][`${plantName}_${comparisonProcess}_CO2`] = procData.totalEmissionsCO2;
          }
        }
      }

      setPlantComparisonData(newData);
    };

    fetchComparisonData();
  }, [selectedPlantsForComparison, startDate, endDate, comparisonProcess]);

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
      { name: 'Comparison', icon: Building2 },
  ];

  const DataDisplay = ({ title, showProcessSelection = true }) => (
        <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            
            {/* Current date range indicator */}
            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300">
                    <span className="font-medium">Active Date Range:</span> {startDate} to {endDate} 
                    <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        {period}
                    </span>
                </p>
            </div>
        </div>
    );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
            {/* Side Navigation */}
            <aside className="lg:w-56 flex-shrink-0 bg-gray-800 p-4 rounded-xl self-start sticky top-24">
                <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto">
                    {subNavItems.map(item => (
                        <button
                            key={item.name}
                            onClick={() => setActiveSubTab(item.name)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 whitespace-nowrap ${
                                activeSubTab === item.name
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            {/* Main Content Area */}
              <div className="flex-grow flex flex-col space-y-6">
                {/* COMMON DATE RANGE PICKER - Shows for all tabs */}
                <DateRangePicker 
                  startDate={startDate}
                  endDate={endDate}
                  period={period}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onPeriodChange={handlePeriodChange}
            />

            {/* Main Content Area */}
            <main>
                {activeSubTab === 'Live' && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/*Overall Plant Status */}
                        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2 flex items-center"><Zap className="mr-2 text-yellow-400" />Overall Plant Status</h3>
                                <p className="text-5xl font-bold text-white mb-2">{totalPlantEnergy.toFixed(2)} <span className="text-3xl text-gray-400">kWh</span></p>
                                <p className="text-sm text-gray-400 mb-4">Total Energy Consumption for selected period</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-lg font-semibold text-white mb-2">Energy Mix</p>
                                    <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                                        <div className="bg-green-500 h-4 rounded-full" style={{ width: `${((100*(renewableBreakdown.total)/totalPlantEnergy)).toFixed(2)}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <p className="text-green-400">Renewable: {(100*(renewableBreakdown.total)/totalPlantEnergy).toFixed(2)}% ({renewableBreakdown.total} kWh)</p>
                                        <p className="text-orange-400">Non-Renewable: {(100- (100*(renewableBreakdown.total)/totalPlantEnergy)).toFixed(2)}% ({(totalPlantEnergy-renewableBreakdown.total).toFixed(2)} kWh)</p>
                                    </div>
                                </div>  
                                <div>
                                    <p className="text-lg font-semibold text-white mb-2">Renewable Sources</p>
                                    <div className="space-y-2 text-gray-300">
                                        <div className="flex justify-between items-center"><span className="flex items-center"><Wind className="w-4 h-4 mr-2 text-blue-400"/>Wind</span> <span className="font-bold text-white">{renewableBreakdown.wind} kWh</span></div>
                                        <div className="flex justify-between items-center"><span className="flex items-center"><Lightbulb className="w-4 h-4 mr-2 text-yellow-400"/>Solar</span> <span className="font-bold text-white">{renewableBreakdown.solar} kWh</span></div>
                                        <div className="flex justify-between items-center"><span className="flex items-center"><Droplet className="w-4 h-4 mr-2 text-teal-400"/>Hydro</span> <span className="font-bold text-white">{renewableBreakdown.hydro} kWh</span></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-white mb-2">CO₂ Emission</p>
                                    <p className="text-2xl font-bold text-white">{totalEmissions} <span className="text-lg text-gray-400">kg CO₂e</span></p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Process Details */}
                        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col">
                            <h3 className="text-xl font-semibold text-white mb-4">Process Details</h3>
                            <div className="mb-4">
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
                            {/* process details */}
                                <>
                                    <div className="mb-4">
                                        <p className="text-3xl font-bold text-white">{processEnergy.toFixed(2)} <span className="text-xl text-gray-400">kWh</span></p>
                                        <p className="text-sm text-gray-400">
                                            Total Energy Consumption for {selectedProcess?.processName}
                                        </p>
                                    </div>
                            
                                    <div className="mb-4">
                                        

                                        <p className="text-md font-semibold text-white mb-1">Process Energy Mix</p>
                                        <div className="w-full bg-gray-700 rounded-full h-3">
                                            <div className="bg-green-500 h-3 rounded-full" style={{ width: `${totalRenewable.toFixed(2)}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium mt-1">
                                            <span className="text-green-400">Renewable: {totalRenewable.toFixed(2)}%</span>
                                            <span className="text-orange-400">Non-Renewable: {nonRenewable.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </>    
                                      <h4 className="text-lg font-semibold text-white mb-2">Equipment Load</h4>
                                        <div className="flex-grow overflow-y-auto pr-2" style={{ maxHeight: '200px' }}>
                                          <ul className="space-y-3">
                                            {equipmentData
                                              .filter((equip, index, self) => 
                                                index === self.findIndex(e => e.name === equip.name)
                                              )
                                              .map((equip, index) => (
                                                <li key={`${equip.name}-${equip.voltage}-${equip.current}`} className="bg-gray-700/50 p-3 rounded-lg">
                                                  <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-white">{equip.name}</span>
                                                    <span className="font-bold text-xl text-white">
                                                      {equip.energy.toFixed(2)} <span className="text-sm font-normal text-gray-400">kWh</span>
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between text-xs text-gray-300 px-1">
                                                    <span className="flex items-center">
                                                      <Bolt className="h-3 w-3 mr-1 text-yellow-500" />
                                                      {equip.voltage} V
                                                    </span>
                                                    <span className="flex items-center">
                                                      <Sigma className="h-3 w-3 mr-1 text-red-500" />
                                                      {equip.current} A
                                                    </span>
                                                  </div>
                                                </li>
                                              ))}
                                          </ul>
                                        </div>  
                        </div>
                    </div>
                  </>       
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
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="date" dy={10} />
                                    <YAxis dx={-10} label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
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
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="date" dy={10} />
                                    <YAxis dx={-10} label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
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
                            <table className="min-w-full bg-gray-700 rounded-lg">
                              <thead>
                                <tr className="bg-gray-600 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                                  <th className="px-4 py-3 rounded-tl-lg">Month</th>
                                  {processesForSelection.map(system => (<th key={system} className="px-4 py-3">{system}</th>))}
                                  <th className="px-4 py-3 rounded-tr-lg">Total Energy (kWh)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-600">
                                {monthlySummary.map((data, index) => (
                                  <tr key={index} className="hover:bg-gray-600 transition-colors duration-200">
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">{data.month}</td>
                                    {processesForSelection.map(system => {
                                      const value = data[system];
                                      return ( <td key={system} className="px-4 py-3 whitespace-nowrap">{value.toFixed(2)}</td>);
                                    })}
                                    <td className="px-4 py-3 whitespace-nowrap font-bold text-white">{data['Total Energy (kWh)'].toFixed(2)}</td>
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
                            <StatCard title="Total Plant Emissions (CO₂e)" value={totalEmissions} unit=" kg" color="border-green-600" icon={Cloud} />
                            <StatCard title="Emission Intensity" value={(totalEmissions/totalPlantEnergy).toFixed(2)} unit=" kg CO₂e/kWh" color="border-green-600" icon={Zap} />
                        </div>
                        {/* <p className="text-sm text-gray-400 mb-6 -mt-4 italic">Note: Benchmark target: {benchmark} kg CO₂e/kWh.</p> */}
                        <h4 className="text-lg font-semibold text-white mt-6 mb-2">Daily CO₂ Emissions Trend (kg CO₂e)</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={historicalEmissions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="date" stroke="#9CA3AF" />
                              <YAxis stroke="#9CA3AF" />
                              <Tooltip content={<CustomTooltip unit="kg CO₂e" />} />
                              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                              <Line
                                type="monotone"
                                dataKey="Total Emissions (Kg)"
                                stroke="#82ca9d"
                                name="Total Emissions"
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        <h4 className="text-lg font-semibold text-white mb-2">Process-Wise Emissions (kg CO₂e)</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={historicalEmissions} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="date" stroke="#9CA3AF" />
                              <YAxis stroke="#9CA3AF" />
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
                              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                              <XAxis type="number" unit="%" />
                              <YAxis type="category" dataKey="name" width={150} />
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

                {activeSubTab === 'Comparison' && (
                  <div className="space-y-6">
                      <SectionCard title="Plants Comparison">
                        <div className="flex flex-col space-y-4 mb-4">
                          <Dropdown label="Plants for Comparison" options={plants} selected={selectedPlantsForComparison} onChange={setSelectedPlantsForComparison} isMulti={true} />
                          {/* <div className="flex flex-wrap gap-2 items-center">
                            <label className="text-gray-300 whitespace-nowrap">Time Duration:</label>
                            <input type="date" value={comparisonStartDate} onChange={(e) => { setComparisonStartDate(e.target.value); setComparisonPeriod('Custom'); }} className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <span className="text-gray-300">-</span>
                            <input type="date" value={comparisonEndDate} onChange={(e) => { setComparisonEndDate(e.target.value); setComparisonPeriod('Custom'); }} className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <div className="flex space-x-2">
                              {['1D', '1W', '1M'].map(period => (
                                <button key={period} onClick={() => setComparisonPeriod(period)} className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${comparisonPeriod === period ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{period}</button>
                              ))}
                            </div>
                          </div> */}
                        </div>

                        <h4 className="text-lg font-semibold text-white mb-2">Total Energy Consumption Comparison</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={plantComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="date" />
                            <YAxis dx={-10} label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {selectedPlantsForComparison.map((plant, index) => (
                              <Line key={plant} type="monotone" dataKey={`${plant}_totalEnergy`} name={plant} stroke={COLORS[index % COLORS.length]} dot={false} />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>

                                   
                        <h4 className="text-lg font-semibold text-white mb-2">Total CO₂ Emissions Comparison</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={plantComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="date" />
                            <YAxis dx={-10} label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {selectedPlantsForComparison.map((plant, index) => (
                              <Line key={plant} type="monotone" dataKey={`${plant}_totalCO2`} name={`${plant} CO₂`} stroke={COLORS[(index + 1) % COLORS.length]} dot={false} />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                        <h4 className="text-lg font-semibold text-white mt-6 mb-2">Process-wise Energy Consumption</h4>
                        <Dropdown label="Select Process" options={processesForSelectionn} selected={comparisonProcess} onChange={setComparisonProcess} />
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={plantComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="date" />
                            <YAxis dx={-10} label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {selectedPlantsForComparison.map((plant, index) => (
                              <Line key={plant} type="monotone" dataKey={`${plant}_${comparisonProcess}`} name={plant} stroke={COLORS[index % COLORS.length]} dot={false} />
                            ))}
                          </LineChart>
                        </ResponsiveContainer> 
                        <h4 className="text-lg font-semibold text-white mt-6 mb-2">Process-wise CO₂ Emissions</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={plantComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="date" />
                            <YAxis dx={-10} label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {selectedPlantsForComparison.map((plant, index) => (
                              <Line key={plant} type="monotone" dataKey={`${plant}_${comparisonProcess}_CO2`} name={`${plant} ${comparisonProcess} CO₂`} stroke={COLORS[(index + 2) % COLORS.length]} dot={false} />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                        

                        {/* <h4 className="text-lg font-semibold text-white mt-6 mb-2">Renewable vs Non-Renewable Comparison</h4>
                        <Dropdown label="Select Energy Type" options={['Renewable', 'Non-Renewable']} selected={comparisonEnergyType} onChange={setComparisonEnergyType}/>
                        <ResponsiveContainer width="100%" height={250}>
                           <LineChart data={plantComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                {selectedPlantsForComparison.map((plant, index) => (
                                    <Line key={plant} type="monotone" dataKey={`${plant}_${comparisonEnergyType.toLowerCase()}`} name={plant} stroke={COLORS[index % COLORS.length]} dot={false} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer> */}
                    </SectionCard>
                  </div>
                )}
               
            </main>
        </div>
    </div>
    </div>
  );
};

// Forecasting Tab Content - REBUILT
const ForecastingTab = ({ currentPlant }) => {
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [period, setPeriod] = useState('1D');

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
    const [activeSubTab, setActiveSubTab] = useState('Forecast');
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
    const [weatherConditions, setWeatherConditions] = useState(generateWeatherConditions());
    const [graphStartTime, setGraphStartTime] = useState(getLocalDateTimeString(new Date()));
    const [graphEndTime, setGraphEndTime] = useState(getLocalDateTimeString(new Date(new Date().getTime() + 24 * 60 * 60 * 1000)));
    const [forecastDataAll, setForecastDataAll] = useState([]);

    // Update point-in-time forecast when date/time or plant changes
    useEffect(() => {
        setPointInTimeForecastData(generatePointInTimeForecast());
        setWeatherConditions(generateWeatherConditions());
    }, [forecastDateTime, currentPlant]);
    
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
      { name: 'Graphs', icon: BarChart3 },
      { name: 'Alert & Anomaly', icon: BellRing },
    ];
    
    const { totalPlantEnergy, renewable, nonRenewable } = pointInTimeForecastData;
    const totalEnergySource = renewable + nonRenewable;
    const plantRenewablePercent = totalEnergySource > 0 ? ((renewable / totalEnergySource) * 100).toFixed(1) : 0;
    const plantNonRenewablePercent = totalEnergySource > 0 ? ((nonRenewable / totalEnergySource) * 100).toFixed(1) : 0;

    const selectedProcessKey = selectedForecastProcess.toLowerCase().replace(/ /g, '');
    const selectedProcessData = pointInTimeForecastData[selectedProcessKey];

    let processRenewablePercent = 0;
    let processNonRenewablePercent = 0;
    if(selectedProcessData) {
        const processTotalSource = selectedProcessData.renewable + selectedProcessData.nonRenewable;
        processRenewablePercent = processTotalSource > 0 ? ((selectedProcessData.renewable / processTotalSource) * 100).toFixed(1) : 0;
        processNonRenewablePercent = processTotalSource > 0 ? ((selectedProcessData.nonRenewable / processTotalSource) * 100).toFixed(1) : 0;
    }

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
            <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
                <aside className="lg:w-56 flex-shrink-0 bg-gray-800 p-4 rounded-xl self-start sticky top-24">
                    <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto">
                        {forecastSubNavItems.map(item => (
                            <button key={item.name} onClick={() => setActiveSubTab(item.name)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 whitespace-nowrap ${ activeSubTab === item.name ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700' }`}>
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                <span className="font-medium">{item.name}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                

                <main className="flex-grow">
                    {activeSubTab === 'Forecast' && (
                        <div className="space-y-6">
                            <SectionCard title="Point-in-Time Forecast">
                                <div className="flex items-center space-x-4 mb-6">
                                    <label htmlFor="forecastDateTime" className="text-lg font-medium text-white">Select Forecast Time:</label>
                                    <input
                                        type="datetime-local"
                                        id="forecastDateTime"
                                        value={forecastDateTime}
                                        onChange={(e) => setForecastDateTime(e.target.value)}
                                        className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Overall Plant Forecast */}
                                    <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-white mb-2 flex items-center"><Zap className="mr-2 text-yellow-400" />Forecasted Plant Status</h3>
                                            <p className="text-5xl font-bold text-white mb-2">{pointInTimeForecastData.totalPlantEnergy} <span className="text-3xl text-gray-400">kWh</span></p>
                                            <p className="text-sm text-gray-400 mb-4">Total Energy Consumption Forecast</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-lg font-semibold text-white mb-2">Forecasted Energy Mix</p>
                                                <div className="w-full bg-gray-700 rounded-full h-4 mb-2"><div className="bg-green-500 h-4 rounded-full" style={{ width: `${plantRenewablePercent}%` }}></div></div>
                                                <div className="flex justify-between text-sm font-medium">
                                                    <p className="text-green-400">Renewable: {plantRenewablePercent}% ({pointInTimeForecastData.renewable} kWh)</p>
                                                    <p className="text-orange-400">Non-Renewable: {plantNonRenewablePercent}% ({pointInTimeForecastData.nonRenewable} kWh)</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-white mb-2">Forecasted Renewable Sources</p>
                                                <div className="space-y-2 text-gray-300">
                                                    <div className="flex justify-between items-center"><span className="flex items-center"><Wind className="w-4 h-4 mr-2 text-blue-400"/>Wind</span> <span className="font-bold text-white">{pointInTimeForecastData.renewableWind} kWh</span></div>
                                                    <div className="flex justify-between items-center"><span className="flex items-center"><Lightbulb className="w-4 h-4 mr-2 text-yellow-400"/>Solar</span> <span className="font-bold text-white">{pointInTimeForecastData.renewableSolar} kWh</span></div>
                                                    <div className="flex justify-between items-center"><span className="flex items-center"><Droplet className="w-4 h-4 mr-2 text-teal-400"/>Hydro</span> <span className="font-bold text-white">{pointInTimeForecastData.renewableHydro} kWh</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Process Forecast Details */}
                                    <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col">
                                        <h3 className="text-xl font-semibold text-white mb-4">Process Forecast Details</h3>
                                        <div className="mb-4"><Dropdown label="Select Process" options={Object.keys(processEquipmentDB)} selected={selectedForecastProcess} onChange={setSelectedForecastProcess} /></div>
                                        {selectedProcessData && (
                                            <>
                                                <div className="mb-4">
                                                    <p className="text-3xl font-bold text-white">{selectedProcessData.energy} <span className="text-xl text-gray-400">kWh</span></p>
                                                    <p className="text-sm text-gray-400">Forecasted Consumption for {selectedForecastProcess}</p>
                                                </div>
                                                <div className="mb-4">
                                                    <p className="text-md font-semibold text-white mb-1">Forecasted Process Energy Mix</p>
                                                    <div className="w-full bg-gray-700 rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{ width: `${processRenewablePercent}%` }}></div></div>
                                                    <div className="flex justify-between text-xs font-medium mt-1"><span className="text-green-400">Renewable: {processRenewablePercent}%</span><span className="text-orange-400">Non-Renewable: {processNonRenewablePercent}%</span></div>
                                                </div>
                                                <h4 className="text-lg font-semibold text-white mb-2">Forecasted Equipment Load</h4>
                                                <div className="flex-grow overflow-y-auto pr-2" style={{maxHeight: '200px'}}>
                                                    <ul className="space-y-3">
                                                        {selectedProcessData.equipment.map((equip, index) => {
                                                            const EquipIcon = equip.icon;
                                                            return (
                                                                <li key={index} className="bg-gray-700/50 p-3 rounded-lg">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center"><EquipIcon className="h-5 w-5 mr-3 text-cyan-400"/><span className="font-semibold text-white">{equip.name}</span></div>
                                                                        <span className="font-bold text-xl text-white">{equip.energy.toFixed(3)} <span className="text-sm font-normal text-gray-400">kWh</span></span>
                                                                    </div>
                                                                    <div className="flex justify-end space-x-4 text-xs text-gray-300">
                                                                        <span className="flex items-center"><Bolt className="h-3 w-3 mr-1 text-yellow-500"/>{equip.voltage} V</span>
                                                                        <span className="flex items-center"><Sigma className="h-3 w-3 mr-1 text-red-500"/>{equip.current} A</span>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </SectionCard>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Projected Peak Demand" value={kpiData.peakDemand} unit=" kWh" color="border-red-500" icon={Zap}>
                                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                        <input type="date" value={peakDemandStartDate} onChange={(e) => setPeakDemandStartDate(e.target.value)} className="w-full bg-gray-700/50 border-none rounded p-1 text-xs"/> - <input type="date" value={peakDemandEndDate} onChange={(e) => setPeakDemandEndDate(e.target.value)} className="w-full bg-gray-700/50 border-none rounded p-1 text-xs"/>
                                    </div>
                                </StatCard>
                                <StatCard title="Forecasted Emissions" value={kpiData.forecastedEmissions} unit=" kg CO₂e" color="border-blue-500" icon={Cloud}>
                                     <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                        <input type="date" value={emissionsStartDate} onChange={(e) => setEmissionsStartDate(e.target.value)} className="w-full bg-gray-700/50 border-none rounded p-1 text-xs"/> - <input type="date" value={emissionsEndDate} onChange={(e) => setEmissionsEndDate(e.target.value)} className="w-full bg-gray-700/50 border-none rounded p-1 text-xs"/>
                                    </div>
                                </StatCard>
                                <StatCard title="Total Expected Consumption" value={kpiData.totalConsumption} unit=" kWh" color="border-emerald-500" icon={Gauge}><p className="text-xs text-gray-400 mt-2">For Next 7 Days</p></StatCard>
                                <StatCard title="Forecast Accuracy (MAPE)" value={kpiData.mape} unit="%" color="border-orange-500" icon={TrendingUp}><p className="text-xs text-gray-400 mt-2">Based on last 30 days</p></StatCard>
                            </div>

                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <SectionCard title="Forecasted Weather Conditions">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="p-3 bg-gray-700 rounded-lg"><Thermometer className="h-6 w-6 text-orange-400 mx-auto mb-2" /><p className="text-sm text-gray-300">Temperature</p><p className="text-xl font-bold text-white">{weatherConditions.forecast.temperature}°C</p></div>
                                        <div className="p-3 bg-gray-700 rounded-lg"><Droplet className="h-6 w-6 text-blue-400 mx-auto mb-2" /><p className="text-sm text-gray-300">Humidity</p><p className="text-xl font-bold text-white">{weatherConditions.forecast.humidity}%</p></div>
                                        <div className="p-3 bg-gray-700 rounded-lg"><Wind className="h-6 w-6 text-green-400 mx-auto mb-2" /><p className="text-sm text-gray-300">Wind Speed</p><p className="text-xl font-bold text-white">{weatherConditions.forecast.windSpeed} km/h</p></div>
                                        <div className="p-3 bg-gray-700 rounded-lg"><CloudRain className="h-6 w-6 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-300">Conditions</p><p className="text-xl font-bold text-white">{weatherConditions.forecast.conditions}</p></div>
                                    </div>
                                </SectionCard>
                                <SectionCard title="Comparative Insights">
                                    <h4 className="text-lg font-semibold text-white mb-2">Historical Comparison</h4>
                                    <p className="text-sm text-gray-300 mb-4">This week's forecasted total energy consumption is <span className="font-bold text-green-400">12% lower</span> than last week's actual consumption.</p>
                                    <h4 className="text-lg font-semibold text-white mb-2">Plant Benchmarking</h4>
                                    <p className="text-sm text-gray-300">Compared to Plant B, {currentPlant}'s forecasted energy intensity is <span className="font-bold text-red-400">5% higher</span> for the upcoming period.</p>
                                </SectionCard>
                            </div>
                        </div>
                    )}
                    {activeSubTab === 'Graphs' && (
                        <SectionCard title="Predicted vs Actual Energy Consumption">
                            <div className="flex flex-col sm:flex-row justify-end mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
                                <label htmlFor="graphStart" className="text-gray-300 whitespace-nowrap">From:</label>
                                <input type="datetime-local" id="graphStart" value={graphStartTime} onChange={(e) => setGraphStartTime(e.target.value)} className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                <label htmlFor="graphEnd" className="text-gray-300 whitespace-nowrap">To:</label>
                                <input type="datetime-local" id="graphEnd" value={graphEndTime} onChange={(e) => setGraphEndTime(e.target.value)} className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={forecastDataAll}>
                                    <defs>
                                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Area type="monotone" dataKey="upperBound" stroke="none" fill="#4a5568" fillOpacity={0.2} name="Confidence Interval" />
                                    <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#4a5568" fillOpacity={0.2} />
                                    <Area type="monotone" dataKey="predicted" stroke="#8884d8" fillOpacity={1} fill="url(#colorPredicted)" name="Predicted" />
                                    <Area type="monotone" dataKey="actual" stroke="#82ca9d" fillOpacity={1} fill="url(#colorActual)" name="Actual (Past)" />
                                    {forecastDataAll.filter(d => d.isAnomaly).map(d => (
                                       <ReferenceDot key={d.anomalyId} x={d.time} y={d.predicted} r={8} fill="red" stroke="white" ifOverflow="visible">
                                          <Label value="!" position="center" fill="white" fontSize="10px" />
                                       </ReferenceDot>
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </SectionCard>
                    )}
                </main>
            </div>
        </div>
    );
};


// Insights Tab Content (Unchanged from previous versions)
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
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      <SectionCard title="Forecast Rationale (LLM-Generated Summary)" className="mb-6">
        <p className="text-lg leading-relaxed text-gray-300">{llmSummary}</p>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Feature Importance">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={featureImportance}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => `${value}% Contribution`} />
              <Bar dataKey="contribution" fill="#8884d8">
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
              <div key={index} className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-white">{feature.name}</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-24 h-3 rounded-full ${feature.contribution > 20 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${feature.contribution * 2}px` }}></div>
                  <span className="text-gray-300">{feature.contribution}% Influence</span>
                </div>
              </div>
            ))}
            <p className="text-sm text-gray-400 mt-2">
              <strong className="text-white">Interpretation:</strong> For 10 AM tomorrow, outside temperature and production schedule are the primary drivers of the forecast, increasing predicted consumption. Historical load also contributes positively.
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Forecast Deviation Analysis">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastDeviation}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="forecasted" stroke="#8884d8" name="Forecasted" dot={false} />
            <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" dot={false} />
            <Line type="monotone" dataKey="deviation" stroke="#ffc658" name="Deviation (%)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-400 mt-4">
          <strong className="text-white">Insights:</strong> Observe periods where the 'Deviation (%)' line shows significant spikes or dips, indicating where the model's predictions varied most from this. This helps identify blind spots or areas for model refinement.
        </p>
      </SectionCard>

      <SectionCard title="AI-Powered Recommendations">
          <p className="text-sm text-gray-300 italic leading-relaxed">
              {aiRecommendations}
          </p>
          <div className="flex justify-end mt-4">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                  Implement Suggestions
              </button>
          </div>
      </SectionCard>

      <SectionCard title="Ask the LLM">
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => handlePresetQuestion("Why did the forecast increase this week?")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <HelpCircle className="h-5 w-5" /> <span>Why did the forecast increase this week?</span>
          </button>
          <button
            onClick={() => handlePresetQuestion("Which factor contributed most to yesterday’s error?")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <HelpCircle className="h-5 w-5" /> <span>Which factor contributed most to yesterday’s error?</span>
          </button>
        </div>
        <p className="text-sm text-gray-400">Click a question to see the LLM's explanation.</p>
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
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200 flex flex-col">
      <SectionCard title="AI Copilot: Your Energy Insights Assistant" className="flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 border border-gray-700 rounded-lg mb-4 bg-gray-800 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center italic">Type a question to get started with your energy copilot!</p>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3/4 p-3 rounded-lg shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
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
            className="flex-grow px-4 py-2 rounded-l-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <MessageSquare className="h-5 w-5" /> <span>Send</span>
          </button>
        </div>
      </SectionCard>
    </div>
  );
};


const App = () => {
  const [activeTab, setActiveTab] = useState('Monitoring'); 
  const [currentPlant, setCurrentPlant] = useState('Select Plant');

  return (
    <div className="font-sans antialiased bg-gray-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #4a5568 #2d3748;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #4a5568;
          border-radius: 10px;
          border: 2px solid #2d3748;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background-color: #2d3748;
          border-radius: 10px;
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
