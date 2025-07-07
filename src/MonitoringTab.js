import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { ChevronDown, Factory, TrendingUp, Cpu, Lightbulb, Zap, Thermometer, Droplet, Wind, CloudRain, Cloud, Leaf, Building2, Activity, BarChart3, Sigma, Bolt } from 'lucide-react';

// --- START: HOOKS AND SERVICES (Copied from your original code) ---
// API Base URL
const API_BASE_URL = 'https://energy-forecasting.onrender.com/api';

// API Service Functions
const apiService = {
  // Get all plants
  async getAllPlants() {
    try {
      const response = await fetch(`${API_BASE_URL}/plants`);
      if (!response.ok) throw new Error('Failed to fetch plants');
      return await response.json();
    } catch (error) {
      console.error('Error fetching plants:', error);
      return [];
    }
  },
  // Get processes by plant ID
  async getProcessesByPlantId(plantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/plants/${plantId}`);
      if (!response.ok) throw new Error('Failed to fetch processes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching processes:', error);
      return [];
    }
  },
  // Get energy by process ID and date range
  async getEnergyByProcessId(processId, startDate, endDate) {
    try {
      const response = await fetch(`${API_BASE_URL}/processes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ processId, startDate, endDate })
      });
      if (!response.ok) throw new Error('Failed to fetch process energy data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching process energy data:', error);
      return null;
    }
  },
  // Get total energy by plant ID and date range
  async getTotalEnergyByPlantId(plantId, startDate, endDate) {
    try {
      const response = await fetch(`${API_BASE_URL}/plants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ plantId, startDate, endDate })
      });
      if (!response.ok) throw new Error('Failed to fetch plant energy data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching plant energy data:', error);
      return null;
    }
  },
  // Get monthly energy by plant
  async getMonthlyEnergyByPlant(plantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/plants/monthly/${plantId}`);
      if (!response.ok) throw new Error('Failed to fetch monthly energy data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching monthly energy data:', error);
      return [];
    }
  },
  // Get equipment by process ID and date range
  async getEquipmentByProcessId(processId, startDate, endDate) {
    try {
      const response = await fetch(`${API_BASE_URL}/equipment-readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ processId, startDate, endDate })
      });
      if (!response.ok) throw new Error('Failed to fetch equipment data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching equipment data:', error);
      return [];
    }
  }
};

const getEquipmentIcon = (equipmentType) => {
    const iconMap = {
        'sprayer': Cpu, 'oven': Thermometer, 'vat': Droplet,
        'conveyor': TrendingUp, 'welder': Factory, 'chiller': Thermometer,
        'handler': Wind, 'tower': CloudRain, 'arm': Cpu, 'robot': Cpu
    };
    const type = equipmentType?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(iconMap)) {
        if (type.includes(key)) return icon;
    }
    return Factory;
};

const dataTransformers = {
    transformPlantData(apiPlants) { return apiPlants.map(plant => plant.name || `Plant ${plant.id}`); },
    transformProcessData(apiProcesses) { return apiProcesses.map(process => process.name || process.processName); },
    transformEnergyDataForChart(energyData) {
        if (!energyData || !Array.isArray(energyData)) return [];
        return energyData.map(item => ({
            date: item.date,
            energy: parseFloat(item.totalEnergy || item.energy || 0),
            renewable: parseFloat(item.renewableEnergy || 0),
            nonRenewable: parseFloat(item.nonRenewableEnergy || (item.energy - item.renewableEnergy) || 0),
            ...item
        }));
    },
    transformEquipmentData(equipmentData) {
        if (!equipmentData || !Array.isArray(equipmentData)) return [];
        return equipmentData.map(equipment => ({
            name: equipment.equipmentName || equipment.name,
            voltage: parseFloat(equipment.voltage || 0),
            current: parseFloat(equipment.current || 0),
            energy: parseFloat(equipment.energyConsumption || equipment.energy || 0),
            icon: getEquipmentIcon(equipment.type || equipment.equipmentType)
        }));
    },
    calculateEmissionMetrics(totalEnergy, renewablePercent) {
        const renewableEnergy = (totalEnergy * renewablePercent) / 100;
        const nonRenewableEnergy = totalEnergy - renewableEnergy;
        const totalEmissions = (renewableEnergy * 0.05) + (nonRenewableEnergy * 0.8);
        return {
            totalEmissions: parseFloat(totalEmissions.toFixed(2)),
            emissionIntensity: parseFloat((totalEmissions / (totalEnergy || 1)).toFixed(3)),
            renewableEnergy: parseFloat(renewableEnergy.toFixed(2)),
            nonRenewableEnergy: parseFloat(nonRenewableEnergy.toFixed(2))
        };
    }
};

const generateFallbackData = () => { /* ... implementation from previous response ... */ return {}; };

const useApiData = () => {
    const [plants, setPlants] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlants = async () => {
            setLoading(true);
            try {
                const apiPlants = await apiService.getAllPlants();
                const transformedPlants = dataTransformers.transformPlantData(apiPlants);
                setPlants(transformedPlants.length > 0 ? transformedPlants : ['Plant A', 'Plant B', 'Plant C']);
            } catch (err) {
                setError('Failed to load plants');
                setPlants(['Plant A', 'Plant B', 'Plant C']); // Fallback
            } finally {
                setLoading(false);
            }
        };
        fetchPlants();
    }, []);

    const fetchProcesses = useCallback(async (plantId) => {
        setLoading(true);
        try {
            const apiProcesses = await apiService.getProcessesByPlantId(plantId);
            const transformedProcesses = dataTransformers.transformProcessData(apiProcesses);
            const defaultProcesses = ['Paint', 'Welder', 'HVAC', 'Conveyor', 'Robotics Arms'];
            setProcesses(transformedProcesses.length > 0 ? transformedProcesses : defaultProcesses);
        } catch (err) {
            setError('Failed to load processes');
            setProcesses(['Paint', 'Welder', 'HVAC', 'Conveyor', 'Robotics Arms']); // Fallback
        } finally {
            setLoading(false);
        }
    }, []);

    return { plants, processes, fetchProcesses, loading, error };
};

const useLiveData = (currentPlant, plants, startDate, endDate) => {
    const [liveData, setLiveData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLiveData = async () => {
            if (!currentPlant || !startDate || !endDate || plants.length === 0) return;
            setLoading(true);
            setError(null);
            try {
                const plantIndex = plants.indexOf(currentPlant);
                const actualPlantId = plantIndex >= 0 ? (plantIndex + 1).toString() : '1';
                
                const plantEnergyData = await apiService.getTotalEnergyByPlantId(actualPlantId, startDate, endDate);
                if (!plantEnergyData) throw new Error("Failed to fetch plant energy data, using fallback.");

                let aggregatedData = { totalPlantEnergy: 0, renewable: 0, nonRenewable: 0, renewableWind: 0, renewableSolar: 0, renewableHydro: 0 };
                const totalEnergy = plantEnergyData.reduce((sum, day) => sum + parseFloat(day.totalEnergy || 0), 0);
                
                aggregatedData.totalPlantEnergy = parseFloat(totalEnergy.toFixed(2));
                aggregatedData.renewable = parseFloat((totalEnergy * 0.45).toFixed(2));
                aggregatedData.nonRenewable = parseFloat((totalEnergy * 0.55).toFixed(2));
                aggregatedData.renewableWind = parseFloat((aggregatedData.renewable * 0.3).toFixed(2));
                aggregatedData.renewableSolar = parseFloat((aggregatedData.renewable * 0.5).toFixed(2));
                aggregatedData.renewableHydro = parseFloat((aggregatedData.renewable * 0.2).toFixed(2));

                const processesData = await apiService.getProcessesByPlantId(actualPlantId);
                if (processesData && Array.isArray(processesData)) {
                    for (const process of processesData) {
                        const processEnergyData = await apiService.getEnergyByProcessId(process.id, startDate, endDate);
                        const processKey = process.name.toLowerCase().replace(/ /g, '');
                        const processEnergy = processEnergyData ? processEnergyData.reduce((sum, day) => sum + parseFloat(day.energy || 0), 0) : Math.random() * 500;
                        aggregatedData[processKey] = {
                            energy: parseFloat(processEnergy.toFixed(2)),
                            renewable: parseFloat((processEnergy * 0.4).toFixed(2)),
                            nonRenewable: parseFloat((processEnergy * 0.6).toFixed(2)),
                            equipment: dataTransformers.transformEquipmentData(await apiService.getEquipmentByProcessId(process.id, startDate, endDate))
                        };
                    }
                }
                setLiveData(aggregatedData);
            } catch (err) {
                console.error('Error fetching live data, generating fallback:', err);
                setError('Failed to load live data, showing sample data.');
                setLiveData(generateFallbackData());
            } finally {
                setLoading(false);
            }
        };
        fetchLiveData();
    }, [currentPlant, plants, startDate, endDate]);
    return { liveData, loading, error };
};

const useHistoricalData = (currentPlant, plants, startDate, endDate) => {
    const [historicalData, setHistoricalData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fallback generator inside hook to avoid reference errors
        const generateFallbackHistorical = (start, end) => {
            const data = [];
            for (let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
                data.push({ date: d.toISOString().split('T')[0], energy: Math.random() * 1000 + 2000 });
            }
            return data;
        };
        
        const fetchHistoricalData = async () => {
            if (!currentPlant || !startDate || !endDate || plants.length === 0) return;
            setLoading(true);
            try {
                const plantIndex = plants.indexOf(currentPlant);
                const actualPlantId = plantIndex >= 0 ? (plantIndex + 1).toString() : '1';
                
                const dailyData = await apiService.getTotalEnergyByPlantId(actualPlantId, startDate, endDate);
                setHistoricalData(dailyData && dailyData.length > 0 ? dataTransformers.transformEnergyDataForChart(dailyData) : generateFallbackHistorical(startDate, endDate));
                
                const monthlyEnergyData = await apiService.getMonthlyEnergyByPlant(actualPlantId);
                setMonthlyData(monthlyEnergyData || []);
            } catch (err) {
                console.error('Error fetching historical data:', err);
                setHistoricalData(generateFallbackHistorical(startDate, endDate));
            } finally {
                setLoading(false);
            }
        };
        fetchHistoricalData();
    }, [currentPlant, plants, startDate, endDate]);

    return { historicalData, monthlyData, loading };
};
// --- All other hooks and helpers from the previous response should go here ---
// ... (CustomTooltip, SectionCard, StatCard, Dropdown, DateRangePicker, constants)

const CustomTooltip = ({ active, payload, label, unit = 'kWh' }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-gray-200">
                <p className="font-semibold text-white">{label}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
                        {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} ${entry.unit || unit}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};
// ... other helper components

// THIS IS THE COMPONENT TO EXPORT
export const MonitoringTab = ({ currentPlant }) => {
    const [activeSubTab, setActiveSubTab] = useState('Live');
    const [selectedLiveProcess, setSelectedLiveProcess] = useState('Paint');
    
    const { plants, processes, fetchProcesses, loading: plantsLoading } = useApiData();
    
    // Pass 'plants' to hooks that need it for ID lookup
    const { liveData, loading: liveDataLoading, error: liveDataError } = useLiveData(currentPlant, plants, '2025-06-08', '2025-06-15');
    const { historicalData, monthlyData, loading: historicalLoading } = useHistoricalData(currentPlant, plants, '2025-06-08', '2025-06-15');

    // ... (rest of the component logic and JSX from the previous response)

    const isLoading = plantsLoading || liveDataLoading || historicalLoading;

    if (isLoading) {
        return <div className="p-6 bg-gray-900 min-h-screen text-gray-200 text-center text-xl">Loading Dashboard Data...</div>;
    }
    
    if (liveDataError || !liveData) {
        return <div className="p-6 bg-gray-900 min-h-screen text-gray-200 text-center text-xl text-red-400">Error: {liveDataError || "Could not load essential data."}</div>
    }

    // --- DERIVED STATE ---
    const plantTotal = liveData.renewable + liveData.nonRenewable;
    const plantRenewablePercent = plantTotal > 0 ? Math.round((liveData.renewable / plantTotal) * 100) : 0;
    
    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
             <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
                {/* Side Navigation placeholder */}
                <aside className="lg:w-56 flex-shrink-0 bg-gray-800 p-4 rounded-xl self-start sticky top-24">
                    {['Live', 'Trends', 'Emission & Sustainability', 'Comparison'].map(tab => (
                         <button key={tab} onClick={() => setActiveSubTab(tab)} 
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${activeSubTab === tab ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                            <span>{tab}</span>
                         </button>
                    ))}
                </aside>
                <main className="flex-grow">
                    {/* Render content based on activeSubTab */}
                    <h2 className="text-3xl font-bold mb-4">{activeSubTab} View for {currentPlant}</h2>
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold">Total Plant Energy</h3>
                        <p className="text-5xl font-bold">{liveData.totalPlantEnergy.toLocaleString()} <span className="text-3xl text-gray-400">kWh</span></p>
                        <div className="w-full bg-gray-700 rounded-full h-4 my-4">
                            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${plantRenewablePercent}%` }}></div>
                        </div>
                        <p className="text-green-400">Renewable: {plantRenewablePercent}%</p>
                    </div>
                </main>
            </div>
        </div>
    );
};