import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// ... other imports
// Add this with your other imports at the top of App.js
import { COST_DATA } from './COST_DATA';import { Money } from 'lucide-react'; // Add Money or another icon for the new tab
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Label, ReferenceDot } from 'recharts';
import { ChevronDown, Droplets ,Factory, TrendingUp, Cpu, Lightbulb,Sun, Zap, Clock, Thermometer, Droplet, Calendar, Gauge, AlertTriangle, MessageSquare, HelpCircle, Eye, Cloud, Download, CloudRain, Wind, Info, BellRing, LayoutDashboard, BarChart3, Building2, Activity, Leaf, Power, PowerOff, RefreshCw, DollarSign, Sigma, Bolt, SlidersHorizontal, Settings, TestTube2 } from 'lucide-react';
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


// Helper to format date for display
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// --- FORECASTING DATA GENERATION ---

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



// EMISSION DATA GENERATION FUNCTIONS
const EMISSION_FACTOR_NON_RENEWABLE_KG_PER_KWH = 0.45;
const EMISSION_FACTOR_RENEWABLE_KG_PER_KWH = 0.02;

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
      fetch('https://energy-forecasting-production.up.railway.app/api/plants')
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
                
            </div>
      <nav className="flex items-center space-x-2 md:space-x-4 absolute left-1/2 -translate-x-1/2">
        {['Monitoring', 'Forecasting', 'Insights'].map(tab => (
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



const COST_PER_KWH = 8.50; // Simulated cost in a local currency (e.g., INR)
const PEAK_DEMAND_CHARGE_PER_KW = 450; // Cost for the highest kW reached in the period


// Generates a baseline 24-hour forecast load profile
const API_URL = 'https://energy-forecasting-production.up.railway.app/api/scenario';

// --- REACT COMPONENT FOR THE SCENARIO PLANNER TAB ---
const ParameterSlider = ({ icon: Icon, label, value, onChange, min, max, step, unit }) => (
    <div>
        <label className="flex items-center font-medium mb-2">
            {Icon && <Icon className="h-5 w-5 mr-3 text-blue-500" />}
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
            />
            <span className="text-lg font-bold w-24 text-right">{value}{unit}</span>
        </div>
    </div>
);
const ScenarioPlannerTab = ({ currentPlant, startDate, endDate }) => {
    const initialParams = {
        volChangePercent: 0,
        windPercent: 0,
        solarPercent: 0,
        hydroPercent: 0,
    };
    const PLANT_ID = currentPlant?.plantId;
    const [params, setParams] = useState(initialParams);
    const [baselineMetrics, setBaselineMetrics] = useState(null);
    const [scenarioMetrics, setScenarioMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // **Original useEffect to fetch baseline data**
    useEffect(() => {
        const fetchBaseline = async () => {
            // Set loading state for the initial data fetch
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        startDate,
                        endDate,
                        plantId: PLANT_ID,
                        volChangePercent: 0, // Baseline means no change
                        renewableEnergyChangePercent: 0, // Baseline means no change from grid default
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch baseline data. Status: ${response.status}`);
                }
                
                const data = await response.json();
                
                setBaselineMetrics({
                    totalKwh: data.totalEnergyConsumedKWh,
                    totalEmissions: data.totalCo2EmissionsKg,
                    totalCost: data.totalEnergyConsumedKWh * COST_PER_KWH, // Simplified cost calculation
                });

            } catch (e) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (PLANT_ID) { // Only fetch if a plant is selected
            fetchBaseline();
        }
    }, [PLANT_ID, startDate, endDate]); // Dependencies for re-fetching baseline

    const handleParamChange = (param, value) => {
        setParams(prev => ({ ...prev, [param]: value }));
    };

    // **Original handleRunSimulation to fetch scenario data**
    const handleRunSimulation = async () => {
        setIsLoading(true);
        setError(null);
        setScenarioMetrics(null); // Clear previous results

        const totalRenewablePercent = params.windPercent + params.solarPercent + params.hydroPercent;

        if (totalRenewablePercent > 100) {
            setError("Total renewable energy mix cannot exceed 100%.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    plantId: PLANT_ID,
                    volChangePercent: params.volChangePercent,
                    renewableEnergyChangePercent: totalRenewablePercent, // Pass the calculated sum to the API
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            setScenarioMetrics({
                totalKwh: data.totalEnergyConsumedKWh,
                totalEmissions: data.totalCo2EmissionsKg,
                totalCost: data.totalEnergyConsumedKWh * COST_PER_KWH, // Simplified cost calculation
            });

        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setParams(initialParams);
        setScenarioMetrics(null);
        setError(null);
    };

    // Calculate current totals for UI feedback
    const currentTotalRenewable = params.windPercent + params.solarPercent + params.hydroPercent;
    const costDifference = scenarioMetrics && baselineMetrics ? scenarioMetrics.totalCost - baselineMetrics.totalCost : 0;
    const costColor = costDifference > 0 ? '#EF4444' : '#22C55E';
    
    return (
        <div className="bg-gray-50/50 min-h-full">
            <div className="max-w-screen-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 xl:gap-8 gap-6">

                    {/* --- Column 1: Parameters --- */}
                    <div className="xl:col-span-1">
                        <SectionCard title="Scenario Parameters">
                            <div className="space-y-6">
                                <ParameterSlider 
                                    icon={TrendingUp} 
                                    label="Production Volume Change" 
                                    value={params.volChangePercent} 
                                    onChange={v => handleParamChange('volChangePercent', v)} 
                                    min={-50} max={50} step={5} unit="%" 
                                />
                                
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex justify-between items-baseline mb-4">
                                        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                                            <Leaf className="h-5 w-5 mr-2 text-green-500" />
                                            Renewable Energy Mix
                                        </h3>
                                        <p className="font-bold text-indigo-800 bg-indigo-100 rounded-full px-3 py-1 text-sm">
                                            {currentTotalRenewable}% Total
                                        </p>
                                    </div>
                                    <div className="space-y-5">
                                        <ParameterSlider 
                                            icon={Wind} label="Wind" value={params.windPercent}
                                            onChange={v => handleParamChange('windPercent', v)} 
                                            min={-50} max={50} step={5} unit="%"
                                        />
                                        <ParameterSlider 
                                            icon={Sun} label="Solar" value={params.solarPercent}
                                            onChange={v => handleParamChange('solarPercent', v)}
                                            min={-50} max={50} step={5} unit="%"
                                        />
                                        <ParameterSlider 
                                            icon={Droplets} label="Hydro" value={params.hydroPercent} 
                                            onChange={v => handleParamChange('hydroPercent', v)}
                                            min={-50} max={50} step={5} unit="%"
                                        />
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-6 flex items-center gap-4">
                                    <button
                                        onClick={handleRunSimulation}
                                        disabled={isLoading}
                                        className="flex-grow flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Simulating...' : 'Run Simulation'}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        title="Reset Parameters"
                                        className="p-3 bg-white border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
                                    >
                                        <RefreshCw className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* --- Column 2: Impact Analysis --- */}
                    <div className="xl:col-span-2">
                        <SectionCard title="Scenario Impact Analysis">
                            <div className="min-h-[300px] flex flex-col justify-center">
                                {error && <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg"><strong>Error:</strong> {error}</div>}
                                
                                {!scenarioMetrics && !isLoading && !error && (
                                    <div className="text-center text-gray-500 py-10">
                                        <SlidersHorizontal className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                        <p className="text-lg font-semibold text-gray-700">Adjust parameters to see their impact</p>
                                        <p className="text-sm">Click "Run Simulation" to begin.</p>
                                    </div>
                                )}

                                {isLoading && !error && (
                                    <div className="text-center text-gray-500 animate-pulse py-10">
                                        <p className="text-lg font-semibold text-gray-700">Running Simulation...</p>
                                        <p className="text-sm">Calculating new energy, cost, and emissions.</p>
                                    </div>
                                )}

                                {scenarioMetrics && baselineMetrics && !isLoading && !error && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <StatCard 
                                            title="Projected Cost Change" 
                                            value={`₹${Math.abs(costDifference).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                                            unit={costDifference > 0 ? " Increase" : " Savings"}
                                            color={costColor}
                                            icon={DollarSign}
                                        />
                                        <StatCard 
                                            title="New Energy Total" 
                                            value={scenarioMetrics.totalKwh.toLocaleString('en-IN', { maximumFractionDigits: 0 })} 
                                            unit=" kWh" 
                                            color="#3B82F6" 
                                            icon={Power} 
                                        />
                                        <StatCard 
                                            title="New CO₂ Emissions" 
                                            value={scenarioMetrics.totalEmissions.toLocaleString('en-IN', { maximumFractionDigits: 0 })} 
                                            unit=" kg" 
                                            color="#10B981" 
                                            icon={Leaf} 
                                        />
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </div>
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

  
const [startDate, setStartDate] = useState('2025-07-04');

  // Set the default end date to June 7th of the current year.
  const [endDate, setEndDate] = useState('2025-07-11');
  
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

  fetch(`https://energy-forecasting-production.up.railway.app/api/plants/${plantId}`)
    .then(res => res.json())
    .then(data => {
      setProcessList(data); // directly keep it as array of process objects
      setSelectedProcess(data[0]); // default selection
    })
    .catch(err => console.error("Failed to fetch processes", err));
}, [currentPlant]);

  useEffect(() => {
  if (!currentPlant?.plantId) return;

  fetch('https://energy-forecasting-production.up.railway.app/api/plants', {
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

  fetch('https://energy-forecasting-production.up.railway.app/api/processes', {
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
        const res = await fetch('https://energy-forecasting-production.up.railway.app/api/processes', {
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
  const response = await fetch('https://energy-forecasting-production.up.railway.app/api/processes', {
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
const fetchEnergyForPlantByDate = async (Id, date) => {
  const response = await fetch('https://energy-forecasting-production.up.railway.app/api/plants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Id,
      startDate: date,
      endDate:  date
    })
  });
  const data = await response.json();
  return data;
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
      const res = await fetch(`https://energy-forecasting-production.up.railway.app/api/plants/monthly/${currentPlant.plantId}`);
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
          const response = await fetch('https://energy-forecasting-production.up.railway.app/api/processes', {
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
      const response = await fetch('https://energy-forecasting-production.up.railway.app/api/equipment-readings', {
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
  

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await fetch('https://energy-forecasting-production.up.railway.app/api/plants');
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

  const [selectedPlantsForComparison, setSelectedPlantsForComparison] = useState([]);
  

useEffect(() => {
  if (plants && plants.length >= 3) {
    setSelectedPlantsForComparison([
      'Mahindra Vehicle Manufacturing Plant- Chakan',
      'Mahindra Vehicle Manufacturing Plant- Nashik', 
      'Mahindra Vehicle Manufacturing Plant- Haridwar',
      'Mahindra Vehicle Manufacturing Plant- Zaheerabad'
    ]);
  }
}, [plants]);
  const [comparisonProcess, setComparisonProcess] = useState('');
  const [processesForSelectionn, setProcessesForSelectionn] = useState([]);
  const [plantComparisonData, setPlantComparisonData] = useState([]);

// Add this helper function for plant total data


// FIXED: Calculate plant totals by summing all processes (like in trends code)
const fetchPlantTotalByDate = async (plantId, date, processList) => {
  try {
    let totalEnergy = 0;
    let totalCO2 = 0;

    // Sum up all processes for this plant (same approach as trends code)
    for (const process of processList) {
      const processEnergy = await fetchEnergyForProcessByDate(process.processId, date);
      totalEnergy += processEnergy;

      // Fetch CO2 for this process
      try {
        const response = await fetch('https://energy-forecasting-production.up.railway.app/api/processes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            processId: process.processId,
            startDate: date,
            endDate: date
          })
        });

        if (response.ok) {
          const data = await response.json();
          totalCO2 += data.totalCo2EmissionsKg || 0;
        }
      } catch (error) {
        console.error(`Error fetching CO2 for process ${process.processId} on ${date}:`, error);
      }
    }

    return {
      totalEnergy: parseFloat(totalEnergy.toFixed(2)),
      totalCO2: parseFloat(totalCO2.toFixed(2))
    };
  } catch (error) {
    console.error(`Error calculating plant total for ${plantId} on ${date}:`, error);
    return { totalEnergy: 0, totalCO2: 0 };
  }
};

useEffect(() => {
  const fetchComparisonData = async () => {
    if (selectedPlantsForComparison.length === 0 || !startDate || !endDate) {
      //console.log('Missing required data for comparison');
      return;
    }

    try {
      //console.log('Starting comparison data fetch...');
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateArray = [];

      // Generate date array (same as trends code)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateArray.push(new Date(d));
      }

      //console.log(`Fetching data for ${dateArray.length} days, ${selectedPlantsForComparison.length} plants`);

      // FIXED: Fetch processes for the first plant BEFORE the main loop
      let availableProcesses = processesForSelectionn;
      if (availableProcesses.length === 0 && selectedPlantsForComparison.length > 0) {
        const firstPlantId = plantNameToIdMap[selectedPlantsForComparison[0]];
        if (firstPlantId) {
          try {
            //console.log(`Fetching processes for plant ${firstPlantId}`);
            const processRes = await fetch(`https://energy-forecasting-production.up.railway.app/api/plants/${firstPlantId}`);
            if (processRes.ok) {
              const processes = await processRes.json();
              const processNames = processes.map(p => p.processName);
              setProcessesForSelectionn(processNames);
              availableProcesses = processNames;
              
              // Set default comparison process if not set
              if (!comparisonProcess && processNames.length > 0) {
                setComparisonProcess(processNames[0]);
              }
            }
          } catch (error) {
            console.error(`Error fetching processes:`, error);
          }
        }
      }

      // Initialize data structure
      const newData = dateArray.map(date => ({
        date: date.toISOString().split('T')[0]
      }));

      // Process each plant (similar to your trends logic)
      for (const plantName of selectedPlantsForComparison) {
        const plantId = plantNameToIdMap[plantName];
        
        if (!plantId) {
          console.error(`Plant ID not found for: ${plantName}`);
          continue;
        }

        //console.log(`Processing plant: ${plantName} (ID: ${plantId})`);

        // Get processes for this plant
        let plantProcesses = [];
        try {
          const processRes = await fetch(`https://energy-forecasting-production.up.railway.app/api/plants/${plantId}`);
          if (processRes.ok) {
            plantProcesses = await processRes.json();
          }
        } catch (error) {
          console.error(`Error fetching processes for plant ${plantId}:`, error);
        }

        // Fetch data for each date
        for (let i = 0; i < newData.length; i++) {
          const date = newData[i].date;
          
          try {
            // FIXED: Calculate plant total by summing all processes (like trends code)
            const plantTotal = await fetchPlantTotalByDate(plantId, date, plantProcesses);
            newData[i][`${plantName}_totalEnergy`] = plantTotal.totalEnergy;
            newData[i][`${plantName}_totalCO2`] = plantTotal.totalCO2;
            
            //console.log(`Plant total for ${plantName} on ${date}: Energy=${plantTotal.totalEnergy}, CO2=${plantTotal.totalCO2}`);

            // FIXED: Fetch process-specific data using the same approach as trends
            if (comparisonProcess) {
              const selectedProc = plantProcesses.find(p => p.processName === comparisonProcess);
              
              if (selectedProc) {
                //console.log(`Fetching process data for ${plantName} - ${comparisonProcess} on ${date}`);
                
                // Fetch process energy
                const processEnergy = await fetchEnergyForProcessByDate(selectedProc.processId, date);
                newData[i][`${plantName}_${comparisonProcess}`] = processEnergy;
                
                // Fetch process CO2 emissions
                try {
                  const procRes = await fetch('https://energy-forecasting-production.up.railway.app/api/processes', {
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
                    // FIXED: Use the correct property name
                    const processCO2 = procData.totalCo2EmissionsKg || 0;
                    newData[i][`${plantName}_${comparisonProcess}_CO2`] = processCO2;
                    
                    //console.log(`Process data for ${plantName} - ${comparisonProcess} on ${date}: Energy=${processEnergy}, CO2=${processCO2}`);
                  } else {
                    console.warn(`Failed to fetch process CO2 for ${plantName} - ${comparisonProcess} on ${date}`);
                    newData[i][`${plantName}_${comparisonProcess}_CO2`] = 0;
                  }
                } catch (error) {
                  console.error(`Error fetching process CO2 for ${plantName} - ${comparisonProcess} on ${date}:`, error);
                  newData[i][`${plantName}_${comparisonProcess}_CO2`] = 0;
                }
              } else {
                console.warn(`Process ${comparisonProcess} not found for plant ${plantName}`);
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

      //console.log('Final comparison data:', newData);
      setPlantComparisonData(newData);
      
    } catch (error) {
      console.error('Error in fetchComparisonData:', error);
    }
  };

  fetchComparisonData();
}, [selectedPlantsForComparison, startDate, endDate, comparisonProcess, plantNameToIdMap]);
  
  // New state for Graph section
  const [graphView, setGraphView] = useState('Energy Trends per Process');
  
  // Generic handler for period changes
  
  const subNavItems = [
        { name: 'Live', icon: Activity },
        { name: 'Trends', icon: BarChart3 },
        { name: 'Emissions', icon: Cloud },
        { name: 'Cost Analysis', icon: DollarSign },
        { name: 'Comparison', icon: Building2 }, // Add the new sub-tab
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
                                        <p className="text-green-600">Renewable: {(totalRenewable).toFixed(2)}% ({(processEnergy*totalRenewable/100).toFixed(2)} kWh)</p>
                                        <p className="text-orange-600">Non-Renewable: {(nonRenewable).toFixed(2)}% ({(processEnergy-(processEnergy*totalRenewable/100)).toFixed(2)} kWh)</p>
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
                    {activeSubTab === 'Cost Analysis' && (
                            <CostAnalysisSubTab
                                currentPlant={currentPlant}
                                totalPlantEnergy={totalPlantEnergy}
                                renewableBreakdown={renewableBreakdown}
                                processList={processList}
                                historicalData={historicalData}
                            />
                    )}
                    {activeSubTab === 'Comparison' && (
                      <div className="space-y-6">
                            <SectionCard title="Plants Comparison">
                              <div className="flex flex-col space-y-4 mb-4">
                                <Dropdown label="Plants for Comparison" options={plants} selected={selectedPlantsForComparison} onChange={setSelectedPlantsForComparison} isMulti={true} />
                              </div>
                               
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
                    )}
                </main>
            </div>
        </div>
    </div>
  );
};

const AlertAndAnomalyContent = ({currentPlant}) => {
    const plantId = currentPlant?.plantId;
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Debug logs
    console.log('DEBUG: currentPlant:', currentPlant);
    console.log('DEBUG: plantId extracted:', plantId);

    useEffect(() => {
        const fetchAlerts = async () => {
            console.log('DEBUG: fetchAlerts called with plantId:', plantId);
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('https://bot-k83f.onrender.com/predictor/prediction/80b6ed2089824de4943bc001186ea85f', 
                  {
                    method:'GET',
                    headers: {
                        'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOWM5YzEwMDE2YzkxNDU3N2JiZGE0YmE0MTM2MWU0MDAifQ.oXm8AW5PTpK_7OgX0I8mYdFSYjEe2CoZ-2OBwYAVUME',
                        'Content-Type': 'application/json'
                    }
                });

                console.log('DEBUG: API Response status:', response.status);
                console.log('DEBUG: API Response ok:', response.ok);

                if (!response.ok) {
                    throw new Error(`API call failed with status: ${response.status}`);
                }

                const data = await response.json();
                console.log('DEBUG: Raw API data:', data);
                console.log('DEBUG: Number of predictions:', data.predictions?.length || 0);

                if (data.predictions && data.predictions.length > 0) {
                    console.log('DEBUG: First prediction sample:', data.predictions[0]);
                    console.log('DEBUG: First prediction processId:', data.predictions[0]?.prediction?.processId);
                    
                    // Log all processIds to understand the pattern
                    data.predictions.forEach((alert, index) => {
                        const processId = alert.prediction.processId;
                        const splitResult = processId.split('-')[0];
                        console.log(`DEBUG: Prediction ${index}: processId=${processId}, split result=${splitResult}`);
                    });
                }
                
                const formattedAlerts = data.predictions
                    .filter(alert => {
                        const alertPlantId = alert.prediction.processId.split('-')[0];
                        const matches = alertPlantId === plantId;
                        console.log(`DEBUG: Filtering - alertPlantId: ${alertPlantId}, plantId: ${plantId}, matches: ${matches}`);
                        return matches;
                    })
                    .map(alert => ({
                        id: alert._id,
                        severity: alert.prediction.alertType.charAt(0).toUpperCase() + alert.prediction.alertType.slice(1).toLowerCase(),
                        timestamp: new Date(alert.prediction.date),
                        type: alert.prediction.category,
                        description: alert.prediction.description,
                        affectedProcess: alert.prediction.equipmentName,
                        status: alert.prediction.acknowledged ? 'Acknowledged' : 'New',
                        recommendation: alert.prediction.recommendedActions,
                    }));

                console.log('DEBUG: Formatted alerts after filtering:', formattedAlerts);
                console.log('DEBUG: Number of alerts after filtering:', formattedAlerts.length);

                // Sort by status ('New' first), then by timestamp (most recent first)
                const sortedAlerts = formattedAlerts.sort((a, b) => {
                    if (a.status === 'New' && b.status !== 'New') return -1;
                    if (a.status !== 'New' && b.status === 'New') return 1;
                    return b.timestamp - a.timestamp;
                });
                
                setAlerts(sortedAlerts);

            } catch (err) {
                console.error('DEBUG: Error in fetchAlerts:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (plantId) {
            fetchAlerts();
        } else {
            console.log('DEBUG: No plantId provided, clearing alerts');
            setAlerts([]);
            setLoading(false);
        }

    }, [plantId]);

    // Rest of your component code remains the same...
    const updateAlertStatus = (id, newStatus) => {
        setAlerts(prevAlerts => {
            const updatedAlerts = prevAlerts.map(alert =>
                alert.id === id ? { ...alert, status: newStatus } : alert
            );
            return updatedAlerts.sort((a, b) => {
                if (a.status === 'New' && b.status !== 'New') return -1;
                if (a.status !== 'New' && b.status === 'New') return 1;
                return b.timestamp - a.timestamp;
            });
        });
    };
    
    const filteredAlerts = useMemo(() => alerts
        .filter(alert => filter === 'All' || alert.severity === filter)
        .filter(alert =>
            alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.affectedProcess.toLowerCase().includes(searchTerm.toLowerCase())
        ), [alerts, filter, searchTerm]);

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

    const alertCounts = useMemo(() => ({
        Critical: alerts.filter(a => a.severity === 'Critical' && a.status === 'New').length,
        Warning: alerts.filter(a => a.severity === 'Warning' && a.status === 'New').length,
        Info: alerts.filter(a => a.severity === 'Info' && a.status === 'New').length,
    }), [alerts]);

    console.log('DEBUG: Final alert counts:', alertCounts);
    console.log('DEBUG: Final filtered alerts:', filteredAlerts);

    if (loading) {
        return <div className="text-center p-8">Loading alerts...</div>;
    }
    
    if (error) {
        return <div className="text-center p-8 text-red-600">Error: {error}</div>;
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
                            placeholder="Search by description or equipment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-3700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                                            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1"/>{new Date(alert.timestamp).toLocaleDateString()}</span>
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
                            <p className="text-sm">{!plantId ? "Please select a plant to view alerts." : "There are no alerts that match your current filter criteria."}</p>
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
    const [processEnergy, setProcessEnergy] = useState(0);
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
        fetch(`https://energy-forecasting-production.up.railway.app/api/plants/${plantId}`)
            .then(res => res.json())
            .then(data => {
                setProcessList(data);
                if (data.length > 0) {
                    setSelectedProcess(data[0]);
                }
            })
            .catch(err => console.error("Failed to fetch processes", err));
    }, [currentPlant]);

    useEffect(() => {
    if (!currentPlant?.plantId) return;

    fetch('https://energy-forecasting-production.up.railway.app/api/plants/forecasted', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plantId,
        startDate,
        endDate
      })
    })
      .then(res => res.json())
      .then(setTotalPlantEnergy)
      .catch(err => console.error('Error fetching total energy:', err));
  }, [currentPlant, startDate, endDate]);

  useEffect(() => {
  if (!selectedProcess?.processId || !startDate || !endDate) return;

  fetch('https://energy-forecasting-production.up.railway.app/api/processes/forecasted', {
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
    })
    .catch(err => console.error('Error fetching process energy/emissions:', err));
}, [selectedProcess, startDate, endDate]);

  useEffect(() => {
  const fetchEquipmentData = async () => {
    if (!selectedProcess?.processId) return;

    try {
      const response = await fetch('https://energy-forecasting-production.up.railway.app/api/equipment-readings/forecasted', {
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
        const res = await fetch('https://energy-forecasting-production.up.railway.app/api/processes/forecasted', {
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

    // --- Cost Calculation Logic ---
    const location = currentPlant?.city;
    const costs = location ? COST_DATA[location] : null;
    let totalCost = 0, costFromGrid = 0, costFromRenewables = 0, avgCostPerKwh = 0, currencySymbol = '$';
    
    if (costs) {
        currencySymbol = costs.currencySymbol;
        costFromGrid = (totalPlantEnergy.toFixed(2) - renewableBreakdown.total) * costs.grid;
        const costFromWind = renewableBreakdown.wind * costs.wind;
        const costFromSolar = renewableBreakdown.solar * costs.solar;
        const costFromHydro = renewableBreakdown.hydro * costs.hydro;
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
        { name: 'Wind', cost: parseFloat((renewableBreakdown.wind * costs.wind).toFixed(2)), fill: '#82ca9d' },
        { name: 'Solar', cost: parseFloat((renewableBreakdown.solar * costs.solar).toFixed(2)), fill: '#fdd835' },
        { name: 'Hydro', cost: parseFloat((renewableBreakdown.hydro * costs.hydro).toFixed(2)), fill: '#4fc3f7' },
    ] : [];

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
                                <p className="text-5xl font-bold mb-2" style={{color: TM_DARK_BLUE}}>{processEnergy.toFixed(2)} <span className="text-3xl" style={{color: TM_GRAY_TEXT}}>kWh</span></p>
                                <p className="text-sm mb-4" style={{color: TM_GRAY_TEXT}}>Total Energy Consumption for {selectedProcess?.processName}</p>
                                    
                                    <h4 className="text-lg font-semibold mb-2" style={{color: TM_DARK_BLUE}}>Equipment Load</h4>
                                    <div className="flex-grow overflow-y-auto pr-2" style={{ maxHeight: '200px' }}>
                                        {/* Equipment list rendering here, now properly filtered by equipmentId */}
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
                        <AlertAndAnomalyContent currentPlant={currentPlant} />
                    )}
                    {activeSubTab === 'Scenario Planner' && (
                        <ScenarioPlannerTab currentPlant={currentPlant} startDate={startDate} endDate={endDate} />
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
        const simulatedResponse =  `To optimize energy consumption, consider:
1. Replace high-emission equipment in the Paint Shop—such as older HVAC and curing systems—with energy-efficient alternatives or water-based solutions, as this process shows consistently high CO₂ output.

2. Shift welding operations to daytime hours when solar and wind generation is at its peak, since welding currently relies heavily on non-renewable energy sources.

3. Increase wind energy allocation to the stamping process, which already performs relatively well, to further lower its 24% non-renewable energy dependency and make it a model for clean energy use.

4. Install battery-backed solar units for Quality Control & Testing, where emissions are relatively high, to stabilize load and reduce utility supply dependence during testing surges.

5. Use predictive load balancing on assembly lines to defer non-urgent operations away from high carbon-intensity hours and ensure renewable energy is allocated where emissions are worst.`;
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

        <SectionCard title="Prediction Breakdown">
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
            {/* <p className="text-sm text-gray-500 mt-2">
              <strong style={{color: TM_DARK_BLUE}}>Interpretation:</strong> For 10 AM tomorrow, outside temperature and production schedule are the primary drivers of the forecast, increasing predicted consumption. Historical load also contributes positively.
            </p> */}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="AI-Powered Recommendations">
          <p className="text-sm italic leading-relaxed whitespace-pre-line" style={{color: TM_GRAY_TEXT}}>
              {aiRecommendations}
          </p>
          {/* <div className="flex justify-end mt-4">
              <button className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity duration-200`} style={{backgroundColor: TM_RED}}>
                  Implement Suggestions
              </button>
          </div> */}
      </SectionCard>
    </div>
  );
};

// AI Copilot Tab Content (Unchanged from previous versions)

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
        
      </main>
    </div>
  );
};

export default App;