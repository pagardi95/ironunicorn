
import React, { useState, useEffect, useMemo } from 'react';
import { UserStats, AppRoute, WorkoutDay, TrainingPlan } from '../types';
import { MOCK_PLANS } from '../constants';
import { getEvolutionInfo, getStaticEvolutionImage, generateUnicornAvatar } from '../services/geminiService';
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
  "Lügner werden zu Ponys. Hast du die Reps wirklich gemacht? 💪",
  "Das Eisen lügt nicht, und ein echtes Iron Unicorn auch nicht. Wirklich fertig?",
  "Mein Horn vibriert... war das echtes Schwitzen oder nur Wasser? 💦",
  "Einhörner sehen alles. Hast du wirklich jede Wiederholung gezählt?",
  "Keine Abkürzungen auf dem Weg zum Olymp! Schwörst du beim Glitzer?"
];

const Dashboard: React.FC<DashboardProps> = ({ stats, setRoute, onUpdateStats, onCompleteChallenge, onSelectWorkout }) => {
  const [activeTab, setActiveTab] = useState<'unicorn' | 'records' | 'plan' | 'gallery'>('unicorn');
  const [previewDay, setPreviewDay] = useState<WorkoutDay | null>(null);
  const [galleryImages, setGalleryImages] = useState<Record<number, string>>({});
  const [loadingLevels, setLoadingLevels] = useState<Set<number>>(new Set());
  
  // Welcher Plan wird gerade im UI inspiziert (unabhängig davon, welcher aktiv ist)
  const [inspectedPlanId, setInspectedPlanId] = useState<string>(stats.selectedPlanId || MOCK_PLANS[0].id);

  // State für Quest-Bestätigung
  const [questToConfirm, setQuestToConfirm] = useState<{id: string, xp: number, title: string} | null>(null);
  const [currentQuote, setCurrentQuote] = useState("");

  // Strength Quotient Calculation
  const strengthScore = useMemo(() => {
    const total = stats.lifts.squat + stats.lifts.bench + stats.lifts.deadlift;
    return stats.lifts.bodyweight > 0 ? total / stats.lifts.bodyweight : 0;
  }, [stats.lifts]);

  useEffect(() => {
    if (!stats.avatarUrl || stats.avatarUrl.includes('unsplash')) {
      onUpdateStats({ avatarUrl: getStaticEvolutionImage(stats.level) });
    }
    // Set default plan if none selected
    if (!stats.selectedPlanId && MOCK_PLANS.length > 0) {
      onUpdateStats({ selectedPlanId: MOCK_PLANS[0].id });
      setInspectedPlanId(MOCK_PLANS[0].id);
    }
  }, [stats.level]);

  const handleQuestClick = (quest: {id: string, xp: number, title: string}) => {
    const randomQuote = HONESTY_QUOTES[Math.floor(Math.random() * HONESTY_QUOTES.length)];
    setCurrentQuote(randomQuote);
    setQuestToConfirm(quest);
  };

  const confirmQuest = () => {
    if (!questToConfirm) return;
    handleAddXP(questToConfirm.xp);
    setQuestToConfirm(null);
  };

  const handleAddXP = (amount: number) => {
    const newXp = stats.xp + amount;
    const newLevel = Math.min(100, Math.floor(newXp / 100) + (stats.isStrongStart ? 15 : 1));
    onUpdateStats({ 
      xp: newXp, 
      level: newLevel,
      avatarUrl: getStaticEvolutionImage(newLevel)
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Iron Unicorn Evolution',
      text: `Schau dir mein Level ${stats.level} Iron Unicorn an! Trainiere mit mir für maximale Gains. 🦄💪`,
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Link zum Teilen wurde in die Zwischenablage kopiert! 🦄');
      }
    } catch (err) {
      console.error('Fehler beim Teilen:', err);
    }
  };

  const handleGenerateLevel = async (level: number) => {
    if (loadingLevels.has(level)) return;
    setLoadingLevels(prev => new Set(prev).add(level));
    try {
      const img = await generateUnicornAvatar(level, true);
      if (img) {
        setGalleryImages(prev => ({ ...prev, [level]: img }));
        if (level === stats.level) {
          onUpdateStats({ avatarUrl: img });
        }
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
  };

  const downloadImage = (url: string | undefined, level: number) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `level_${level}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inspectedPlan = useMemo(() => 
    MOCK_PLANS.find(p => p.id === inspectedPlanId) || MOCK_PLANS[0], 
    [inspectedPlanId]
  );

  const evoInfoCurrent = useMemo(() => getEvolutionInfo(stats.level), [stats.level]);
  const allLevels = useMemo(() => Array.from({ length: 100 }, (_, i) => i + 1), []);

  const meetsRequirements = (plan: TrainingPlan) => strengthScore >= plan.minStrengthScore;

  const getPlanRecommendation = (plan: TrainingPlan) => {
    if (meetsRequirements(plan)) {
      const betterPlans = MOCK_PLANS.filter(p => p.minStrengthScore > plan.minStrengthScore && meetsRequirements(p));
      return betterPlans.length === 0;
    }
    return false;
  };

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-8">
      {/* Honesty Check Modal */}
      {questToConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass w-full max-w-md rounded-[2.5rem] p-8 border-white/10 text-center space-y-6 shadow-[0_0_100px_rgba(168,85,247,0.2)]">
            <div className="text-6xl animate-bounce">🧐</div>
            <h3 className="text-2xl font-oswald uppercase font-black text-white">Ehrlichkeit-Check</h3>
            <div className="p-4 bg-white/5 rounded-2xl italic text-gray-300 border border-white/5">
              "{currentQuote}"
            </div>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">
              Bestätige: {questToConfirm.title} (+{questToConfirm.xp} XP)
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmQuest}
                className="w-full py-4 unicorn-gradient rounded-2xl font-bold text-lg uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
              >
                Ja, ich schwöre beim Horn!
              </button>
              <button 
                onClick={() => setQuestToConfirm(null)}
                className="w-full py-4 bg-white/5 text-gray-400 rounded-2xl font-bold text-sm uppercase tracking-widest hover:text-white transition-all"
              >
                Ups, erwischt... noch nicht.
              </button>
            </div>
          </div>
        </div>
      )}

      {previewDay && (
        <WorkoutPreviewModal 
          day={previewDay} 
          canStart={meetsRequirements(inspectedPlan)}
          onClose={() => setPreviewDay(null)} 
          onStart={() => {
            onSelectWorkout(previewDay);
            setRoute(AppRoute.WORKOUT);
          }} 
        />
      )}

      {/* Navigation Tabs */}
      <div className="flex bg-neutral-900/50 p-1 rounded-2xl border border-white/5 max-w-xl mx-auto sticky top-24 z-40 backdrop-blur-md overflow-x-auto no-scrollbar">
        {(['unicorn', 'gallery', 'records', 'plan'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'unicorn' ? 'Meine Evolution' : tab === 'gallery' ? 'Asset-Manager' : tab === 'records' ? 'Rekorde' : 'Trainingsplan'}
          </button>
        ))}
      </div>

      {activeTab === 'unicorn' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 glass rounded-3xl p-8 flex flex-col items-center text-center">
              <div className="w-full mb-6 p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex flex-col gap-2">
                <p className="text-[9px] uppercase font-black text-purple-400 tracking-tighter text-center">Sync & Evolution ⚡</p>
                <div className="flex gap-2">
                   <button 
                    onClick={() => handleAddXP(50)}
                    className="flex-1 py-2 bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-400 transition-all active:scale-95 shadow-lg shadow-purple-500/20"
                  >
                    Quick XP
                  </button>
                  <button 
                    onClick={() => handleGenerateLevel(stats.level)}
                    disabled={loadingLevels.has(stats.level)}
                    className="flex-1 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loadingLevels.has(stats.level) ? '...' : 'KI Sync'}
                  </button>
                </div>
              </div>

              <div className="relative w-full aspect-square mb-6 group">
                <div className="absolute inset-0 unicorn-gradient rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative w-full h-full rounded-3xl bg-neutral-900 border-2 border-white/10 overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.15)]">
                  {loadingLevels.has(stats.level) && (
                    <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse text-white">Generiere...</p>
                    </div>
                  )}
                  <img 
                    src={stats.avatarUrl} 
                    alt="Evolution" 
                    key={stats.avatarUrl}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getStaticEvolutionImage(stats.level);
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-1 mb-6">
                <h2 className="text-3xl font-oswald uppercase font-black tracking-tighter">{evoInfoCurrent.name}</h2>
                <p className="text-[10px] text-purple-400 uppercase font-bold tracking-[0.3em]">{evoInfoCurrent.desc}</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => downloadImage(stats.avatarUrl, stats.level)}
                  className="text-[9px] text-gray-500 uppercase font-bold hover:text-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-download"></i> Save
                </button>
                <button 
                  onClick={handleShare}
                  className="text-[9px] text-purple-400 uppercase font-black hover:text-purple-300 transition-all flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20"
                >
                  <i className="fa-solid fa-share-nodes"></i> Share Evolution
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Progress Bar Section */}
              <div className="glass rounded-3xl p-8 bg-purple-500/5 border-purple-500/10 shadow-[0_0_50px_rgba(168,85,247,0.05)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-oswald uppercase font-bold tracking-tight">Level {stats.level} Fortschritt</h3>
                  <span className="text-xs text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    {stats.xp} XP Gesamt
                  </span>
                </div>
                <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden p-[3px] border border-white/5">
                  <div className="unicorn-gradient h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(168,85,247,0.5)]" style={{ width: `${(stats.xp % 100) || (stats.xp === 0 ? 0 : 100)}%` }}></div>
                </div>
                <p className="text-[9px] text-gray-500 uppercase font-bold mt-4 tracking-widest text-right">Noch {100 - (stats.xp % 100)} XP bis Level {stats.level + 1}</p>
              </div>
              
              {/* Daily Quests Section */}
              <div className="glass rounded-3xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-oswald uppercase font-bold flex items-center gap-2 text-yellow-400">
                    <i className="fa-solid fa-fire-lightning"></i> Quick Level Up Quests
                  </h3>
                  <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-lg font-black uppercase">XP Booster</span>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {DAILY_QUESTS.map(quest => (
                    <div key={quest.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between group hover:border-yellow-500/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${quest.color}`}>
                          <i className={`fa-solid ${quest.icon} text-lg`}></i>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-white">{quest.xp} XP</div>
                          <div className="text-[8px] text-gray-500 uppercase font-bold">Belohnung</div>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-gray-200 mb-4">{quest.title}</h4>
                      <button 
                        onClick={() => handleQuestClick(quest)}
                        className="w-full py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all active:scale-95 shadow-lg"
                      >
                        Abschließen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-6xl font-oswald font-black uppercase tracking-tighter">Asset-Manager</h2>
            <p className="text-gray-500 text-sm uppercase tracking-[0.2em] font-bold leading-relaxed">
              Verwalte deine 100 Level-Bilder. Generiere KI-Versionen, lade sie herunter und lege sie als <code className="text-white">level_X.png</code> in Supabase ab.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {allLevels.map((level) => {
              const info = getEvolutionInfo(level);
              const isLoaded = !!galleryImages[level];
              const isLoading = loadingLevels.has(level);
              const displayImg = galleryImages[level] || getStaticEvolutionImage(level);
              return (
                <div key={level} className="glass rounded-3xl p-4 flex flex-col gap-4 border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40">
                    <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black border border-white/10 text-white">
                      LVL {level}
                    </div>
                    {isLoading && (
                      <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img src={displayImg} alt={`Level ${level}`} className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'scale-100' : 'opacity-80'}`} onError={(e) => { (e.target as HTMLImageElement).src = getStaticEvolutionImage(level); }} />
                  </div>
                  <div className="flex flex-col gap-1 min-h-[44px]">
                    <div className="text-[11px] font-black uppercase truncate text-white">level_{level}.png</div>
                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter leading-tight line-clamp-2">{info.name}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleGenerateLevel(level)} disabled={isLoading} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLoaded ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white' : 'bg-white text-black hover:bg-purple-500 hover:text-white shadow-xl'}`}>
                      {isLoading ? '...' : isLoaded ? 'Regenerate' : 'Get AI'}
                    </button>
                    <button onClick={() => downloadImage(galleryImages[level] || getStaticEvolutionImage(level), level)} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
                      <i className="fa-solid fa-download text-xs text-white"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
          {[
            { label: 'Squat', value: stats.lifts.squat, icon: 'fa-dumbbell', color: 'text-blue-400' },
            { label: 'Bench', value: stats.lifts.bench, icon: 'fa-medal', color: 'text-red-400' },
            { label: 'Deadlift', value: stats.lifts.deadlift, icon: 'fa-trophy', color: 'text-green-400' },
            { label: 'Gewicht', value: stats.lifts.bodyweight, icon: 'fa-scale-balanced', color: 'text-purple-400' },
          ].map((record) => (
            <div key={record.label} className="glass p-8 rounded-3xl text-center">
              <i className={`fa-solid ${record.icon} text-3xl ${record.color} mb-4`}></i>
              <div className="text-3xl font-black font-oswald">{record.value} kg</div>
              <div className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-widest">{record.label}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="animate-in fade-in duration-500 space-y-12">
          {/* Plan Selection Header */}
          <div className="text-center space-y-4">
             <h2 className="text-4xl font-oswald font-black uppercase tracking-tighter">Plan-Auswahl</h2>
             <p className="text-gray-500 text-sm uppercase tracking-widest">
               Dein Strength-Quotient: <span className="text-purple-400 font-black">{strengthScore.toFixed(2)}</span>
             </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {MOCK_PLANS.map((plan) => {
              const isSelected = stats.selectedPlanId === plan.id;
              const isInspected = inspectedPlanId === plan.id;
              const isRecommended = getPlanRecommendation(plan);
              const meetsReq = meetsRequirements(plan);

              return (
                <div 
                  key={plan.id} 
                  onClick={() => setInspectedPlanId(plan.id)}
                  className={`glass rounded-[2.5rem] p-8 border-2 transition-all relative overflow-hidden flex flex-col cursor-pointer ${isInspected ? 'border-purple-500 bg-white/5 scale-[1.02]' : 'border-white/5 hover:border-white/20'}`}
                >
                  {isRecommended && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-black text-[8px] font-black uppercase px-2 py-1 rounded-full animate-pulse z-10">
                      Empfohlen
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-4 left-4 bg-purple-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full z-10">
                      Aktiv
                    </div>
                  )}
                  <div className="mb-6 pt-2">
                    <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest">{plan.difficulty}</span>
                    <h3 className="text-2xl font-oswald uppercase font-black">{plan.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">{plan.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                      <span>Dauer:</span>
                      <span className="text-white">{plan.durationWeeks} Wochen</span>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                      <span>Min. Score:</span>
                      <span className={meetsReq ? 'text-green-400' : 'text-red-400'}>{plan.minStrengthScore.toFixed(1)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (meetsReq) onUpdateStats({ selectedPlanId: plan.id });
                    }}
                    disabled={!meetsReq && !isSelected}
                    className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      isSelected 
                      ? 'bg-purple-500 text-white shadow-xl' 
                      : meetsReq 
                        ? 'bg-white text-black hover:bg-gray-200 shadow-lg' 
                        : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {isSelected ? 'Aktiver Plan' : meetsReq ? 'Als Aktiv Setzen' : 'Zu Schwach 🔒'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Inspection Zone */}
          <div className="space-y-6 pt-12 border-t border-white/5 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl font-oswald uppercase font-black text-white flex items-center gap-3">
                  <i className={`fa-solid fa-calendar-days ${meetsRequirements(inspectedPlan) ? 'text-purple-400' : 'text-gray-600'}`}></i>
                  Vorschau: {inspectedPlan.title}
                </h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">
                  {meetsRequirements(inspectedPlan) 
                    ? 'Wähle eine Einheit, um das Training zu starten.' 
                    : 'Du kannst die Übungen einsehen, aber das Training ist noch gesperrt.'}
                </p>
              </div>
              {!meetsRequirements(inspectedPlan) && (
                <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                   <i className="fa-solid fa-lock text-red-500 text-sm"></i>
                   <span className="text-[10px] font-black uppercase text-red-400">Gesperrt: Erhöhe deine Kraftwerte!</span>
                </div>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {inspectedPlan.days.map((day) => (
                <div 
                  key={day.name} 
                  onClick={() => setPreviewDay(day)} 
                  className={`glass p-6 rounded-3xl border flex justify-between items-center group cursor-pointer transition-all hover:scale-[1.02] ${meetsRequirements(inspectedPlan) ? 'border-white/5 hover:bg-white/5' : 'border-white/5 opacity-70'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-oswald text-xl transition-all ${meetsRequirements(inspectedPlan) ? 'group-hover:bg-white group-hover:text-black' : ''}`}>
                      {day.day}
                    </div>
                    <div>
                      <h4 className="font-bold">{day.name}</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">{day.exercises.length} Übungen</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!meetsRequirements(inspectedPlan) && <i className="fa-solid fa-eye text-gray-500 text-xs"></i>}
                    <i className="fa-solid fa-chevron-right text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
