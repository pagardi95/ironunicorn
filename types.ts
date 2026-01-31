
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weightHint: string;
  completed?: boolean;
  actualWeight?: number;
  actualReps?: number;
  difficulty?: 'too_easy' | 'just_right' | 'too_hard';
}

export interface WorkoutDay {
  day: number;
  name: string;
  exercises: Exercise[];
}

export interface TrainingPlan {
  id: string;
  title: string;
  durationWeeks: number;
  focus: 'Strength' | 'Hypertrophy';
  description: string;
  minStrengthScore: number; // (Squat + Bench + Deadlift) / Bodyweight
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  days: WorkoutDay[];
}

export interface Lifts {
  bodyweight: number;
  squat: number;
  bench: number;
  deadlift: number;
}

export interface EvolutionParts {
  chest: number;
  arms: number;
  legs: number;
  horn: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  progress: number; // 0 to 100
  type: 'streak' | 'lift' | 'consistency' | 'volume';
}

export interface UserStats {
  level: number;
  xp: number;
  streak: number;
  totalWorkouts: number;
  avatarUrl?: string;
  selectedPlanId?: string;
  lifts: Lifts;
  evolution: EvolutionParts;
  isStrongStart: boolean;
  onboardingComplete: boolean;
  challenges: Challenge[];
  lastWorkoutDate?: string; // To track streaks
}

export enum AppRoute {
  LANDING = 'landing',
  ONBOARDING = 'onboarding',
  DASHBOARD = 'dashboard',
  WORKOUT = 'workout',
  LEVEL_100 = 'level100'
}
