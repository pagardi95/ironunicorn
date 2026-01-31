
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import WorkoutView from './components/WorkoutView';
import Onboarding from './components/Onboarding';
import { AppRoute, UserStats, Lifts, WorkoutDay } from './types';
import { generateUnicornAvatar, getStaticEvolutionImage } from './services/geminiService';
import { MOCK_PLANS } from './constants';
import { supabase } from './services/supabaseClient';

const DEFAULT_STATS: UserStats = {
  level: 1,
  xp: 0,
  streak: 0,
  totalWorkouts: 0,
  onboardingComplete: false,
  isStrongStart: false,
  lifts: { bodyweight: 0, squat: 0, bench: 0, deadlift: 0 },
  evolution: { chest: 10, arms: 10, legs: 10, horn: 5 },
  challenges: [
    { id: 'c1', title: 'Erstes Training', description: 'Schließe dein erstes Workout ab.', xpReward: 50, completed: false, type: 'consistency' },
    { id: 'c2', title: 'Double Trouble', description: 'Trainiere 2 Tage hintereinander.', xpReward: 100, completed: false, type: 'streak' },
    { id: 'c3', title: 'Heavy Hitter', description: 'Logge ein Gewicht > Körpergewicht.', xpReward: 150, completed: false, type: 'lift' }
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

  const handleOnboardingComplete = async (lifts: Lifts) => {
    const isStrong = lifts.squat >= (lifts.bodyweight * 1.2); // 1.2x BW für echten Strong Start
    const startLevel = isStrong ? 15 : 1;
    
    const newStats: UserStats = {
      ...stats,
      lifts,
      onboardingComplete: true,
      isStrongStart: isStrong,
      level: startLevel,
      avatarUrl: getStaticEvolutionImage(startLevel), // Sofort setzen
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
    const challenge = stats.challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    const newXp = stats.xp + challenge.xpReward;
    const newLevel = Math.min(100, Math.floor(newXp / 100) + (stats.isStrongStart ? 15 : 1));
    
    setStats(prev => ({
      ...prev,
      challenges: prev.challenges.map(c => c.id === challengeId ? { ...c, completed: true } : c),
      xp: newXp,
      level: newLevel,
      avatarUrl: getStaticEvolutionImage(newLevel) // Automatisches Update
    }));
  };

  const handleFinishWorkout = (xpGained: number) => {
    const newXp = stats.xp + xpGained;
    const newLevel = Math.min(100, Math.floor(newXp / 100) + (stats.isStrongStart ? 15 : 1));
    
    const updatedStats: UserStats = {
      ...stats,
      xp: newXp,
      level: newLevel,
      totalWorkouts: stats.totalWorkouts + 1,
      streak: stats.streak + 1,
      avatarUrl: getStaticEvolutionImage(newLevel) // Automatisches Update
    };

    // Automatische Challenge-Prüfung
    if (updatedStats.totalWorkouts === 1) {
      const c1 = updatedStats.challenges.find(c => c.id === 'c1');
      if (c1 && !c1.completed) {
        updatedStats.challenges = updatedStats.challenges.map(c => c.id === 'c1' ? {...c, completed: true} : c);
        updatedStats.xp += c1.xpReward;
        // Level nach Challenge-XP neu berechnen
        updatedStats.level = Math.min(100, Math.floor(updatedStats.xp / 100) + (stats.isStrongStart ? 15 : 1));
        updatedStats.avatarUrl = getStaticEvolutionImage(updatedStats.level);
      }
    }

    setStats(updatedStats);
    setRoute(AppRoute.DASHBOARD);
  };

  const renderContent = () => {
    switch (route) {
      case AppRoute.LANDING:
        return <LandingPage onStart={handleStartJourney} setRoute={setRoute} />;
      case AppRoute.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case AppRoute.DASHBOARD:
      case AppRoute.CHALLENGES:
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
          <div className="pt-40 px-6 text-center animate-in fade-in zoom-in duration-700">
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
      <footer className="py-10 text-center text-gray-600 text-xs uppercase tracking-widest border-t border-white/5 bg-[#050505]">
        <p>© 2024 Iron Unicorn App — Crafted with Love and Horns 🦄</p>
      </footer>
    </div>
  );
};

export default App;
