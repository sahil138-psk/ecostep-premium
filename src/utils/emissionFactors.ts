import { Category } from '../types';

export const EMISSION_FACTORS = {
  transport: {
    petrolCar: { label: 'Petrol Car', factor: 0.18, unit: 'km' },
    dieselCar: { label: 'Diesel Car', factor: 0.17, unit: 'km' },
    hybridCar: { label: 'Hybrid Car', factor: 0.10, unit: 'km' },
    electricCar: { label: 'Electric Vehicle (EV)', factor: 0.04, unit: 'km' },
    bus: { label: 'Bus Ride', factor: 0.08, unit: 'km' },
    train: { label: 'Train / Metro', factor: 0.03, unit: 'km' },
    shortFlight: { label: 'Short-haul Flight (<1500km)', factor: 0.15, unit: 'km' },
    longFlight: { label: 'Long-haul Flight (>=1500km)', factor: 0.11, unit: 'km' },
    active: { label: 'Walk / Bicycle', factor: 0.0, unit: 'km' },
  },
  energy: {
    electricity: { label: 'Electricity Grid', factor: 0.38, unit: 'kWh' },
    naturalGas: { label: 'Natural Gas', factor: 0.18, unit: 'kWh' },
    heatingOil: { label: 'Heating Oil', factor: 0.26, unit: 'kWh' },
    water: { label: 'Water Usage', factor: 0.0003, unit: 'L' },
  },
  food: {
    heavyMeat: { label: 'Meat-Heavy Meal (Beef/Lamb)', factor: 3.3, unit: 'meals' },
    lightMeat: { label: 'Average Meat Meal (Poultry/Pork)', factor: 1.5, unit: 'meals' },
    pescatarian: { label: 'Pescatarian Meal (Fish)', factor: 1.1, unit: 'meals' },
    vegetarian: { label: 'Vegetarian Meal', factor: 0.8, unit: 'meals' },
    vegan: { label: 'Vegan / Plant-Based Meal', factor: 0.4, unit: 'meals' },
  },
  consumption: {
    smartphone: { label: 'New Smartphone', factor: 60.0, unit: 'devices' },
    laptop: { label: 'New Laptop/Computer', factor: 250.0, unit: 'devices' },
    clothing: { label: 'New Clothing Item', factor: 15.0, unit: 'items' },
    landfillWaste: { label: 'Unsorted Waste (Landfill)', factor: 0.5, unit: 'kg' },
    compostedWaste: { label: 'Composted/Recycled Waste', factor: 0.05, unit: 'kg' },
  }
} as const;

export type TransportSubtype = keyof typeof EMISSION_FACTORS.transport;
export type EnergySubtype = keyof typeof EMISSION_FACTORS.energy;
export type FoodSubtype = keyof typeof EMISSION_FACTORS.food;
export type ConsumptionSubtype = keyof typeof EMISSION_FACTORS.consumption;

export type Subtype = TransportSubtype | EnergySubtype | FoodSubtype | ConsumptionSubtype;

export function getFactorDetails(category: Category, subtype: string) {
  const cat = EMISSION_FACTORS[category] as Record<string, { label: string; factor: number; unit: string }>;
  return cat[subtype] || { label: subtype, factor: 0, unit: 'units' };
}

export function calculateCO2(category: Category, subtype: string, value: number): number {
  const details = getFactorDetails(category, subtype);
  return Number((value * details.factor).toFixed(2));
}

// Simulated offsets in kg CO2 saved per unit
export const OFFSET_FACTORS = {
  tree: { label: 'Plant a Tree', factor: 22.0, unit: 'trees', cost: 5, description: 'Saves ~22kg of CO2 per year over its lifetime.' },
  solar: { label: 'Clean Energy Credits', factor: 0.4, unit: 'kWh', cost: 0.1, description: 'Offsets fossil-fuel electricity with renewable energy generation.' },
  ocean: { label: 'Ocean Cleanup Support', factor: 1.2, unit: 'kg', cost: 2, description: 'Removes plastic waste which reduces petrochemical degradation emissions.' }
};
