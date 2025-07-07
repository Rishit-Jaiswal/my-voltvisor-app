// All costs are in INR per kWh for Indian plants and USD per kWh for international plants.
// Real-world costs are complex and include fixed charges, demand charges, and time-of-use rates.
// These are simplified, averaged-out values for demonstration purposes.
// Last updated based on data from late 2024/early 2025.

export const COST_DATA = {
    "Pune": {
        currency: 'INR',
        currencySymbol: '₹',
        grid: 11.50, // Average commercial/industrial rate in Maharashtra
        solar: 3.00,  // PPA/LCOE for solar in India
        wind: 3.50,   // PPA/LCOE for wind in India
        hydro: 4.00   // Average cost for hydro power
    },
    "Chattanooga": {
        currency: 'USD',
        currencySymbol: '$',
        grid: 0.13, // Average commercial rate in Tennessee
        solar: 0.06,  // PPA/LCOE for solar in the US
        wind: 0.05,   // PPA/LCOE for wind in the US
        hydro: 0.07   // Average cost for hydro power
    },
    "Chennai": {
        currency: 'INR',
        currencySymbol: '₹',
        grid: 9.50,  // Average commercial/industrial rate in Tamil Nadu
        solar: 3.10,  // PPA/LCOE for solar in India
        wind: 3.60,   // PPA/LCOE for wind in India
        hydro: 4.00
    },
    "Piedimonte San Germano": {
        currency: 'EUR',
        currencySymbol: '€',
        grid: 0.22, // Average for non-household consumers in Italy
        solar: 0.08,  // PPA/LCOE for solar in Italy
        wind: 0.09,   // PPA/LCOE for wind in Italy
        hydro: 0.10
    },
    "Sindelfingen": {
        currency: 'EUR',
        currencySymbol: '€',
        grid: 0.25, // Average for non-household consumers in Germany
        solar: 0.07,  // PPA/LCOE for solar in Germany
        wind: 0.08,   // PPA/LCOE for wind in Germany
        hydro: 0.09
    }
};