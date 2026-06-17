import React, { useState } from 'react';
import { UserProfile } from '../types';
import { OFFSET_FACTORS } from '../utils/emissionFactors';

interface OffsetSimulatorProps {
  profile: UserProfile;
  onUpdateOffsets: (trees: number, solar: number, ocean: number) => void;
  onAwardXP: (amount: number) => void;
  grossCO2: number;
}

export const OffsetSimulator: React.FC<OffsetSimulatorProps> = ({
  profile,
  onUpdateOffsets,
  onAwardXP,
  grossCO2
}) => {
  // Simulator temp inputs
  const [trees, setTrees] = useState<number>(profile.offsetTrees);
  const [solar, setSolar] = useState<number>(profile.offsetSolar);
  const [ocean, setOcean] = useState<number>(profile.offsetOcean);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Calculations
  const treeImpact = trees * OFFSET_FACTORS.tree.factor;
  const solarImpact = solar * OFFSET_FACTORS.solar.factor;
  const oceanImpact = ocean * OFFSET_FACTORS.ocean.factor;
  const totalOffset = treeImpact + solarImpact + oceanImpact;

  const estTreeCost = trees * OFFSET_FACTORS.tree.cost;
  const estSolarCost = solar * OFFSET_FACTORS.solar.cost;
  const estOceanCost = ocean * OFFSET_FACTORS.ocean.cost;
  const totalCost = estTreeCost + estSolarCost + estOceanCost;

  const netCO2 = Math.max(0, grossCO2 - totalOffset);
  const isNetZero = grossCO2 > 0 && netCO2 === 0;

  const handleCommit = () => {
    onUpdateOffsets(trees, solar, ocean);
    
    // Gain XP if they increased their offsets
    const previousOffsetTotal = (profile.offsetTrees * 22) + (profile.offsetSolar * 0.4) + (profile.offsetOcean * 1.2);
    if (totalOffset > previousOffsetTotal) {
      const xpEarned = Math.min(100, Math.max(10, Math.round((totalOffset - previousOffsetTotal) * 0.1)));
      onAwardXP(xpEarned);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setTrees(0);
    setSolar(0);
    setOcean(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Info Card */}
      <div className="glass-card">
        <h2 className="section-title">
          <span>🌲</span> Carbon Offset Simulator
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Simulate reducing your net carbon footprint by investing in certified eco-projects. Drag the sliders to explore offsetting impacts. Click <strong>Commit Offsets</strong> to save.
        </p>

        <div className="three-column-grid">
          <div className="metric-item" style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gross Footprint</span>
            <span className="metric-value" style={{ color: 'var(--color-danger)', fontSize: '1.8rem', marginTop: '0.25rem' }}>
              {grossCO2.toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>kg</span>
            </span>
          </div>
          <div className="metric-item" style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulated Avoided</span>
            <span className="metric-value" style={{ color: 'var(--color-secondary)', fontSize: '1.8rem', marginTop: '0.25rem' }}>
              -{totalOffset.toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>kg</span>
            </span>
          </div>
          <div className="metric-item" style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Footprint</span>
            <span 
              className="metric-value" 
              style={{ 
                color: isNetZero ? '#22d3ee' : (netCO2 > 0 ? 'var(--color-warning)' : 'var(--color-primary)'), 
                fontSize: '1.8rem', 
                marginTop: '0.25rem',
                textShadow: isNetZero ? '0 0 15px rgba(34, 211, 238, 0.4)' : 'none'
              }}
            >
              {netCO2.toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>kg</span>
            </span>
          </div>
        </div>

        {isNetZero && (
          <div 
            style={{ 
              background: 'rgba(6, 182, 212, 0.12)', 
              border: '1px solid rgba(6, 182, 212, 0.3)', 
              color: '#22d3ee', 
              padding: '1rem', 
              borderRadius: '12px', 
              textAlign: 'center', 
              marginTop: '1.5rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              animation: 'pulse 2s infinite ease-in-out'
            }}
          >
            🏆 Net-Zero Achieved! You have simulated offsetting 100% of your logged carbon footprint.
          </div>
        )}
      </div>

      {/* Simulator Sliders */}
      <div className="split-grid">
        
        {/* Project Options list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Tree Planting */}
          <div className="offset-card">
            <div className="offset-header">
              <div className="offset-icon">🌳</div>
              <div className="offset-info">
                <h4>Plant Trees</h4>
                <p>Global Reforestation Project</p>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {OFFSET_FACTORS.tree.description}
            </p>
            <div className="offset-control">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Amount: <strong>{trees} trees</strong></span>
                <span className="offset-impact-tag">-{treeImpact.toFixed(0)} kg CO₂e</span>
              </div>
              <input 
                type="range" 
                className="glowing-slider" 
                min="0" 
                max="50" 
                value={trees} 
                onChange={(e) => setTrees(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Estimated Donation: ${estTreeCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Clean Energy Credits */}
          <div className="offset-card">
            <div className="offset-header">
              <div className="offset-icon">☀️</div>
              <div className="offset-info">
                <h4>Renewable Energy Credits</h4>
                <p>Solar & Wind Farm Infrastructure</p>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {OFFSET_FACTORS.solar.description}
            </p>
            <div className="offset-control">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Amount: <strong>{solar} kWh</strong></span>
                <span className="offset-impact-tag">-{solarImpact.toFixed(0)} kg CO₂e</span>
              </div>
              <input 
                type="range" 
                className="glowing-slider" 
                min="0" 
                max="2000" 
                step="50"
                value={solar} 
                onChange={(e) => setSolar(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Estimated Contribution: ${estSolarCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Ocean Plastic Removal */}
          <div className="offset-card">
            <div className="offset-header">
              <div className="offset-icon">🌊</div>
              <div className="offset-info">
                <h4>Ocean Plastic Cleanup</h4>
                <p>Intercepting river-to-ocean plastic dumps</p>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {OFFSET_FACTORS.ocean.description}
            </p>
            <div className="offset-control">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Amount: <strong>{ocean} kg</strong></span>
                <span className="offset-impact-tag">-{oceanImpact.toFixed(0)} kg CO₂e</span>
              </div>
              <input 
                type="range" 
                className="glowing-slider" 
                min="0" 
                max="250" 
                step="5"
                value={ocean} 
                onChange={(e) => setOcean(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Estimated Donation: ${estOceanCost.toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Commitment Summary Column */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title">Simulated Portfolio</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div className="log-item" style={{ background: 'transparent' }}>
                <span>🌳 Tree Offsetting:</span>
                <span style={{ fontWeight: 600 }}>{treeImpact.toFixed(1)} kg CO₂e (${estTreeCost})</span>
              </div>
              <div className="log-item" style={{ background: 'transparent' }}>
                <span>☀️ Solar Power Funding:</span>
                <span style={{ fontWeight: 600 }}>{solarImpact.toFixed(1)} kg CO₂e (${estSolarCost.toFixed(2)})</span>
              </div>
              <div className="log-item" style={{ background: 'transparent' }}>
                <span>🌊 Ocean Plastic Collection:</span>
                <span style={{ fontWeight: 600 }}>{oceanImpact.toFixed(1)} kg CO₂e (${estOceanCost})</span>
              </div>
            </div>

            <div 
              style={{ 
                marginTop: '2rem', 
                padding: '1.25rem', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Total Offset Power:</span>
                <strong style={{ color: 'var(--color-secondary)' }}>-{totalOffset.toFixed(1)} kg CO₂e</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Estimated Contribution:</span>
                <strong style={{ color: '#ffffff' }}>${totalCost.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
            {savedSuccess && (
              <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600, animation: 'fadeIn 0.2s' }}>
                ✨ Portfolio Committed! Profile Updated.
              </p>
            )}
            <button className="btn-primary" onClick={handleCommit} style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, #0891b2 100%)', boxShadow: '0 4px 15px var(--color-secondary-glow)' }}>
              🔒 Commit Offsets
            </button>
            <button className="btn-secondary" onClick={handleReset}>
              Reset Sliders
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
