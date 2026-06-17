import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LogCalculator } from './components/LogCalculator';
import { OffsetSimulator } from './components/OffsetSimulator';
import { AdvisorHub } from './components/AdvisorHub';
import { EmissionLog, UserProfile, UserBudget, EcoChallenge, EcoBadge } from './types';

// Constants
const DEFAULT_BUDGET: UserBudget = {
  annualBudget: 2400, // 2.4 tonnes (200kg/month)
  customBudget: false
};

const INITIAL_CHALLENGES: EcoChallenge[] = [
  { id: 'c1', title: 'Meatless Day', description: 'Eat plant-based meals for an entire day.', category: 'food', co2Savings: 8.4, difficulty: 'Easy', points: 30, completed: false },
  { id: 'c2', title: 'Power Down standby', description: 'Unplug all chargers and standby appliances tonight.', category: 'energy', co2Savings: 4.0, difficulty: 'Easy', points: 20, completed: false },
  { id: 'c3', title: 'Active Transit Swap', description: 'Replace a car trip under 5km with walking or cycling.', category: 'transport', co2Savings: 15.0, difficulty: 'Medium', points: 50, completed: false },
  { id: 'c4', title: 'Wash Cold & Line Dry', description: 'Wash laundry at 30°C and dry naturally instead of using a dryer.', category: 'energy', co2Savings: 5.5, difficulty: 'Medium', points: 40, completed: false },
  { id: 'c5', title: 'Eco Grocery Shop', description: 'Buy loose local seasonal produce without plastic packing.', category: 'consumption', co2Savings: 7.2, difficulty: 'Medium', points: 35, completed: false },
  { id: 'c6', title: 'Carpool / Public Transit', description: 'Take the bus or share a ride for your next commute.', category: 'transport', co2Savings: 22.0, difficulty: 'Hard', points: 60, completed: false }
];

const BADGES_LIST: EcoBadge[] = [
  { id: 'b1', title: 'First Steps', description: 'First emission logged', icon: '🌱', requirementText: 'Log your first carbon impact' },
  { id: 'b2', title: 'Carbon Auditor', description: 'Logged 5 items', icon: '📊', requirementText: 'Add 5 entries to your emission log' },
  { id: 'b3', title: 'Green Investor', description: 'Offset >100kg CO₂', icon: '🌳', requirementText: 'Simulate offsetting over 100 kg of carbon' },
  { id: 'b4', title: 'Action Taker', description: 'Done 3 challenges', icon: '🎯', requirementText: 'Complete 3 eco-challenges' },
  { id: 'b5', title: 'Net-Zero Hero', description: 'Achieved net-zero', icon: '⚡', requirementText: 'Simulate offsetting 100% of your gross carbon emissions' },
  { id: 'b6', title: 'Carbon Guardian', description: 'Reached level 3', icon: '🛡️', requirementText: 'Gain enough XP to reach Level 3' }
];

// Initial mock data to make the app look stunning immediately
const INITIAL_LOGS: EmissionLog[] = [
  { id: 'log1', date: '2026-06-15', category: 'transport', activityName: 'Petrol Car Travel', value: 45, unit: 'km', co2: 8.1, details: 'Daily commute to work' },
  { id: 'log2', date: '2026-06-16', category: 'food', activityName: 'Meat-Heavy Meal (Beef/Lamb) Intake', value: 2, unit: 'meals', co2: 6.6, details: 'Lunch and Dinner beef steak' },
  { id: 'log3', date: '2026-06-17', category: 'energy', activityName: 'Electricity Grid Usage', value: 25, unit: 'kWh', co2: 9.5, details: 'AC and server cooling logs' }
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Eco Warrior',
  level: 1,
  xp: 45,
  xpNeeded: 100,
  badges: ['b1'],
  offsetTrees: 1,
  offsetSolar: 50,
  offsetOcean: 5,
  completedChallenges: []
};

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'offsets' | 'advisor'>('dashboard');
  
  // State initialization with LocalStorage check
  const [logs, setLogs] = useState<EmissionLog[]>(() => {
    const saved = localStorage.getItem('ecostep_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ecostep_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [budget] = useState<UserBudget>(() => {
    const saved = localStorage.getItem('ecostep_budget');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGET;
  });

  const [challenges, setChallenges] = useState<EcoChallenge[]>(() => {
    const saved = localStorage.getItem('ecostep_challenges');
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });

  // Sync to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('ecostep_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('ecostep_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('ecostep_challenges', JSON.stringify(challenges));
  }, [challenges]);

  // Gamification: XP award function + Level Check
  const awardXP = (amount: number) => {
    setProfile(prev => {
      let newXp = prev.xp + amount;
      let newLvl = prev.level;
      let newNeeded = prev.xpNeeded;

      while (newXp >= newNeeded) {
        newXp -= newNeeded;
        newLvl += 1;
        newNeeded = newLvl * 100; // Level scaling: Level 1 = 100XP, Level 2 = 200XP, etc.
      }

      // Re-trigger badge checkers with local variables to capture state accurately
      return {
        ...prev,
        xp: newXp,
        level: newLvl,
        xpNeeded: newNeeded
      };
    });
  };

  // Dispatch Log entries
  const handleAddLog = (newLogData: Omit<EmissionLog, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const log: EmissionLog = {
      ...newLogData,
      id: `log-${Date.now()}`,
      date: today
    };
    setLogs(prev => [log, ...prev]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleResetLogs = () => {
    if (window.confirm('Are you sure you want to clear your carbon log history?')) {
      setLogs([]);
    }
  };

  // Complete Eco Challenge Action
  const handleCompleteChallenge = (id: string, xp: number, co2Saved: number) => {
    setChallenges(prev => 
      prev.map(c => c.id === id ? { ...c, completed: true } : c)
    );
    setProfile(prev => ({
      ...prev,
      completedChallenges: [...prev.completedChallenges, id]
    }));
    awardXP(xp);
    console.info(`Completed challenge ${id}, saving ${co2Saved}kg CO2e`);
  };

  // Commit simulator offsets
  const handleUpdateOffsets = (trees: number, solar: number, ocean: number) => {
    setProfile(prev => ({
      ...prev,
      offsetTrees: trees,
      offsetSolar: solar,
      offsetOcean: ocean
    }));
  };

  // Badge unlock engine ran whenever logs, profile values, or challenges change
  useEffect(() => {
    const grossCO2 = logs.reduce((sum, log) => sum + log.co2, 0);
    const offsetTreesSaved = profile.offsetTrees * 22;
    const offsetSolarSaved = profile.offsetSolar * 0.4;
    const offsetOceanSaved = profile.offsetOcean * 1.2;
    const totalOffset = offsetTreesSaved + offsetSolarSaved + offsetOceanSaved;
    const netCO2 = Math.max(0, grossCO2 - totalOffset);

    const newlyUnlockedBadges = [...profile.badges];

    // Check Badge Requirement 1: First Steps
    if (logs.length >= 1 && !newlyUnlockedBadges.includes('b1')) {
      newlyUnlockedBadges.push('b1');
    }

    // Check Badge Requirement 2: Carbon Auditor
    if (logs.length >= 5 && !newlyUnlockedBadges.includes('b2')) {
      newlyUnlockedBadges.push('b2');
    }

    // Check Badge Requirement 3: Green Investor (Offset > 100kg)
    if (totalOffset > 100 && !newlyUnlockedBadges.includes('b3')) {
      newlyUnlockedBadges.push('b3');
    }

    // Check Badge Requirement 4: Action Taker
    if (profile.completedChallenges.length >= 3 && !newlyUnlockedBadges.includes('b4')) {
      newlyUnlockedBadges.push('b4');
    }

    // Check Badge Requirement 5: Net-Zero Hero
    if (grossCO2 > 0 && netCO2 === 0 && !newlyUnlockedBadges.includes('b5')) {
      newlyUnlockedBadges.push('b5');
    }

    // Check Badge Requirement 6: Carbon Guardian (Level 3+)
    if (profile.level >= 3 && !newlyUnlockedBadges.includes('b6')) {
      newlyUnlockedBadges.push('b6');
    }

    // Only update profile if badge composition has changed
    if (newlyUnlockedBadges.length !== profile.badges.length) {
      setProfile(prev => ({
        ...prev,
        badges: newlyUnlockedBadges
      }));
    }
  }, [logs, profile.offsetTrees, profile.offsetSolar, profile.offsetOcean, profile.completedChallenges, profile.level]);

  // Gross Footprint for offset calculator binding
  const grossCO2 = logs.reduce((sum, log) => sum + log.co2, 0);

  return (
    <div className="app-container">
      
      {/* Top Header Row with Level progression */}
      <header className="app-header">
        <div className="logo-section">
          <span className="logo-icon">🌱</span>
          <div className="logo-text">
            <h1>EcoStep Premium</h1>
            <p>Carbon footprint tracker & insights</p>
          </div>
        </div>

        {/* Gamification Indicator Panel */}
        <div className="header-profile-widget">
          <div className="level-badge" title="Guardian Ranks">
            {profile.level}
          </div>
          <div className="xp-container">
            <div className="xp-text">
              <span>Eco Level</span>
              <span>{profile.xp} / {profile.xpNeeded} XP</span>
            </div>
            <div className="xp-bar-bg">
              <div 
                className="xp-bar-fill" 
                style={{ width: `${Math.min(100, (profile.xp / profile.xpNeeded) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="nav-tabs" role="tablist" aria-label="Main Navigation">
        <button 
          id="nav-tab-dashboard"
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          id="nav-tab-calculator"
          role="tab"
          aria-selected={activeTab === 'calculator'}
          className={`nav-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          🌱 Calculator
        </button>
        <button 
          id="nav-tab-offsets"
          role="tab"
          aria-selected={activeTab === 'offsets'}
          className={`nav-btn ${activeTab === 'offsets' ? 'active' : ''}`}
          onClick={() => setActiveTab('offsets')}
        >
          🌲 Offset Simulator
        </button>
        <button 
          id="nav-tab-advisor"
          role="tab"
          aria-selected={activeTab === 'advisor'}
          className={`nav-btn ${activeTab === 'advisor' ? 'active' : ''}`}
          onClick={() => setActiveTab('advisor')}
        >
          💡 Eco-Advisor & Challenges
        </button>
      </nav>

      {/* Main Panel Content Routing */}
      <main style={{ minHeight: '60vh' }}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            logs={logs} 
            profile={profile} 
            budget={budget} 
            onDeleteLog={handleDeleteLog}
            onResetLogs={handleResetLogs}
          />
        )}
        {activeTab === 'calculator' && (
          <LogCalculator 
            onAddLog={handleAddLog} 
            onAwardXP={awardXP}
          />
        )}
        {activeTab === 'offsets' && (
          <OffsetSimulator 
            profile={profile} 
            onUpdateOffsets={handleUpdateOffsets}
            onAwardXP={awardXP}
            grossCO2={grossCO2}
          />
        )}
        {activeTab === 'advisor' && (
          <AdvisorHub 
            logs={logs} 
            profile={profile} 
            challenges={challenges} 
            onCompleteChallenge={handleCompleteChallenge}
            badges={BADGES_LIST}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '2rem' }}>
        <p>EcoStep Premium • Designed for Sustainable Carbon Auditing.</p>
        <p style={{ marginTop: '0.25rem' }}>GCP Deployable Container Core • Zero Carbon Waste.</p>
      </footer>
      
    </div>
  );
}

export default App;
