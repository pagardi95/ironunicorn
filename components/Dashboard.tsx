import React, { useState, useEffect, useMemo } from 'react';
import { UserStats, AppRoute, WorkoutDay, TrainingPlan, Challenge } from '../types';
import { MOCK_PLANS } from '../constants';
import { getEvolutionInfo, getStaticEvolutionImage, generateUnicornAvatar } from '../services/geminiService';
import WorkoutPreviewModal from './WorkoutPreviewModal';

// Erweitern des globalen Window-Objekts für die aistudio-API
// FIX: Using AIStudio interface and matching environmental modifiers (readonly) to resolve declaration errors.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    readonly aistudio: AIStudio;
  }
}

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
  "Keine Abkürzungen auf dem Weg zum Olymp! Schwörst du beim Glitzer?"
];

const Dashboard: React.FC<DashboardProps> = ({ stats, setRoute, onUpdateStats, onCompleteChallenge, onSelectWorkout }) => {
  const [activeTab, setActiveTab] = useState<'unicorn' | 'challenges' | 'records' | 'plan' | 'gallery'>('unicorn');
  const [previewDay, setPreviewDay] = useState<WorkoutDay | null>(null);
  const [galleryImages, setGalleryImages] = useState<Record<number, string>>({});
  const [loadingLevels, setLoadingLevels] = useState<Set<number>>(new Set());
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number, active: boolean}>({current: 0, total: 100, active: false});
  const [inspectedPlanId, setInspectedPlanId] = useState<string>(stats.selectedPlanId || MOCK_PLANS[0].id);
  const [questToConfirm, setQuestToConfirm] = useState<{id: string, xp: number, title: string} | null>(null);
  const [currentQuote, setCurrentQuote] = useState("");

  const strengthScore = useMemo(() => {
    const total = stats.lifts.squat + stats.lifts.bench + stats.lifts.deadlift;
    return stats.lifts.bodyweight > 0 ? total / stats.lifts.bodyweight : 0;
  }, [stats.lifts]);

  useEffect(() => {
    if (!stats.avatarUrl || stats.avatarUrl.includes('unsplash')) {
      onUpdateStats({ avatarUrl: getStaticEvolutionImage(stats.level) });
    }
  }, []);

  const handleQuestClick = (quest: {id: string, xp: number, title: string}) => {
    setCurrentQuote(HONESTY_QUOTES[Math.floor(Math.random() * HONESTY_QUOTES.length)]);
    setQuestToConfirm(quest);
  };

  const confirmQuest = () => {
    if (!questToConfirm) return;
    const newXp = stats.xp + questToConfirm.xp;
    const newLevel = Math.min(100, Math.floor(newXp / 100) + (stats.isStrongStart ? 15 : 1));
    onUpdateStats({ xp: newXp, level: newLevel, avatarUrl: getStaticEvolutionImage(newLevel) });
    setQuestToConfirm(null);
  };

  const downloadImage = async (url: string, level: number) => {
    const fileName = `level_${level}.png`;
    try {
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
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

  const handleGenerateLevel = async (level: number) => {
    setLoadingLevels(prev => new Set(prev).add(level));
    try {
      const img = await generateUnicornAvatar(level);
      if (img) {
        setGalleryImages(prev => ({ ...prev, [level]: img }));
        if (level === stats.level) onUpdateStats({ avatarUrl: img });
        return img;
      }
    } catch (err) {
      console.error(`Fehler bei Level ${level}:`, err);
    } finally {
      setLoadingLevels(prev => {
        const next = new Set(prev);
        next.delete(level);
        return next;
      });
    }
    return null;
  };

  const startBatchProcess = async () => {
    if (batchProgress.active) return;

    // MANDATORY PAID KEY SELECTION CHECK
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        alert("Für die High-Quality Paid API Generierung musst du deinen API-Key aktivieren.");
        await window.aistudio.openSelectKey();
        // Nach openSelectKey gehen wir davon aus, dass der User einen Key gewählt hat (Race Condition Handling laut Guidelines)
      }
    } catch (e) {
      console.warn("AI Studio API nicht verfügbar, versuche normalen Flow.");
    }

    const confirmBatch = window.confirm("START BATCH: Level 1 bis 100 werden jetzt mit der Pro-API generiert und als level_X.png heruntergeladen. Dies nutzt deine Paid Quota. Fortfahren?");
    if (!confirmBatch) return;

    setBatchProgress({current: 0, total: 100, active: true});
    
    for (let l = 1; l <= 100; l++) {
      setBatchProgress(prev => ({...prev, current: l}));
      try {
        const img = await handleGenerateLevel(l);
        const finalUrl = img || getStaticEvolutionImage(l);
        await downloadImage(finalUrl, l);
        // Pause für Browser-Security (Multiple Downloads)
        await new Promise(r => setTimeout(r, 1200));
      } catch (err) {
        console.error(`Batch-Fehler bei Lvl ${l}:`, err);
      }
    }
    
    setBatchProgress(prev => ({...prev, active: false}));
    alert("Legendary Batch abgeschlossen! 100 Einhörner im Stall. 🦄✨");
  };

  const inspectedPlan = useMemo(() => MOCK_PLANS.find(p => p.id === inspectedPlanId) || MOCK_PLANS[0], [inspectedPlanId]);
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

      <div className="flex bg-neutral-900/50 p-1 rounded-2xl border border-white/5 max-w-xl mx-auto sticky top-20 z-40 backdrop-blur-md overflow-x-auto no-scrollbar">
        {(['unicorn', 'challenges', 'records', 'plan', 'gallery'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
            {tab === 'unicorn' ? 'Evolution' : tab === 'challenges' ? 'Challenges' : tab === 'records' ? 'Rekorde' : tab === 'plan' ? 'Plan' : 'Asset-MGR'}
          </button>
        ))}
      </div>

      {activeTab === 'unicorn' && (
        <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <div className="lg:col-span-1 glass rounded-3xl p-8 flex flex-col items-center text-center">
            <div className="relative w-full aspect-square mb-6 group">
              <div className="absolute inset-0 unicorn-gradient rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative w-full h-full rounded-3xl bg-neutral-900 border-2 border-white/10 overflow-hidden">
                {loadingLevels.has(stats.level) && (
                  <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center flex-col gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase text-white tracking-widest">Generiere Pro-Avatar...</p>
                  </div>
                )}
                <img src={stats.avatarUrl} alt="Evolution" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = getStaticEvolutionImage(stats.level)} />
              </div>
            </div>
            <h2 className="text-3xl font-oswald uppercase font-black tracking-tighter">{getEvolutionInfo(stats.level).name}</h2>
            <p className="text-[10px] text-purple-400 uppercase font-bold tracking-[0.3em] mb-6">{getEvolutionInfo(stats.level).desc}</p>
            <div className="flex gap-2 w-full">
              <button onClick={() => handleGenerateLevel(stats.level)} className="flex-1 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase hover:bg-purple-500 hover:text-white transition-all">KI Sync (Pro)</button>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-3xl p-8 bg-purple-500/5 border-purple-500/10">
              <h3 className="text-lg font-oswald uppercase font-bold mb-6">Level {stats.level} Progress</h3>
              <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden p-[3px] border border-white/5">
                <div className="unicorn-gradient h-full rounded-full transition-all duration-1000" style={{ width: `${stats.xp % 100}%` }}></div>
              </div>
            </div>
            <div className="glass rounded-3xl p-8">
              <h3 className="text-xl font-oswald uppercase font-bold text-yellow-400 mb-6"><i className="fa-solid fa-fire-lightning"></i> Quick XP</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {DAILY_QUESTS.map(quest => (
                  <div key={quest.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between group">
                    <h4 className="text-sm font-bold text-gray-200 mb-4">{quest.title}</h4>
                    <button onClick={() => handleQuestClick(quest)} className="w-full py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all">Abschließen (+{quest.xp} XP)</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="glass p-8 rounded-[2.5rem] border-purple-500/30 bg-purple-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-oswald uppercase font-black tracking-tighter">Legendary Asset Generator (PAID API)</h3>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-green-400">
                 <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
                 Paid Mode Active: gemini-3-pro-image-preview
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={startBatchProcess}
                disabled={batchProgress.active}
                className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-3 ${batchProgress.active ? 'bg-white/5 text-gray-500' : 'unicorn-gradient text-white shadow-2xl hover:scale-105 active:scale-95'}`}
              >
                <i className={`fa-solid ${batchProgress.active ? 'fa-spinner fa-spin' : 'fa-rocket'}`}></i>
                {batchProgress.active ? `Generiere Lvl ${batchProgress.current}...` : 'Start 100x Pro Batch'}
              </button>
              {batchProgress.active && (
                <div className="w-full max-w-xs space-y-2">
                   <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden border border-white/5">
                     <div className="h-full unicorn-gradient transition-all duration-300" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}></div>
                   </div>
                   <p className="text-[8px] text-gray-500 uppercase text-center font-bold">Verbleibend: {100 - batchProgress.current} Assets...</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 100 }, (_, i) => i + 1).map((level) => {
              const displayImg = galleryImages[level] || getStaticEvolutionImage(level);
              const isLoading = loadingLevels.has(level);
              return (
                <div key={level} className="glass rounded-3xl p-3 border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40">
                    <div className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-1 rounded-lg text-[10px] font-black border border-white/10 text-white">LVL {level}</div>
                    {isLoading && <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin text-white"></i></div>}
                    <img src={displayImg} alt={`Lvl ${level}`} className="w-full h-full object-cover transition-all duration-700 opacity-80 group-hover:opacity-100 group-hover:scale-110" />
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    <button onClick={() => handleGenerateLevel(level)} className="flex-1 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-purple-500 hover:text-white transition-all">KI Pro</button>
                    <button onClick={() => downloadImage(displayImg, level)} className="w-8 h-8 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 text-[10px] text-white"><i className="fa-solid fa-download"></i></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;