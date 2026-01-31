
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
  type: 'streak' | 'lift' | 'consistency';
}

export interface UserStats {
  gender: 'male' | 'female';
  level: number;
  xp: number;
  streak: number;
  totalWorkouts: number;
  avatarUrl?: string;
  lifts: Lifts;
  evolution: EvolutionParts;
  isStrongStart: boolean;
  onboardingComplete: boolean;
  challenges: Challenge[];
}

export enum AppRoute {
  LANDING = 'landing',
  ONBOARDING = 'onboarding',
  DASHBOARD = 'dashboard',
  WORKOUT = 'workout',
  LEVEL_100 = 'level100',
  CHALLENGES = 'challenges'
}
