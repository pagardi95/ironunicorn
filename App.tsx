
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import WorkoutView from './components/WorkoutView';
import Onboarding from './components/Onboarding';
import { AppRoute, UserStats, Lifts, WorkoutDay } from './types';
import { generateUnicornAvatar, getStaticEvolutionImage } from './services/geminiService';
import { MOCK_PLANS } from './constants';

const DEFAULT_STATS: UserStats = {
  displayName: 'Legend',
  level: 1,
  xp: 0,
  streak: 0,
  totalWorkouts: 0,
  onboardingComplete: false,
  isStrongStart: false,
  lifts: { bodyweight: 0, squat: 0, bench: 0, deadlift: 0 },
  evolution: { chest: 10, arms: 10, legs: 10, horn: 5 },
  challenges: [
    { id: 'c1', title: 'Erstes Training', description: 'Schließe dein erstes Workout ab und betrete den Stall.', xpReward: 50, completed: false, progress: 0, type: 'consistency' },
    { id: 'c2', title: 'Double Trouble', description: 'Trainiere 2 Tage hintereinander für eiserne Disziplin.', xpReward: 100, completed: false, progress: 0, type: 'streak' },
    { id: 'c3', title: 'Heavy Hitter', description: 'Logge ein Gewicht (Squat oder Deadlift) über deinem Körpergewicht.', xpReward: 150, completed: false, progress: 0, type: 'lift' }
  ]
};

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LANDING);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDay | null>(null);

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('unicorn_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATS, ...parsed };
      }
    } catch (e) {
      console.error("Fehler beim Laden von localStorage:", e);
    }
    return DEFAULT_STATS;
  });

  useEffect(() => {
    localStorage.setItem('unicorn_stats', JSON.stringify(stats));
  }, [stats]);

  const handleStartJourney = () => {
    if (stats.onboardingComplete) {
      setRoute(AppRoute.DASHBOARD);
      setIsLoggedIn(true);
    } else {
      setRoute(AppRoute.ONBOARDING);
    }
  };

  const handleOnboardingComplete = async (lifts: Lifts, name: string) => {
    const isStrong = lifts.squat >= (lifts.bodyweight * 1.2);
    const startLevel = isStrong ? 15 : 1;
    
    const newStats: UserStats = {
      ...stats,
      displayName: name || 'Legend',
      lifts,
      onboardingComplete: true,
      isStrongStart: isStrong,
      level: startLevel,
      avatarUrl: getStaticEvolutionImage(startLevel),
      evolution: isStrong ? { chest: 30, arms: 30, legs: 40, horn: 10 } : { chest: 10, arms: 10, legs: 10, horn: 5 }
    };

    setStats(newStats);
    setIsLoggedIn(true);
    setRoute(AppRoute.DASHBOARD);
  };

  const handleUpdateStats = (newStats: Partial<UserStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const handleCompleteChallenge = (challengeId: string) => {
    setStats(prev => {
      const challenge = prev.challenges.find(c => c.id === challengeId);
      if (!challenge || challenge.completed) return prev;

      const newXp = prev.xp + challenge.xpReward;
      const newLevel = Math.min(100, Math.floor(newXp / 100) + (prev.isStrongStart ? 15 : 1));
      
      return {
        ...prev,
        challenges: prev.challenges.map(c => c.id === challengeId ? { ...c, completed: true } : c),
        xp: newXp,
        level: newLevel,
        avatarUrl: getStaticEvolutionImage(newLevel)
      };
    });
  };

  const handleFinishWorkout = (xpGained: number) => {
    const today = new Date().toDateString();
    const lastWorkout = stats.lastWorkoutDate;
    
    let newStreak = stats.streak;
    if (lastWorkout) {
      const lastDate = new Date(lastWorkout);
      const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const newXp = stats.xp + xpGained;
    const newLevel = Math.min(100, Math.floor(newXp / 100) + (stats.isStrongStart ? 15 : 1));
    
    setStats(prev => ({
      ...prev,
      xp: newXp,
      level: newLevel,
      totalWorkouts: prev.totalWorkouts + 1,
      streak: newStreak,
      lastWorkoutDate: today,
      avatarUrl: getStaticEvolutionImage(newLevel)
    }));
    
    setRoute(AppRoute.DASHBOARD);
  };

  const renderContent = () => {
    switch (route) {
      case AppRoute.LANDING:
        return <LandingPage onStart={handleStartJourney} setRoute={setRoute} />;
      case AppRoute.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case AppRoute.DASHBOARD:
        return (
          <Dashboard 
            stats={stats} 
            setRoute={setRoute} 
            onUpdateStats={handleUpdateStats} 
            onCompleteChallenge={handleCompleteChallenge}
            onSelectWorkout={setSelectedWorkout}
          />
        );
      case AppRoute.WORKOUT:
        return <WorkoutView stats={stats} onFinish={handleFinishWorkout} setRoute={setRoute} dayOverride={selectedWorkout} />;
      case AppRoute.LEVEL_100:
        return (
          <div className="pt-20 px-6 text-center animate-in fade-in zoom-in duration-700">
            <div className="text-9xl mb-12 drop-shadow-[0_0_50px_rgba(168,85,247,0.5)]">🦄</div>
            <h1 className="text-6xl font-oswald font-black uppercase tracking-tighter mb-6">
              IRON <span className="unicorn-text-gradient">UNICORN</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12">
              Du hast das Ende der gewöhnlichen Welt erreicht. Du bist nun die Legende, von der alle anderen nur träumen.
            </p>
            <button 
              onClick={() => setRoute(AppRoute.DASHBOARD)}
              className="px-12 py-4 bg-white text-black font-bold rounded-2xl uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all"
            >
              Zum Dashboard
            </button>
          </div>
        );
      default:
        return <LandingPage onStart={handleStartJourney} setRoute={setRoute} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30">
      <Navigation currentRoute={route} setRoute={setRoute} isLoggedIn={isLoggedIn} />
      <main>{renderContent()}</main>
      <footer className="py-10 text-center text-gray-600 text-[10px] uppercase font-black tracking-[0.3em] border-t border-white/5 bg-[#050505]">
        <p>© 2024 Iron Unicorn App — Crafted with Love and Horns 🦄</p>
      </footer>
    </div>
  );
};

export default App;
