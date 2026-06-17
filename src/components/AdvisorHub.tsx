import React from 'react';
import { EmissionLog, UserProfile, EcoChallenge, EcoBadge } from '../types';

interface AdvisorHubProps {
  logs: EmissionLog[];
  profile: UserProfile;
  challenges: EcoChallenge[];
  onCompleteChallenge: (id: string, xp: number, co2Saved: number) => void;
  badges: EcoBadge[];
}

export const AdvisorHub: React.FC<AdvisorHubProps> = ({
  logs,
  profile,
  challenges,
  onCompleteChallenge,
  badges
}) => {
  
  // Total emission breakdown
  const categoryTotals = logs.reduce(
    (acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + log.co2;
      return acc;
    },
    { transport: 0, energy: 0, food: 0, consumption: 0 } as Record<string, number>
  );

  const totalCO2 = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Generate personalized advisory recommendations
  const getAdvisorTips = () => {
    const tips = [];

    // Sorting categories by weight
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const primaryThreat = sortedCategories[0];

    if (totalCO2 === 0) {
      tips.push({
        id: 'start',
        title: 'Start Logging Activities',
        description: 'Track your carbon footprint today by entering travel, electricity bills, or food choices in the tracker tab to receive customized audits.',
        priority: 'medium',
        category: 'general'
      });
      return tips;
    }

    if (primaryThreat && primaryThreat[1] > 0) {
      const categoryName = primaryThreat[0];
      const categoryShare = ((primaryThreat[1] / totalCO2) * 100).toFixed(0);

      if (categoryName === 'transport') {
        tips.push({
          id: 'trans-heavy',
          title: 'Optimize Transportation Routine',
          description: `Transportation is your highest emission source, representing ${categoryShare}% of your footprint. Swapping 2 car trips for train transit or biking each week saves up to 45kg CO₂e monthly.`,
          priority: 'high',
          category: 'transport'
        });
      } else if (categoryName === 'energy') {
        tips.push({
          id: 'energy-heavy',
          title: 'Utility Consumption Auditing',
          description: `Home energy is your highest emission source, representing ${categoryShare}% of your footprint. Lowering your thermostat by 1°C or unplugging vampire load appliances can reduce your utility emissions by 15%.`,
          priority: 'high',
          category: 'energy'
        });
      } else if (categoryName === 'food') {
        tips.push({
          id: 'food-heavy',
          title: 'Implement Plant-Based Options',
          description: `Diet choices are your highest emission source, representing ${categoryShare}% of your footprint. Shifting beef/lamb meals to chicken or vegan alternatives for 3 meals a week avoids up to 35kg CO₂e monthly.`,
          priority: 'high',
          category: 'food'
        });
      } else if (categoryName === 'consumption') {
        tips.push({
          id: 'consum-heavy',
          title: 'Reduce Single-Use / Brand Purchases',
          description: `Consumption represents ${categoryShare}% of your footprint. Extending device usage (like phone upgrades) by 1 year saves up to 60kg CO₂e. Ensure you compost and recycle home waste correctly.`,
          priority: 'high',
          category: 'consumption'
        });
      }
    }

    // Secondary tips
    if (categoryTotals.transport > 200) {
      tips.push({
        id: 'trans-flight',
        title: 'Frequent Flight Impacts',
        description: 'Large flight logs detected. Flights have massive emission concentrations. Consider selecting direct flights or opting for virtual conferencing when possible.',
        priority: 'medium',
        category: 'transport'
      });
    }

    if (categoryTotals.energy > 300) {
      tips.push({
        id: 'energy-solar',
        title: 'Adopt Clean Energy Offsets',
        description: 'Your home energy footprint is substantial. Invest in clean energy solar offsets in the Simulator tab to neutralize electric grid usage.',
        priority: 'medium',
        category: 'energy'
      });
    }

    if (categoryTotals.food > 100 && categoryTotals.food > categoryTotals.transport) {
      tips.push({
        id: 'diet-swap',
        title: 'Try Meatless Mondays',
        description: 'Going vegetarian for just one day a week saves roughly 8.4 kg CO₂e per week. Learn plant-based recipe alternatives to ease the transition.',
        priority: 'low',
        category: 'food'
      });
    }

    // Default general green encouragement
    tips.push({
      id: 'general-offset',
      title: 'Maintain a Clean Carbon Offset Portfolio',
      description: 'Keep your net carbon score balanced by simulating forestation and plastic cleanups. Try to target a Net-Zero Eco Score!',
      priority: 'low',
      category: 'general'
    });

    return tips;
  };

  const advisorTips = getAdvisorTips();

  // Score Evaluator
  const getAdvisorEvaluation = () => {
    if (totalCO2 === 0) return { emoji: '👋', text: 'Welcome to EcoStep', subtext: 'Log emissions to receive an evaluation.' };
    
    if (totalCO2 < 150) {
      return { emoji: '🌟', text: 'Excellent Footprint', subtext: 'Your current gross emissions are extremely low. Keep leading the way!' };
    } else if (totalCO2 < 400) {
      return { emoji: '🌿', text: 'Moderate Footprint', subtext: 'You are on a sustainable path. Check details to trim high categories.' };
    } else {
      return { emoji: '⚠️', text: 'High Emission Footprint', subtext: 'Your logs exceed average recommendations. Follow advisor tips to reduce.' };
    }
  };

  const evaluation = getAdvisorEvaluation();

  return (
    <div className="dashboard-grid">
      
      {/* Smart Guidance & Recommendations Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Rating/Evaluation Widget */}
        <div className="advisor-rating-card">
          <span className="advisor-rating-icon">{evaluation.emoji}</span>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>
              {evaluation.text}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {evaluation.subtext}
            </p>
          </div>
        </div>

        {/* Tip Deck */}
        <div className="glass-card">
          <h2 className="section-title">
            <span>💡</span> Personalized Advisory Reports
          </h2>
          
          <div className="advisor-tips-list">
            {advisorTips.map((tip) => (
              <div className={`tip-card ${tip.priority}`} key={tip.id}>
                <div className="tip-header">
                  <span className="tip-title">{tip.title}</span>
                  <span className={`tip-priority ${tip.priority}`}>{tip.priority}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Green Daily Challenges */}
        <div className="glass-card">
          <h2 className="section-title">
            <span>🎯</span> Active Eco-Challenges
          </h2>
          
          <div className="challenges-grid">
            {challenges.map((challenge) => (
              <div className={`challenge-card ${challenge.completed ? 'completed' : ''}`} key={challenge.id}>
                <div className="challenge-card-header">
                  <div className="challenge-meta-row">
                    <span className={`challenge-tag difficulty-${challenge.difficulty}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="challenge-tag reward">
                      +{challenge.points} XP
                    </span>
                  </div>
                  <h4 className="challenge-title">{challenge.title}</h4>
                  <p className="challenge-desc">{challenge.description}</p>
                </div>
                
                <div className="challenge-action">
                  <span className="challenge-savings">
                    -{challenge.co2Savings} kg CO₂e saved
                  </span>
                  
                  {challenge.completed ? (
                    <span style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700 }}>
                      ✓ Completed
                    </span>
                  ) : (
                    <button 
                      className="btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderColor: 'var(--color-primary)' }}
                      onClick={() => onCompleteChallenge(challenge.id, challenge.points, challenge.co2Savings)}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Side Column: Badges & Achievements Locker */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 className="section-title">
          <span>🏅</span> Achievement Badges
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          Complete logs, purchase simulated offsets, and conquer challenges to unlock special ranks.
        </p>

        <div className="badges-grid">
          {badges.map((badge) => {
            const isUnlocked = profile.badges.includes(badge.id);
            return (
              <div 
                className={`badge-item ${isUnlocked ? 'unlocked' : ''}`} 
                key={badge.id}
                title={badge.requirementText}
              >
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-title">{badge.title}</span>
                <span className="badge-desc">{badge.description}</span>
              </div>
            );
          })}
        </div>

        <div 
          style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: 'rgba(255,255,255,0.01)', 
            border: '1px solid rgba(255,255,255,0.03)', 
            borderRadius: '12px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <strong>💡 Tips to unlock badges:</strong>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>Track at least 5 activities for the "Carbon Auditor" badge.</li>
            <li>Simulate offsets &gt; 100kg CO₂e for "Green Investor".</li>
            <li>Accomplish 3 eco-challenges for "Action Taker".</li>
            <li>Achieve net-zero carbon balance for "Net-Zero Hero".</li>
          </ul>
        </div>
      </div>

    </div>
  );
};
