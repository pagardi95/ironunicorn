
import React, { useState, useEffect, useMemo } from 'react';
import { UserStats, AppRoute, WorkoutDay, TrainingPlan, Challenge } from '../types';
import { MOCK_PLANS } from '../constants';
import { getEvolutionInfo, getStaticEvolutionImage } from '../services/geminiService';
import WorkoutPreviewModal from './WorkoutPreviewModal';

interface DashboardProps {
  stats: UserStats;
  setRoute: (route: AppRoute) => void;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onCompleteChallenge: (challengeId: string) => void;
  onSelectWorkout: (day: WorkoutDay) => void;
}

const DAILY_QUESTS = [
  { id: 'q1', title: '100 Burpees', xp: 50, icon: 'fa-bolt', color: 'text-yellow-400' },
  { id: 'q2', title: '50 Bicep Curls', xp: 30, icon: 'fa-dumbbell', color: 'text-blue-400' },
  { id: 'q3', title: '2 Min Plank', xp: 40, icon: 'fa-clock', color: 'text-green-400' },
  { id: 'q4', title: '50 Pushups', xp: 35, icon: 'fa-hand-fist', color: 'text-red-400' },
];

const HONESTY_QUOTES = [
  "Bist du sicher? Ein Horn wächst nur auf der Wahrheit! 🦄",
  "Lügner werden zu Ponys. 💪",
  "Das Eisen lügt nicht. Wirklich fertig?",
  "Keine Abkürzungen auf dem Weg zum Olymp!"
];

const Dashboard: React.FC<DashboardProps> = ({ stats, setRoute, onUpdateStats, onCompleteChallenge, onSelectWorkout }) => {
  const [activeTab, setActiveTab] = useState<'unicorn' | 'challenges' | 'records' | 'plan' | 'gallery'>('unicorn');
  const [previewDay, setPreviewDay] = useState<WorkoutDay | null>(null);
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number, active: boolean}>({current: 0, total: 100, active: false});
  const [inspectedPlanId, setInspectedPlanId] = useState<string>(stats.selectedPlanId || MOCK_PLANS[0].id);
  const [questToConfirm, setQuestToConfirm] = useState<{id: string, xp: number, title: string} | null>(null);
  const [currentQuote, setCurrentQuote] = useState("");

  const strengthScore = useMemo(() => {
    const total = stats.lifts.squat + stats.lifts.bench + stats.lifts.deadlift;
    return stats.lifts.bodyweight > 0 ? total / stats.lifts.bodyweight : 0;
  }, [stats.lifts]);

  useEffect(() => {
    // Sync Avatar Image with current Level (Static Assets only)
    const currentLevelImg = getStaticEvolutionImage(stats.level);
    if (stats.avatarUrl !== currentLevelImg) {
      onUpdateStats({ avatarUrl: currentLevelImg });
    }
  }, [stats.level]);

  const handleQuestClick = (quest: {id: string, xp: number, title: string}) => {
    setCurrentQuote(HONESTY_QUOTES[Math.floor(Math.random() * HONESTY_QUOTES.length)]);
    setQuestToConfirm(quest);
  };

  const confirmQuest = () => {
    if (!questToConfirm) return;
    const newXp = stats.xp + questToConfirm.xp;
    const newLevel = Math.min(100, Math.floor(newXp / 100) + (stats.isStrongStart ? 15 : 1));
    onUpdateStats({ xp: newXp, level: newLevel });
    setQuestToConfirm(null);
  };

  const downloadImage = async (url: string, level: number) => {
    const fileName = `level_${level}.png`;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      console.error("Download Error:", err);
    }
  };

  const startBatchDownload = async () => {
    if (batchProgress.active) return;
    const confirmBatch = window.confirm("Möchtest du alle 100 Level-Bilder deines Stallions gesammelt herunterladen?");
    if (!confirmBatch) return;

    setBatchProgress({current: 0, total: 100, active: true});
    for (let l = 1; l <= 100; l++) {
      setBatchProgress(prev => ({...prev, current: l}));
      await downloadImage(getStaticEvolutionImage(l), l);
      await new Promise(r => setTimeout(r, 800));
    }
    setBatchProgress(prev => ({...prev, active: false}));
    alert("Alle Assets erfolgreich gesichert! 🦄✨");
  };

  const inspectedPlan = useMemo(() => 
    MOCK_PLANS.find(p => p.id === inspectedPlanId) || MOCK_PLANS[0], 
    [inspectedPlanId]
  );

  const activePlan = useMemo(() => 
    MOCK_PLANS.find(p => p.id === stats.selectedPlanId) || MOCK_PLANS[0], 
    [stats.selectedPlanId]
  );

  const meetsRequirements = (plan: TrainingPlan) => strengthScore >= plan.minStrengthScore;

  return (
    <div className="pt-8 pb-20 px-6 max-w-7xl mx-auto space-y-8">
      {questToConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="glass w-full max-w-md rounded-[2.5rem] p-8 border-white/10 text-center space-y-6">
            <div className="text-6xl">🧐</div>
            <h3 className="text-2xl font-oswald uppercase font-black text-white">Ehrlichkeit-Check</h3>
            <p className="italic text-gray-300">"{currentQuote}"</p>
            <button onClick={confirmQuest} className="w-full py-4 unicorn-gradient rounded-2xl font-bold uppercase tracking-widest text-white shadow-lg"> Ja, ich schwöre beim Horn! </button>
            <button onClick={() => setQuestToConfirm(null)} className="w-full py-2 text-gray-500 font-bold uppercase text-xs">Abbrechen</button>
          </div>
        </div>
      )}

      {previewDay && (
        <WorkoutPreviewModal day={previewDay} canStart={meetsRequirements(inspectedPlan)} onClose={() => setPreviewDay(null)} onStart={() => { onSelectWorkout(previewDay); setRoute(AppRoute.WORKOUT); }} />
      )}

      {/* Main Tab Navigation */}
      <div className="flex bg-neutral-900/50 p-1 rounded-2xl border border-white/5 max-w-xl mx-auto sticky top-20 z-40 backdrop-blur-md overflow-x-auto no-scrollbar">
        {(['unicorn', 'plan', 'challenges', 'records', 'gallery'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
            {tab === 'unicorn' ? 'Evolution' : tab === 'plan' ? 'Pläne' : tab === 'challenges' ? 'Challenges' : tab === 'records' ? 'Rekorde' : 'Asset-Galerie'}
          </button>
        ))}
      </div>

      {activeTab === 'unicorn' && (
        <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <div className="lg:col-span-1 glass rounded-3xl p-8 flex flex-col items-center text-center">
            <div className="relative w-full aspect-square mb-6 group">
              <div className="absolute inset-0 unicorn-gradient rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative w-full h-full rounded-3xl bg-neutral-900 border-2 border-white/10 overflow-hidden shadow-2xl">
                <img 
                  src={stats.avatarUrl} 
                  alt="Evolution" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  key={stats.avatarUrl}
                />
              </div>
            </div>
            <h2 className="text-3xl font-oswald uppercase font-black tracking-tighter">{getEvolutionInfo(stats.level).name}</h2>
            <p className="text-[10px] text-purple-400 uppercase font-bold tracking-[0.3em] mb-6">{getEvolutionInfo(stats.level).desc}</p>
            <div className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] uppercase font-black text-gray-500">
               Automatischer Asset-Sync Aktiv <i className="fa-solid fa-cloud-check text-green-500 ml-1"></i>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-3xl p-8 bg-purple-500/5 border-purple-500/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-oswald uppercase font-bold">Level {stats.level} Fortschritt</h3>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Nächstes Asset in {100 - (stats.xp % 100)} XP</span>
              </div>
              <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden p-[3px] border border-white/5">
                <div className="unicorn-gradient h-full rounded-full transition-all duration-1000" style={{ width: `${stats.xp % 100}%` }}></div>
              </div>
            </div>

            {/* Aktueller Trainingsplan Kurz-Info */}
            <div className="glass rounded-3xl p-8 border-l-4 border-l-purple-500">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-oswald uppercase font-black tracking-tight">Dein Plan: {activePlan.title}</h3>
                 <button onClick={() => setActiveTab('plan')} className="text-[10px] font-black uppercase text-purple-400 hover:text-white transition-colors">Wechseln <i className="fa-solid fa-chevron-right ml-1"></i></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {activePlan.days.map((day) => (
                    <div 
                      key={day.day} 
                      onClick={() => onSelectWorkout(day)}
                      className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 cursor-pointer transition-all flex flex-col items-center text-center group"
                    >
                       <i className="fa-solid fa-dumbbell text-purple-500 mb-2 group-hover:scale-110 transition-transform"></i>
                       <span className="text-[10px] font-black uppercase tracking-widest">{day.name}</span>
                       <span className="text-[8px] text-gray-500 uppercase mt-1">Tag {day.day}</span>
                    </div>
                 ))}
              </div>
            </div>

            <div className="glass rounded-3xl p-8">
              <h3 className="text-xl font-oswald uppercase font-bold text-yellow-400 mb-6"><i className="fa-solid fa-fire-lightning"></i> Daily XP Booster</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {DAILY_QUESTS.map(quest => (
                  <div key={quest.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between group hover:border-yellow-500/30 transition-all">
                    <h4 className="text-sm font-bold text-gray-200 mb-4">{quest.title}</h4>
                    <button onClick={() => handleQuestClick(quest)} className="w-full py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all">Abschließen (+{quest.xp} XP)</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-5xl font-oswald font-black uppercase tracking-tighter">Wähle deinen Pfad</h2>
            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">
              Dein aktueller Strength-Score: <span className="text-purple-400">{strengthScore.toFixed(2)}</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {MOCK_PLANS.map((plan) => {
              const isSelected = stats.selectedPlanId === plan.id;
              const canAccess = meetsRequirements(plan);
              
              return (
                <div 
                  key={plan.id} 
                  onClick={() => setInspectedPlanId(plan.id)}
                  className={`glass rounded-[2.5rem] p-8 border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col ${
                    isSelected ? 'border-purple-500 bg-purple-500/5' : 
                    inspectedPlanId === plan.id ? 'border-white/30' : 'border-white/5 grayscale opacity-70'
                  }`}
                >
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400">{plan.difficulty}</span>
                      {isSelected && <span className="bg-purple-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">Aktiv</span>}
                    </div>
                    <h3 className="text-2xl font-oswald uppercase font-black tracking-tight">{plan.title}</h3>
                  </div>
                  
                  <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-grow">{plan.description}</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-[10px] font-black uppercase border-b border-white/5 pb-2">
                       <span className="text-gray-500">Fokus</span>
                       <span className="text-white">{plan.focus}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase border-b border-white/5 pb-2">
                       <span className="text-gray-500">Dauer</span>
                       <span className="text-white">{plan.durationWeeks} Wochen</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase">
                       <span className="text-gray-500">Req. Score</span>
                       <span className={canAccess ? 'text-green-500' : 'text-red-500'}>{plan.minStrengthScore.toFixed(2)}</span>
                    </div>
                  </div>

                  {canAccess ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateStats({ selectedPlanId: plan.id }); }}
                      className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                        isSelected ? 'bg-transparent border border-purple-500 text-purple-400' : 'bg-white text-black hover:bg-purple-500 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Aktueller Plan' : 'Plan Wählen'}
                    </button>
                  ) : (
                    <div className="w-full py-4 bg-white/5 rounded-2xl text-center text-[10px] font-black uppercase text-gray-600 border border-white/5">
                      <i className="fa-solid fa-lock mr-2"></i> Zu Schwach
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Details des aktuell inspizierten Plans */}
          <div className="glass rounded-[3rem] p-10 animate-in fade-in duration-700">
             <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                <div>
                   <h3 className="text-3xl font-oswald uppercase font-black text-white mb-2">Workout-Übersicht: {inspectedPlan.title}</h3>
                   <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Klicke auf ein Workout, um die Übungen zu sehen</p>
                </div>
                {!meetsRequirements(inspectedPlan) && (
                   <p className="text-xs text-red-500 font-bold uppercase p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                      <i className="fa-solid fa-triangle-exclamation mr-2"></i> Erhöhe deine Kraftwerte im Dashboard!
                   </p>
                )}
             </div>
             
             <div className="grid md:grid-cols-2 gap-6">
                {inspectedPlan.days.map((day) => (
                   <div 
                     key={day.day}
                     onClick={() => setPreviewDay(day)}
                     className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-all flex justify-between items-center group"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                            <i className="fa-solid fa-calendar-day"></i>
                         </div>
                         <div>
                            <h4 className="font-bold text-white text-lg">{day.name}</h4>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Tag {day.day} • {day.exercises.length} Übungen</p>
                         </div>
                      </div>
                      <i className="fa-solid fa-arrow-right text-gray-700 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"></i>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="glass p-8 rounded-[2.5rem] border-white/10 bg-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-oswald uppercase font-black tracking-tighter">Stall-Inventar</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Alle 100 Evolutionsstufen deines Iron Unicorns</p>
            </div>
            <button 
              onClick={startBatchDownload}
              disabled={batchProgress.active}
              className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-3 ${batchProgress.active ? 'bg-white/5 text-gray-500' : 'bg-white text-black hover:bg-purple-500 hover:text-white shadow-xl'}`}
            >
              <i className={`fa-solid ${batchProgress.active ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
              {batchProgress.active ? `Sichere Lvl ${batchProgress.current}...` : 'Alle Assets sichern'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 100 }, (_, i) => i + 1).map((level) => {
              const displayImg = getStaticEvolutionImage(level);
              const isUnlocked = level <= stats.level;
              return (
                <div key={level} className={`glass rounded-3xl p-3 border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden ${!isUnlocked && 'opacity-40 grayscale'}`}>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40">
                    <div className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-1 rounded-lg text-[10px] font-black border border-white/10 text-white">LVL {level}</div>
                    {!isUnlocked && <div className="absolute inset-0 z-20 flex items-center justify-center"><i className="fa-solid fa-lock text-white/20 text-2xl"></i></div>}
                    <img src={displayImg} alt={`Lvl ${level}`} className="w-full h-full object-cover transition-all duration-700 opacity-80 group-hover:opacity-100 group-hover:scale-110" />
                  </div>
                  <div className="mt-3">
                    <button 
                      onClick={() => isUnlocked && downloadImage(displayImg, level)} 
                      disabled={!isUnlocked}
                      className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-tighter transition-all ${isUnlocked ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-transparent text-gray-700 cursor-not-allowed'}`}
                    >
                      <i className="fa-solid fa-download text-[8px]"></i> Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {activeTab === 'challenges' && (
        <div className="grid md:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {stats.challenges.map((challenge) => (
            <div key={challenge.id} className={`glass rounded-3xl p-8 border-2 transition-all ${challenge.completed ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/5'}`}>
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl text-purple-400">
                    <i className={`fa-solid ${challenge.type === 'streak' ? 'fa-fire' : challenge.type === 'lift' ? 'fa-weight-hanging' : 'fa-calendar-check'}`}></i>
                 </div>
                 {challenge.completed && <span className="text-[8px] font-black uppercase text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">Erledigt</span>}
              </div>
              <h3 className="text-2xl font-oswald uppercase font-black mb-2">{challenge.title}</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">{challenge.description}</p>
              <div className="text-xl font-oswald font-black text-purple-400">+{challenge.xpReward} XP</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'records' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-500 text-center">
          {[
            {l: 'Squat', v: stats.lifts.squat, i: 'fa-dumbbell', c: 'text-blue-400'}, 
            {l: 'Bench', v: stats.lifts.bench, i: 'fa-medal', c: 'text-red-400'}, 
            {l: 'Deadlift', v: stats.lifts.deadlift, i: 'fa-trophy', c: 'text-green-400'}, 
            {l: 'Body', v: stats.lifts.bodyweight, i: 'fa-scale-balanced', c: 'text-purple-400'}
          ].map(r => (
            <div key={r.l} className="glass p-8 rounded-[2rem] flex flex-col items-center">
              <i className={`fa-solid ${r.i} ${r.c} text-2xl mb-4`}></i>
              <div className="text-3xl font-black font-oswald text-white">{r.v} kg</div>
              <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">{r.l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
