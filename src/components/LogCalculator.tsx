import React, { useState } from 'react';
import { Category, EmissionLog } from '../types';
import { EMISSION_FACTORS, calculateCO2 } from '../utils/emissionFactors';

interface LogCalculatorProps {
  onAddLog: (log: Omit<EmissionLog, 'id' | 'date'>) => void;
  onAwardXP: (amount: number) => void;
}

export const LogCalculator: React.FC<LogCalculatorProps> = ({ onAddLog, onAwardXP }) => {
  const [activeTab, setActiveTab] = useState<Category>('transport');
  
  // Specific Form states
  const [transportSubtype, setTransportSubtype] = useState<keyof typeof EMISSION_FACTORS.transport>('petrolCar');
  const [transportDist, setTransportDist] = useState<number>(20);

  const [energySubtype, setEnergySubtype] = useState<keyof typeof EMISSION_FACTORS.energy>('electricity');
  const [energyAmount, setEnergyAmount] = useState<number>(100);

  const [foodSubtype, setFoodSubtype] = useState<keyof typeof EMISSION_FACTORS.food>('lightMeat');
  const [foodMeals, setFoodMeals] = useState<number>(3);

  const [consumptionSubtype, setConsumptionSubtype] = useState<keyof typeof EMISSION_FACTORS.consumption>('clothing');
  const [consumptionValue, setConsumptionValue] = useState<number>(1);

  // Success indicator state
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [savedCO2, setSavedCO2] = useState<number>(0);

  // Get current active calculations for preview
  const getCurrentCO2Preview = (): number => {
    switch (activeTab) {
      case 'transport':
        return calculateCO2('transport', transportSubtype, transportDist);
      case 'energy':
        return calculateCO2('energy', energySubtype, energyAmount);
      case 'food':
        return calculateCO2('food', foodSubtype, foodMeals);
      case 'consumption':
        return calculateCO2('consumption', consumptionSubtype, consumptionValue);
      default:
        return 0;
    }
  };

  const getActiveUnit = (): string => {
    switch (activeTab) {
      case 'transport':
        return EMISSION_FACTORS.transport[transportSubtype].unit;
      case 'energy':
        return EMISSION_FACTORS.energy[energySubtype].unit;
      case 'food':
        return EMISSION_FACTORS.food[foodSubtype].unit;
      case 'consumption':
        return EMISSION_FACTORS.consumption[consumptionSubtype].unit;
      default:
        return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let activityName = '';
    let value = 0;
    let subtype = '';

    if (activeTab === 'transport') {
      subtype = transportSubtype;
      value = transportDist;
      activityName = `${EMISSION_FACTORS.transport[transportSubtype].label} Travel`;
    } else if (activeTab === 'energy') {
      subtype = energySubtype;
      value = energyAmount;
      activityName = `${EMISSION_FACTORS.energy[energySubtype].label} Usage`;
    } else if (activeTab === 'food') {
      subtype = foodSubtype;
      value = foodMeals;
      activityName = `${EMISSION_FACTORS.food[foodSubtype].label} Intake`;
    } else if (activeTab === 'consumption') {
      subtype = consumptionSubtype;
      value = consumptionValue;
      activityName = `${EMISSION_FACTORS.consumption[consumptionSubtype].label}`;
    }

    const co2 = calculateCO2(activeTab, subtype, value);
    const unit = getActiveUnit();

    // Trigger parent log dispatch
    onAddLog({
      category: activeTab,
      activityName,
      value,
      unit,
      co2,
      details: `${value} ${unit} logged`
    });

    // Award standard XP for tracking action
    onAwardXP(15); 

    // Visual trigger
    setSavedCO2(co2);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <h2 className="section-title">
        <span>🌱</span> Carbon Emission Tracker
      </h2>
      
      {/* Category selector */}
      <div className="calc-tabs">
        {(['transport', 'energy', 'food', 'consumption'] as Category[]).map((tab) => (
          <button
            key={tab}
            className={`calc-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setShowSuccess(false);
            }}
          >
            {tab === 'transport' && '🚗 Transportation'}
            {tab === 'energy' && '⚡ Home Utilities'}
            {tab === 'food' && '🥗 Diet & Meals'}
            {tab === 'consumption' && '🛍️ Shopping & Waste'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        {/* SUCCESS NOTIFICATION MODAL */}
        {showSuccess && (
          <div 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(8, 18, 14, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '16px',
              border: '1px solid var(--color-primary)',
              animation: 'fadeIn 0.25s ease-out',
              zIndex: 10
            }}
          >
            <span style={{ fontSize: '3rem', animation: 'pulse 1s infinite' }}>🌍</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginTop: '1rem' }}>
              Footprint Logged!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Added <strong>+{savedCO2.toFixed(1)} kg CO₂e</strong> to dashboard.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#22d3ee', fontWeight: 600, marginTop: '0.5rem' }}>
              ✨ +15 XP Awarded!
            </p>
          </div>
        )}

        {/* Dynamic Calculator Inputs based on selected category tab */}
        {activeTab === 'transport' && (
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="trans-mode">Mode of Transportation</label>
              <select 
                className="form-select" 
                id="trans-mode"
                value={transportSubtype}
                onChange={(e) => setTransportSubtype(e.target.value as any)}
              >
                {Object.entries(EMISSION_FACTORS.transport).map(([key, details]) => (
                  <option key={key} value={key}>{details.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="trans-dist">
                <span>Distance Traveled</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{transportDist} km</span>
              </label>
              <input 
                type="range" 
                id="trans-dist"
                className="glowing-slider" 
                min="0" 
                max={transportSubtype.includes('Flight') ? "4000" : "250"}
                step={transportSubtype.includes('Flight') ? "50" : "5"}
                value={transportDist}
                onChange={(e) => setTransportDist(Number(e.target.value))}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[10, 50, 100, 500, 1000].map(val => (
                  <button 
                    key={val} 
                    type="button" 
                    className="btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => setTransportDist(val)}
                  >
                    {val} km
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'energy' && (
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="energy-mode">Utility / Source</label>
              <select 
                className="form-select" 
                id="energy-mode"
                value={energySubtype}
                onChange={(e) => setEnergySubtype(e.target.value as any)}
              >
                {Object.entries(EMISSION_FACTORS.energy).map(([key, details]) => (
                  <option key={key} value={key}>{details.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="energy-val">
                <span>Quantity Used</span>
                <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                  {energyAmount} {getActiveUnit()}
                </span>
              </label>
              <input 
                type="range" 
                id="energy-val"
                className="glowing-slider" 
                min="0" 
                max={energySubtype === 'water' ? "5000" : "1000"}
                step={energySubtype === 'water' ? "100" : "10"}
                value={energyAmount}
                onChange={(e) => setEnergyAmount(Number(e.target.value))}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[50, 100, 250, 500, 1000].map(val => (
                  <button 
                    key={val} 
                    type="button" 
                    className="btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => setEnergyAmount(val)}
                  >
                    {val} {getActiveUnit()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'food' && (
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="food-mode">Diet Category / Meal Type</label>
              <select 
                className="form-select" 
                id="food-mode"
                value={foodSubtype}
                onChange={(e) => setFoodSubtype(e.target.value as any)}
              >
                {Object.entries(EMISSION_FACTORS.food).map(([key, details]) => (
                  <option key={key} value={key}>{details.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="food-val">
                <span>Number of Meals</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{foodMeals} meals</span>
              </label>
              <input 
                type="range" 
                id="food-val"
                className="glowing-slider" 
                min="1" 
                max="21"
                step="1"
                value={foodMeals}
                onChange={(e) => setFoodMeals(Number(e.target.value))}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 3, 7, 14, 21].map(val => (
                  <button 
                    key={val} 
                    type="button" 
                    className="btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => setFoodMeals(val)}
                  >
                    {val} {val === 1 ? 'meal' : 'meals'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'consumption' && (
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="consum-mode">Purchase / Waste Category</label>
              <select 
                className="form-select" 
                id="consum-mode"
                value={consumptionSubtype}
                onChange={(e) => setConsumptionSubtype(e.target.value as any)}
              >
                {Object.entries(EMISSION_FACTORS.consumption).map(([key, details]) => (
                  <option key={key} value={key}>{details.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="consum-val">
                <span>Amount / Quantity</span>
                <span style={{ color: '#ec4899', fontWeight: 600 }}>
                  {consumptionValue} {getActiveUnit()}
                </span>
              </label>
              <input 
                type="range" 
                id="consum-val"
                className="glowing-slider" 
                min="1" 
                max={consumptionSubtype.includes('Waste') ? "100" : "10"}
                step="1"
                value={consumptionValue}
                onChange={(e) => setConsumptionValue(Number(e.target.value))}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 5, 10, 20].map(val => (
                  <button 
                    key={val} 
                    type="button" 
                    className="btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => setConsumptionValue(val)}
                  >
                    {val} {getActiveUnit()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Real-time Calculation Impact Panel */}
        <div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1.25rem',
            margin: '2rem 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05rem' }}>
              Estimated Carbon Cost
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Based on global average emission metrics.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-danger)', fontFamily: 'var(--font-display)' }}>
              +{getCurrentCO2Preview().toFixed(1)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>kg CO₂e</span>
          </div>
        </div>

        <button type="submit" className="btn-primary">
          📝 Log Activity
        </button>
      </form>
    </div>
  );
};
