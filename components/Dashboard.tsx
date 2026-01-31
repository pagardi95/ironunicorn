
import React, { useState, useEffect } from 'react';
import { UserStats, AppRoute, WorkoutDay } from '../types';
import { MOCK_PLANS } from '../constants';
import { generateUnicornAvatar } from '../services/geminiService';
import WorkoutPreviewModal from './WorkoutPreviewModal';

interface DashboardProps {
  stats: UserStats;
  setRoute: (route: AppRoute) => void;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onCompleteChallenge: (challengeId: string) => void;
  onSelectWorkout: (day: WorkoutDay) => void;
}

// Fix: Use the globally available AIStudio type and ensure modifiers match existing environment declarations.
declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

const Dashboard: React.FC<DashboardProps> = ({ stats, setRoute, onUpdateStats, onCompleteChallenge, onSelectWorkout }) => {
  const [activeTab, setActiveTab] = useState<'unicorn' | 'records' | 'plan'>('unicorn');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [previewDay, setPreviewDay] = useState<WorkoutDay | null>(null);
  const [hasKey, setHasKey] = useState(true);

  const checkKeyStatus = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected || !!process.env.API_KEY);
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Wir gehen davon aus, dass die Auswahl erfolgreich war (Race Condition Handling)
      setHasKey(true);
      refreshAvatar();
    }
  };

  const refreshAvatar = async () => {
    if (avatarLoading) return;
    setAvatarLoading(true);
    try {
      const url = await generateUnicornAvatar(stats);
      if (url) {
        onUpdateStats({ avatarUrl: url });
      } else {
        // Falls kein Bild kommt, könnte es am Key liegen
        checkKeyStatus();
      }
    } catch (e) {
      console.error("Avatar refresh failed", e);
    } finally {
      setAvatarLoading(false);
    }
  };

  useEffect(() => {
    checkKeyStatus();
    if (!stats.avatarUrl && stats.onboardingComplete) {
      refreshAvatar();
    }
  }, [stats.onboardingComplete]);

  const nextEvolutionLevel = stats.level <= 1 ? 10 : stats.level <= 10 ? 25 : stats.level <= 25 ? 50 : stats.level <= 50 ? 75 : 100;
  const progressToNextEvo = Math.min(100, (stats.level / nextEvolutionLevel) * 100);

  return (
    <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto space-y-8">
      {previewDay && (
        <WorkoutPreviewModal 
          day={previewDay} 
          onClose={() => setPreviewDay(null)} 
          onStart={() => {
            onSelectWorkout(previewDay);
            setRoute(AppRoute.WORKOUT);
          }} 
        />
      )}

      {/* Tabs Navigation */}
      <div className="flex bg-neutral-900/50 p-1 rounded-2xl border border-white/5 max-w-md mx-auto sticky top-24 z-40 backdrop-blur-md">
        {(['unicorn', 'records', 'plan'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'unicorn' ? 'Dein Einhorn' : tab === 'records' ? 'Rekorde' : 'Wochenplan'}
          </button>
        ))}
      </div>

      {activeTab === 'unicorn' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 glass rounded-3xl p-8 flex flex-col items-center text-center">
              <div className="relative w-full aspect-square mb-6 group">
                <div className="absolute inset-0 unicorn-gradient rounded-3xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative w-full h-full rounded-3xl bg-neutral-900 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                  {avatarLoading ? (
                    <div className="flex flex-col items-center gap-4 p-8">
                      <div className="relative">
                        <i className="fa-solid fa-horse text-6xl text-white/5 animate-pulse"></i>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-purple-500"></i>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] animate-bounce text-center">Magie wird gewirkt...</p>
                    </div>
                  ) : stats.avatarUrl ? (
                    <img src={stats.avatarUrl} alt="Your Unicorn" className="w-full h-full object-cover animate-in fade-in duration-1000" />
                  ) : (
                    <div className="text-center p-6 flex flex-col items-center gap-4">
                      <i className="fa-solid fa-wand-magic-sparkles text-5xl text-white/10"></i>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Avatar nicht bereit</p>
                        {!hasKey ? (
                           <button 
                            onClick={handleOpenKeySelector}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] uppercase font-black transition-all shadow-lg shadow-purple-900/20"
                          >
                            <i className="fa-solid fa-key mr-2"></i> API Key einrichten
                          </button>
                        ) : (
                          <button 
                            onClick={refreshAvatar}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] uppercase font-black transition-all"
                          >
                            Magie erneut versuchen
                          </button>
                        )}
                      </div>
                      <p className="text-[9px] text-gray-600 max-w-[150px]">
                        Tipp: Ein gültiger API-Key aus einem <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline">Projekt mit Abrechnung</a> ist nötig.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <h2 className="text-3xl font-oswald uppercase font-black tracking-tighter">Level {stats.level}</h2>
              <div className="w-full mt-4 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 tracking-tighter">
                  <span>Nächste Evolution</span>
                  <span>Lvl {nextEvolutionLevel}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="unicorn-gradient h-full transition-all duration-1000" style={{ width: `${progressToNextEvo}%` }}></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-3xl p-8">
                <h3 className="text-xl font-oswald uppercase font-bold mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-fire text-orange-500"></i> Aktuelle Challenges
                </h3>
                <div className="space-y-3">
                  {stats.challenges.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => !c.completed && onCompleteChallenge(c.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        c.completed ? 'bg-green-500/5 border-green-500/20 opacity-60' : 'bg-white/5 border-white/5 hover:border-purple-500/30'
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.completed ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-500'}`}>
                           {c.completed ? <i className="fa-solid fa-check text-xs"></i> : <i className="fa-solid fa-star text-xs"></i>}
                         </div>
                         <div>
                           <div className="text-sm font-bold">{c.title}</div>
                           <div className="text-[10px] text-gray-500 uppercase">{c.description}</div>
                         </div>
                      </div>
                      <div className="text-xs font-bold text-purple-400">+{c.xpReward} XP</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-3xl p-8 bg-purple-500/5 border-purple-500/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-oswald uppercase font-bold tracking-tight">Dein Aktiver Plan</h3>
                  <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">Pro</span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <i className="fa-solid fa-calendar-check text-2xl text-purple-400"></i>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{MOCK_PLANS[0].title}</div>
                    <div className="text-xs text-gray-400">Fokus: {MOCK_PLANS[0].focus} | 6 Wochen verbleibend</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Squat', value: stats.lifts.squat, icon: 'fa-dumbbell', color: 'text-blue-400' },
            { label: 'Bench', value: stats.lifts.bench, icon: 'fa-medal', color: 'text-red-400' },
            { label: 'Deadlift', value: stats.lifts.deadlift, icon: 'fa-trophy', color: 'text-green-400' },
            { label: 'Körpergewicht', value: stats.lifts.bodyweight, icon: 'fa-scale-balanced', color: 'text-purple-400' },
          ].map((record) => (
            <div key={record.label} className="glass p-8 rounded-3xl text-center flex flex-col items-center">
              <i className={`fa-solid ${record.icon} text-3xl ${record.color} mb-4`}></i>
              <div className="text-3xl font-black font-oswald mb-1">{record.value} <span className="text-sm font-normal text-gray-500 uppercase">kg</span></div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">{record.label}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4">
            <div>
              <h3 className="text-3xl font-oswald uppercase font-black tracking-tighter">{MOCK_PLANS[0].title}</h3>
              <p className="text-sm text-gray-500">Klicke auf einen Tag, um die Übungen zu sehen.</p>
            </div>
          </div>

          <div className="space-y-4">
            {MOCK_PLANS[0].days.map((day, idx) => (
              <div 
                key={day.name} 
                onClick={() => setPreviewDay(day)}
                className="glass p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-purple-500/40 hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-oswald font-black text-xl group-hover:bg-white group-hover:text-black transition-all">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{day.name}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{day.exercises.length} Übungen</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Vorschau anzeigen</span>
                  <i className="fa-solid fa-chevron-right text-gray-600 group-hover:text-white transition-colors"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
