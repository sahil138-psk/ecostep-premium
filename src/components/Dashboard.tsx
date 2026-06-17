import React from 'react';
import { EmissionLog, UserProfile, UserBudget } from '../types';

interface DashboardProps {
  logs: EmissionLog[];
  profile: UserProfile;
  budget: UserBudget;
  onDeleteLog: (id: string) => void;
  onResetLogs: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  logs,
  profile,
  budget,
  onDeleteLog,
  onResetLogs
}) => {
  // Calculations
  const grossCO2 = logs.reduce((sum, log) => sum + log.co2, 0);
  
  // Simulated offset impact
  const offsetTreesSaved = profile.offsetTrees * 22; // 22kg/tree
  const offsetSolarSaved = profile.offsetSolar * 0.4; // 0.4kg/kWh
  const offsetOceanSaved = profile.offsetOcean * 1.2; // 1.2kg/kg plastic
  const totalOffset = offsetTreesSaved + offsetSolarSaved + offsetOceanSaved;
  
  const netCO2 = Math.max(0, grossCO2 - totalOffset);
  const annualTarget = budget.annualBudget;
  
  // Convert annual target to monthly for a realistic budget comparison
  const monthlyTarget = annualTarget / 12;
  const budgetRatio = monthlyTarget > 0 ? netCO2 / monthlyTarget : 0;
  const budgetPercentage = Math.min(100, Math.round(budgetRatio * 100));

  // Category breakdown
  const categoryTotals = logs.reduce(
    (acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + log.co2;
      return acc;
    },
    { transport: 0, energy: 0, food: 0, consumption: 0 } as Record<string, number>
  );

  const totalLogged = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // SVG Gauge calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (budgetPercentage / 100) * circumference;

  // Determine indicator color based on budget state
  let gaugeColor = 'var(--color-primary)'; // Emerald
  if (budgetPercentage > 80 && budgetPercentage <= 100) {
    gaugeColor = 'var(--color-warning)'; // Amber
  } else if (budgetPercentage > 100) {
    gaugeColor = 'var(--color-danger)'; // Red
  }

  // Formatting values
  const formatKg = (val: number) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(2)} tonnes`;
    }
    return `${val.toFixed(1)} kg`;
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'transport': return '#3b82f6'; // Blue
      case 'energy': return '#f59e0b'; // Amber
      case 'food': return '#10b981'; // Green
      case 'consumption': return '#ec4899'; // Pink
      default: return '#9ca3af';
    }
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'transport': return '🚗';
      case 'energy': return '⚡';
      case 'food': return '🥗';
      case 'consumption': return '🛍️';
      default: return '📝';
    }
  };

  return (
    <div className="dashboard-grid">
      {/* Main Stats Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Top Summary Glass Card */}
        <div className="glass-card">
          <h2 className="section-title">
            <span>📊</span> Carbon Footprint Overview
          </h2>
          
          <div className="split-grid" style={{ gridTemplateColumns: '1.2fr 1.8fr', alignItems: 'center' }}>
            
            {/* Circular Budget Ring */}
            <div 
              className="score-circle-container"
              role="progressbar"
              aria-valuenow={budgetPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Carbon Budget Gauge"
            >
              <svg className="score-svg" viewBox="0 0 200 200">
                <circle className="score-circle-bg" cx="100" cy="100" r={radius} />
                <circle 
                  className="score-circle-fill" 
                  cx="100" 
                  cy="100" 
                  r={radius} 
                  stroke={gaugeColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="score-content">
                <span id="dashboard-budget-percentage" className="score-value">{budgetPercentage}%</span>
                <span className="score-label">Monthly Budget</span>
              </div>
            </div>
            
            {/* Summary Details */}
            <div>
              <h3 className="card-title">Net Monthly Status</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Your carbon budget is <strong>{formatKg(monthlyTarget)}</strong> per month. Currently, your net footprint is at <strong>{budgetPercentage}%</strong> of your allowance.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Gross CO₂ Logged:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>+{formatKg(grossCO2)} CO₂e</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Simulated Offsets:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>-{formatKg(totalOffset)} CO₂e</span>
                </div>
                <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                  <span>Net Footprint:</span>
                  <span style={{ color: netCO2 > monthlyTarget ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                    {formatKg(netCO2)} CO₂e
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Stats Grid */}
          <div className="metrics-row">
            <div className="metric-item">
              <span id="metric-trees-planted" className="metric-value">🌲 {profile.offsetTrees}</span>
              <span className="metric-label">Trees Simulated</span>
            </div>
            <div className="metric-item">
              <span id="metric-guardian-level" className="metric-value">🛡️ Lvl {profile.level}</span>
              <span className="metric-label">Guardian Level</span>
            </div>
            <div className="metric-item">
              <span id="metric-guardian-xp" className="metric-value">✨ {profile.xp} XP</span>
              <span className="metric-label">Total Points</span>
            </div>
          </div>
        </div>

        {/* Charts & Breakdown Card */}
        <div className="glass-card">
          <h2 className="section-title">
            <span>📈</span> Category Share Analysis
          </h2>
          
          {logs.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📊</span>
              <p>No carbon logs available yet. Go to the Calculator to log your first activity!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="category-bars">
                {Object.entries(categoryTotals).map(([cat, amount]) => {
                  const pct = totalLogged > 0 ? Math.round((amount / totalLogged) * 100) : 0;
                  return (
                    <div className="category-bar-item" key={cat}>
                      <div className="category-bar-info">
                        <span className="category-label">
                          <span style={{ fontSize: '1.1rem' }}>{getCategoryEmoji(cat)}</span>
                          <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                        </span>
                        <span className="category-value">
                          {formatKg(amount)} CO₂e ({pct}%)
                        </span>
                      </div>
                      <div className="category-track">
                        <div 
                          className="category-bar-fill" 
                          style={{ 
                            width: `${pct}%`, 
                            backgroundColor: getCategoryColor(cat),
                            boxShadow: `0 0 10px ${getCategoryColor(cat)}60` 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Side Column: Recent Logs */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>
            <span>📜</span> Recent Activity
          </h2>
          {logs.length > 0 && (
            <button id="clear-all-logs-btn" className="btn-secondary" onClick={onResetLogs} style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
              Clear All
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="empty-state" style={{ flex: 1, justifyContent: 'center' }}>
            <span className="empty-icon">🍃</span>
            <p>Your carbon log is clear. Keep up the green work!</p>
          </div>
        ) : (
          <div className="logs-list">
            {[...logs].reverse().map((log) => (
              <div className="log-item" key={log.id}>
                <div className="log-info">
                  <div 
                    className="log-category-icon" 
                    style={{ backgroundColor: `${getCategoryColor(log.category)}18`, border: `1px solid ${getCategoryColor(log.category)}30` }}
                  >
                    {getCategoryEmoji(log.category)}
                  </div>
                  <div className="log-details">
                    <span className="log-title">{log.activityName}</span>
                    <span className="log-meta">
                      {log.value} {log.unit} • {log.date}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="log-co2">
                    <span className="log-co2-val">+{log.co2.toFixed(1)}</span>
                    <span className="log-co2-label">kg CO₂e</span>
                  </div>
                  <button 
                    id={`delete-log-btn-${log.id}`}
                    className="btn-delete" 
                    onClick={() => onDeleteLog(log.id)}
                    title="Delete Entry"
                    aria-label={`Delete log entry for ${log.activityName}`}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
