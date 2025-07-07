import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { SectionCard, StatCard, CustomTooltip } from './App'; // Assuming these are exported from App.js
import { COST_DATA } from './COST_DATA'; // Import the cost data
import { DollarSign, Power, Wind, Droplet, Sun } from 'lucide-react';

const COLORS = ['#ef5350', '#82ca9d', '#fdd835', '#4fc3f7']; // Grid, Wind, Solar, Hydro

export const CostAnalysisSubTab = ({ currentPlant, totalPlantEnergy, renewableBreakdown, processList, historicalData }) => {
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
        { name: 'Grid (Non-Renewable)', cost: parseFloat(costFromGrid.toFixed(2)), fill: COLORS[0] },
        { name: 'Wind', cost: parseFloat(costFromWind.toFixed(2)), fill: COLORS[1] },
        { name: 'Solar', cost: parseFloat(costFromSolar.toFixed(2)), fill: COLORS[2] },
        { name: 'Hydro', cost: parseFloat(costFromHydro.toFixed(2)), fill: COLORS[3] },
    ];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(value);
    };
    
    // Calculate cost per process
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
                    <StatCard title="Cost from Grid" value={formatCurrency(costFromGrid)} color="#ef5350" icon={Power} />
                    <StatCard title="Cost from Renewables" value={formatCurrency(costFromWind + costFromSolar + costFromHydro)} color="#22C55E" icon={Wind} />
                    <StatCard title="Avg. Cost / kWh" value={formatCurrency(totalPlantEnergy > 0 ? totalCost / totalPlantEnergy : 0)} color="#F59E0B" icon={Power} />
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

            <SectionCard title="Estimated Cost per Process">
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
            </SectionCard>
        </div>
    );
};