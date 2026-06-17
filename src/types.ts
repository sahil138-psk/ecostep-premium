export type Category = 'transport' | 'energy' | 'food' | 'consumption';

export interface EmissionLog {
  id: string;
  date: string;
  category: Category;
  activityName: string;
  value: number;
  unit: string;
  co2: number; // in kg CO2e
  details: string;
}

export interface UserBudget {
  annualBudget: number; // in kg CO2e
  customBudget: boolean;
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  category: Category;
  co2Savings: number; // estimated kg CO2e saved
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number; // XP points
  completed: boolean;
}

export interface EcoBadge {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or custom SVG key
  requirementText: string;
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  xpNeeded: number;
  badges: string[]; // List of badge IDs unlocked
  offsetTrees: number; // Number of trees simulated
  offsetSolar: number; // kWh of solar simulated
  offsetOcean: number; // kg of ocean plastic simulated
  completedChallenges: string[]; // List of completed challenge IDs
}
