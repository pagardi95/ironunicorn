
import React, { useState } from 'react';
import { AppRoute, Exercise, UserStats, WorkoutDay } from '../types';
import { MOCK_PLANS } from '../constants';

interface WorkoutViewProps {
  stats: UserStats;
  onFinish: (xpGained: number) => void;
  setRoute: (route: AppRoute) => void;
  dayOverride?: WorkoutDay | null;
}

const WorkoutView: React.FC<WorkoutViewProps> = ({ stats, onFinish, setRoute, dayOverride }) => {
  const [currentDay] = useState(dayOverride || MOCK_PLANS[0].days[0]);
  const [exercises, setExercises] = useState<Exercise[]>(
    currentDay.exercises.map(ex => ({ ...ex, completed: false }))
  );
  const [isFinishing, setIsFinishing] = useState(false);

  const toggleExercise = (id: string) => {
    setExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ));
  };

  const handleDifficulty = (id: string, difficulty: Exercise['difficulty']) => {
    setExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, difficulty } : ex
    ));
  };

  const handleFinish = () => {
    setIsFinishing(true);
    setTimeout(() => {
      onFinish(75); // Slightly more XP for targeted workouts
      setRoute(AppRoute.DASHBOARD);
    }, 2000);
  };

  const completedCount = exercises.filter(e => e.completed).length;
  const progressPercent = (completedCount / exercises.length) * 100;

  if (isFinishing) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-center items-center justify-center p-6 text-center">
        <div className="space-y-6">
          <div className="text-8xl animate-bounce">🦄</div>
          <h2 className="text-5xl font-oswald uppercase font-black unicorn-text-gradient">Training Beendet!</h2>
          <p className="text-gray-400 text-xl">Deine Evolution schreitet voran...</p>
          <div className="w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
            <div className="h-full unicorn-gradient animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right duration-300">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm text-purple-400 font-bold uppercase tracking-widest">{MOCK_PLANS[0].title}</h2>
          <h3 className="text-4xl font-oswald uppercase font-black tracking-tight">{currentDay.name}</h3>
        </div>
        <button 
          onClick={() => setRoute(AppRoute.DASHBOARD)}
          className="text-gray-500 hover:text-white flex items-center gap-2 text-sm font-bold uppercase"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i> Stall
        </button>
      </header>

      {/* Progress Bar */}
      <div className="glass p-5 rounded-[2rem]">
        <div className="flex justify-between text-[10px] font-bold uppercase mb-2 text-gray-400">
          <span>Workout Fortschritt</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
          <div 
            className="unicorn-gradient h-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-4">
        {exercises.map((ex) => (
          <div key={ex.id} className={`glass p-6 rounded-[2rem] border transition-all duration-300 ${ex.completed ? 'border-green-500/40 bg-green-500/5' : 'border-white/5 shadow-xl'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold mb-1">{ex.name}</h4>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{ex.sets} Sätze × {ex.reps} Wdh.</p>
              </div>
              <button 
                onClick={() => toggleExercise(ex.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${ex.completed ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}
              >
                {ex.completed ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-plus"></i>}
              </button>
            </div>
            
            <p className="text-xs italic text-gray-400 mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
              💡 {ex.weightHint}
            </p>

            {ex.completed && (
              <div className="pt-4 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Gewicht (kg)</label>
                    <input 
                      type="number" 
                      placeholder="kg" 
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Reps</label>
                    <input 
                      type="number" 
                      placeholder="Reps" 
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { val: 'too_easy', icon: 'fa-laugh-beam', color: 'text-blue-400' },
                    { val: 'just_right', icon: 'fa-smile', color: 'text-green-400' },
                    { val: 'too_hard', icon: 'fa-tired', color: 'text-red-400' }
                  ].map((btn) => (
                    <button 
                      key={btn.val}
                      onClick={() => handleDifficulty(ex.id, btn.val as any)}
                      className={`flex-1 py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${ex.difficulty === btn.val ? 'bg-white/10 border-white/30 scale-105' : 'bg-transparent border-white/5 grayscale opacity-50'}`}
                    >
                      <i className={`fa-solid ${btn.icon} ${btn.color} text-lg`}></i>
                      <span className="text-[8px] uppercase font-black">{btn.val.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button 
        disabled={completedCount < exercises.length}
        onClick={handleFinish}
        className={`w-full py-5 rounded-[2rem] font-bold text-xl uppercase tracking-widest transition-all ${completedCount === exercises.length ? 'unicorn-gradient shadow-2xl shadow-purple-500/20 active:scale-95' : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'}`}
      >
        Training abschließen
      </button>
    </div>
  );
};

export default WorkoutView;
