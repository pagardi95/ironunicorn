
import React, { useState, useEffect, useMemo } from 'react';
import { UserStats, AppRoute, WorkoutDay } from '../types';
import { MOCK_PLANS, EVOLUTION_STAGES } from '../constants';
import { getEvolutionInfo, getStaticEvolutionImage, generateUnicornAvatar } from '../services/geminiService';
import WorkoutPreviewModal from './WorkoutPreviewModal';

interface DashboardProps {
  stats: UserStats;
  setRoute: (route: AppRoute) => void;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onCompleteChallenge: (challengeId: string) => void;
  onSelectWorkout: (day: WorkoutDay) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, setRoute, onUpdateStats, onCompleteChallenge, onSelectWorkout }) => {
  const [activeTab, setActiveTab] = useState<'unicorn' | 'records' | 'plan' | 'gallery'>('unicorn');
  const [previewDay, setPreviewDay] = useState<WorkoutDay | null>(null);
  
  const [galleryImages, setGalleryImages] = useState<Record<number, string>>({});
  const [loadingLevels, setLoadingLevels] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Initialer Asset-Check
    if (!stats.avatarUrl || stats.avatarUrl.includes('unsplash')) {
      onUpdateStats({ avatarUrl: getStaticEvolutionImage(stats.level) });
    }
  }, [stats.level]);

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
    // Format für Supabase Upload vorbereiten
    link.download = `level_${level}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const evoInfoCurrent = useMemo(() => getEvolutionInfo(stats.level), [stats.level]);
  const allLevels = useMemo(() => Array.from({ length: 100 }, (_, i) => i + 1), []);

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-8">
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
            {tab === 'unicorn' ? 'Meine Evolution' : tab === 'gallery' ? 'Asset-Manager' : tab === 'records' ? 'Rekorde' : 'Plan'}
          </button>
        ))}
      </div>

      {activeTab === 'unicorn' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 glass rounded-3xl p-8 flex flex-col items-center text-center">
              <div className="w-full mb-6 p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex flex-col gap-2">
                <p className="text-[9px] uppercase font-black text-purple-400 tracking-tighter text-center">Cloud Asset Sync ⚡</p>
                <div className="flex gap-2">
                   <button 
                    onClick={() => onUpdateStats({ level: Math.min(100, stats.level + 1) })}
                    className="flex-1 py-2 bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-400 transition-all active:scale-95 shadow-lg shadow-purple-500/20"
                  >
                    Level Up
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
                <div className="relative w-full h-full rounded-3xl bg-neutral-900 border-2 border-white/10 overflow-hidden">
                  {loadingLevels.has(stats.level) && (
                    <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse text-white">Generiere Evolution...</p>
                    </div>
                  )}
                  <img 
                    src={stats.avatarUrl} 
                    alt="Evolution" 
                    key={stats.avatarUrl}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x800/000/fff?text=Lade+Asset+Lvl+" + stats.level;
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-1 mb-6">
                <h2 className="text-3xl font-oswald uppercase font-black tracking-tighter">{evoInfoCurrent.name}</h2>
                <p className="text-[10px] text-purple-400 uppercase font-bold tracking-[0.3em]">{evoInfoCurrent.desc}</p>
              </div>

              <button 
                onClick={() => downloadImage(stats.avatarUrl, stats.level)}
                className="text-[9px] text-gray-500 uppercase font-bold hover:text-white transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-download"></i> level_{stats.level}.png
              </button>
            </div>

            <div className="lg:col-span-2 space-y-6">
               <div className="glass rounded-3xl p-8 bg-purple-500/5 border-purple-500/10 shadow-[0_0_50px_rgba(168,85,247,0.05)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-oswald uppercase font-bold tracking-tight">Level {stats.level} Evolution</h3>
                  <span className="text-xs text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-circle-check"></i> Asset Live
                  </span>
                </div>
                <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden p-[3px] border border-white/5">
                  <div className="unicorn-gradient h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(168,85,247,0.5)]" style={{ width: `${(stats.xp % 100) || (stats.xp === 0 ? 0 : 100)}%` }}></div>
                </div>
              </div>
              
              <div className="glass rounded-3xl p-8">
                <h3 className="text-xl font-oswald uppercase font-bold mb-6 flex items-center gap-2 text-blue-400">
                  <i className="fa-solid fa-server"></i> Supabase Asset-Logik
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  Die App lädt Bilder automatisch von deiner Cloud. Wenn die KI-Quota erschöpft ist, werden deine hochgeladenen Originale genutzt.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <div className="text-2xl font-black font-oswald text-purple-400">#level_{stats.level}</div>
                    <div className="text-[9px] text-gray-500 uppercase font-bold">Cloud Filename</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <div className="text-2xl font-black font-oswald text-white">PNG</div>
                    <div className="text-[9px] text-gray-500 uppercase font-bold">Format</div>
                  </div>
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
                    <img 
                      src={displayImg} 
                      alt={`Level ${level}`} 
                      className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'scale-100' : 'opacity-80'}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x400/000/fff?text=No+Cloud+Asset+Lvl+" + level;
                      }}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1 min-h-[44px]">
                    <div className="text-[11px] font-black uppercase truncate text-white">level_{level}.png</div>
                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter leading-tight line-clamp-2">{info.name}</div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleGenerateLevel(level)}
                      disabled={isLoading}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        isLoaded 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white' 
                        : 'bg-white text-black hover:bg-purple-500 hover:text-white shadow-xl'
                      }`}
                    >
                      {isLoading ? '...' : isLoaded ? 'Regenerate' : 'Get AI'}
                    </button>
                    <button 
                      onClick={() => downloadImage(galleryImages[level] || getStaticEvolutionImage(level), level)}
                      className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <i className="fa-solid fa-download text-xs text-white"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Records & Plan Tabs bleiben unverändert */}
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
        <div className="grid md:grid-cols-2 gap-4 animate-in fade-in duration-500">
          {MOCK_PLANS[0].days.map((day) => (
            <div key={day.name} onClick={() => setPreviewDay(day)} className="glass p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:bg-white/5 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-oswald text-xl group-hover:bg-white group-hover:text-black transition-all">
                  {day.day}
                </div>
                <div>
                  <h4 className="font-bold">{day.name}</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{day.exercises.length} Exercises</p>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-600"></i>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
