import React, { useState, useEffect } from 'react';
import { UserStats, AppRoute, WorkoutDay, Challenge } from '../types';
import { MOCK_PLANS } from '../constants';
import { generateUnicornAvatar } from '../services/geminiService';
import WorkoutPreviewModal from './WorkoutPreviewModal';

interface TargetedExercise {
  part: keyof UserStats['evolution'];
  label: string;
  exercise: string;
  count: string;
  icon: string;
}

interface DashboardProps {
  stats: UserStats;
  setRoute: (route: AppRoute) => void;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onCompleteChallenge: (challengeId: string) => void;
  onSelectWorkout: (day: WorkoutDay) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, setRoute, onUpdateStats, onCompleteChallenge, onSelectWorkout }) => {
  const [activeTab, setActiveTab] = useState<'unicorn' | 'challenges' | 'records' | 'plan'>('unicorn');
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [startedWeeks, setStartedWeeks] = useState<Set<number>>(new Set([1]));
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [previewDay, setPreviewDay] = useState<WorkoutDay | null>(null);
  const [logMessage, setLogMessage] = useState<string | null>(null);
  const [confirmingExercise, setConfirmingExercise] = useState<TargetedExercise | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  const refreshAvatar = async () => {
    setAvatarLoading(true);
    setAvatarError(null);
    try {
      const url = await generateUnicornAvatar(stats);
      if (url) {
        onUpdateStats({ avatarUrl: url });
      } else {
        setAvatarError("Quota erreicht. Silhouette wird angezeigt.");
      }
    } catch (e) {
      setAvatarError("Fehler beim Laden. Silhouette wird angezeigt.");
    } finally {
      setAvatarLoading(false);
    }
  };

  useEffect(() => {
    if (!stats.avatarUrl) {
      refreshAvatar();
    }
  }, []);

  const nextEvolutionLevel = stats.level <= 1 ? 10 : stats.level <= 10 ? 25 : stats.level <= 25 ? 50 : stats.level <= 50 ? 75 : 100;
  const levelsMissing = Math.max(0, nextEvolutionLevel - stats.level);
  const currentXPInLevel = stats.xp % 100;
  const xpMissingForNextLevel = 100 - currentXPInLevel;

  const handleApplyBoost = () => {
    if (!confirmingExercise) return;
    
    const { part, exercise, count } = confirmingExercise;
    const boost = 3; 
    const xpBoost = 20; 
    
    const newEvolution = {
      ...stats.evolution,
      [part]: Math.min(100, stats.evolution[part] + boost)
    };
    
    const newXp = stats.xp + xpBoost;
    const newLevel = Math.floor(newXp / 100) + (stats.isStrongStart ? 10 : 1);

    onUpdateStats({ 
      evolution: newEvolution, 
      xp: newXp,
      level: newLevel
    });

    setLogMessage(`${exercise} geloggt! +${boost}% ${String(part)} & +${xpBoost} XP`);
    setConfirmingExercise(null);
    setTimeout(() => setLogMessage(null), 3000);

    if (newLevel > stats.level || newEvolution[part] % 10 === 0) {
      refreshAvatar();
    }
  };

  const handleStartWeek = (weekNum: number) => {
    setStartedWeeks(prev => new Set(prev).add(weekNum));
    setLogMessage(`Woche ${weekNum} gestartet! Viel Erfolg, Unicorn.`);
    setTimeout(() => setLogMessage(null), 3000);
  };

  const handleShare = async () => {
    const shareText = `Check mein Iron Unicorn Evolution Level ${stats.level}! 🦄💪 Werde auch zur Legende bei Iron Unicorn.`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Iron Unicorn Evolution',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err) {
        console.error('Clipboard failed', err);
      }
    }
  };

  const targetedExercises: TargetedExercise[] = [
    { part: 'arms', label: 'Arme', exercise: 'Hammer Curls', count: '40 Reps', icon: 'fa-hand-fist' },
    { part: 'chest', label: 'Brust', exercise: 'Diamond Pushups', count: '30 Reps', icon: 'fa-user-ninja' },
    { part: 'legs', label: 'Beine', exercise: 'Bodyweight Squats', count: '50 Reps', icon: 'fa-person-walking' },
    { part: 'horn', label: 'Horn', exercise: 'Mindfulness', count: '5 Min.', icon: 'fa-wand-sparkles' },
  ];

  const tabLabels = {
    unicorn: 'Einhorn',
    challenges: 'Quest',
    records: 'Rekorde',
    plan: 'Plan'
  };

  const currentPlan = MOCK_PLANS[0];
  const weekNumbers = Array.from({ length: currentPlan.durationWeeks }, (_, i) => i + 1);

  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto space-y-8">
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

      {/* Confirmation Modal for Targeted Exercise */}
      {confirmingExercise && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass w-full max-w-sm rounded-[2.5rem] p-10 border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-center">
            <div className="w-20 h-20 rounded-3xl unicorn-gradient flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
              <i className={`fa-solid ${confirmingExercise.icon} text-3xl text-white`}></i>
            </div>
            <h3 className="text-2xl font-oswald uppercase font-black text-white mb-2 tracking-tighter">Bist du bereit?</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Hast du wirklich <span className="text-white font-bold">{confirmingExercise.count}</span> {confirmingExercise.exercise} absolviert, um deine <span className="text-purple-400 font-bold">{confirmingExercise.label}</span> zu stählen?
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleApplyBoost}
                className="w-full py-4 unicorn-gradient rounded-2xl font-bold text-lg uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
              >
                Ja, geloggt!
              </button>
              <button 
                onClick={() => setConfirmingExercise(null)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm uppercase text-gray-400 tracking-widest transition-all"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Symmetrical Tabs Navigation with Oswald Font */}
      <div className="w-full max-w-lg mx-auto sticky top-24 z-40 antialiased">
        <div className="grid grid-cols-4 bg-neutral-900/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
          {(['unicorn', 'challenges', 'records', 'plan'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 rounded-xl text-xs sm:text-sm font-oswald font-bold uppercase tracking-wider transition-all duration-300 text-center flex items-center justify-center ${
                activeTab === tab 
                  ? 'bg-white text-black shadow-lg shadow-white/5 scale-100' 
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'unicorn' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 glass rounded-[2.5rem] p-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="relative w-full aspect-square mb-6 group">
                <div className="absolute inset-0 unicorn-gradient rounded-3xl blur-2xl opacity-10"></div>
                <div className="relative w-full h-full rounded-3xl bg-neutral-900 border-2 border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                  {avatarLoading ? (
                    <div className="flex flex-col items-center gap-4 px-4">
                      <div className="animate-spin text-4xl text-purple-500"><i className="fa-solid fa-circle-notch"></i></div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center">Evolution wird berechnet...</p>
                    </div>
                  ) : stats.avatarUrl ? (
                    <img src={stats.avatarUrl} alt="Your Unicorn" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 px-6">
                      <i className="fa-solid fa-horse text-6xl text-white/10"></i>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Warten auf Evolution...</p>
                      <button 
                        onClick={refreshAvatar}
                        className="text-[10px] text-purple-400 font-bold uppercase border border-purple-400/30 px-3 py-1 rounded-full hover:bg-purple-400 hover:text-white transition-all"
                      >
                        Generieren
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 w-full">
                <div className="space-y-1">
                  <h2 className="text-4xl font-oswald uppercase font-black tracking-tighter leading-none">Level {stats.level}</h2>
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Die Legende wächst</div>
                </div>

                <button 
                  onClick={handleShare}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 group"
                >
                  <i className="fa-solid fa-share-nodes text-purple-400 group-hover:scale-110 transition-transform"></i>
                  <span className="text-xs font-oswald uppercase font-bold tracking-widest">{shareSuccess ? 'Link kopiert!' : 'Evolution Teilen'}</span>
                </button>
              </div>

              <div className="w-full mt-8 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                    <span>Fortschritt zu Lvl {stats.level + 1}</span>
                    <span>{currentXPInLevel} / 100 XP</span>
                  </div>
                  <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5 p-[1.5px]">
                    <div className="unicorn-gradient h-full rounded-full transition-all duration-1000" style={{ width: `${currentXPInLevel}%` }}></div>
                  </div>
                  <div className="text-[9px] text-gray-500 uppercase font-bold text-left tracking-tight">
                    Noch <span className="text-white">{xpMissingForNextLevel} XP</span> bis zum nächsten Level
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                   <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Nächste Große Evolution</div>
                   <div className="text-xl font-oswald font-black text-purple-400">Level {nextEvolutionLevel}</div>
                   <div className="text-[9px] text-gray-500 uppercase font-medium">Noch {levelsMissing} Levels verbleibend</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-[2.5rem] p-8 bg-purple-500/5 border-purple-500/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-oswald uppercase font-bold tracking-tight text-white flex items-center gap-2">
                    <i className="fa-solid fa-dna text-purple-400"></i> Evolution Status
                  </h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full font-bold uppercase border border-white/5">
                      Workouts: {stats.totalWorkouts}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {Object.entries(stats.evolution).map(([part, val]) => (
                    <div key={String(part)} className="bg-black/40 p-4 rounded-3xl border border-white/5 text-center relative overflow-hidden group">
                       <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <div className="text-[9px] uppercase font-bold text-gray-500 mb-1">{part}</div>
                       <div className="text-xl font-black text-white">{val}%</div>
                       <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                         <div className="bg-purple-500 h-full" style={{ width: `${val}%` }}></div>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-md font-oswald uppercase font-bold text-white tracking-tight">Gezielte Evolution</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Logge eine Zusatz-Übung für eine bestimmte Partie</p>
                    </div>
                    {logMessage && (
                      <div className="text-[10px] font-black text-green-400 uppercase bg-green-500/10 px-3 py-1 rounded-full animate-bounce">
                        {logMessage}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {targetedExercises.map((item) => (
                      <button 
                        key={item.part}
                        onClick={() => setConfirmingExercise(item)}
                        className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-3xl border border-white/5 hover:border-purple-500/50 hover:bg-white/10 transition-all active:scale-95 group"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-black/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                          <i className={`fa-solid ${item.icon}`}></i>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] font-black uppercase text-white tracking-tighter">{item.label}</div>
                          <div className="text-[8px] font-bold text-purple-400 uppercase tracking-widest mb-0.5">{item.count}</div>
                          <div className="text-[7px] font-medium text-gray-500 uppercase tracking-widest">{item.exercise}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass rounded-[2.5rem] p-8 border-white/10 group cursor-pointer hover:border-purple-500/30 transition-all" onClick={() => setActiveTab('challenges')}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-oswald uppercase font-bold tracking-tight flex items-center gap-2 text-white">
                    <i className="fa-solid fa-trophy text-yellow-500 text-sm"></i> Nächste Herausforderung
                  </h3>
                  <i className="fa-solid fa-arrow-right text-gray-500 group-hover:translate-x-1 transition-transform"></i>
                </div>
                {stats.challenges.filter(c => !c.completed).length > 0 ? (
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-purple-400">
                      <i className="fa-solid fa-bolt"></i>
                    </div>
                    <div>
                      <div className="font-bold text-white">{stats.challenges.filter(c => !c.completed)[0].title}</div>
                      <div className="text-[10px] text-gray-500 uppercase">{stats.challenges.filter(c => !c.completed)[0].description}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">Alle aktuellen Challenges gemeistert!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="text-center max-w-lg mx-auto mb-8">
            <h3 className="text-3xl font-oswald uppercase font-black mb-2 tracking-tight text-white">Challenges</h3>
            <p className="text-gray-500 text-sm uppercase tracking-widest">Sammle XP und beschleunige deine Evolution.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {stats.challenges.map((c) => (
              <div 
                key={c.id} 
                onClick={() => !c.completed && onCompleteChallenge(c.id)}
                className={`flex items-center justify-between p-6 rounded-[2.5rem] border transition-all cursor-pointer ${
                  c.completed ? 'bg-green-500/5 border-green-500/20 opacity-60' : 'bg-white/5 border-white/5 hover:border-purple-500/30 hover:bg-white/10'
                }`}
              >
                <div className="flex gap-5 items-center">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${c.completed ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-neutral-800 text-gray-500 border border-white/5'}`}>
                     {c.completed ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-star"></i>}
                   </div>
                   <div>
                     <div className="text-lg font-bold text-white">{c.title}</div>
                     <div className="text-xs text-gray-500 uppercase font-medium tracking-wider">{c.description}</div>
                   </div>
                </div>
                <div className="text-right">
                   <div className={`text-sm font-black ${c.completed ? 'text-green-500' : 'text-purple-400'}`}>+{c.xpReward} XP</div>
                   {c.completed && <div className="text-[8px] text-green-500 uppercase font-bold mt-1">Abgeschlossen</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
           <div className="text-center max-w-lg mx-auto mb-8">
            <h3 className="text-3xl font-oswald uppercase font-black mb-2 tracking-tight text-white">Persönliche Rekorde</h3>
            <p className="text-gray-500 text-sm uppercase tracking-widest">Deine Maximalkraft-Meilensteine.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Squat', value: stats.lifts.squat, icon: 'fa-dumbbell', color: 'text-blue-400' },
              { label: 'Bench', value: stats.lifts.bench, icon: 'fa-medal', color: 'text-red-400' },
              { label: 'Deadlift', value: stats.lifts.deadlift, icon: 'fa-trophy', color: 'text-green-400' },
              { label: 'Körpergewicht', value: stats.lifts.bodyweight, icon: 'fa-scale-balanced', color: 'text-purple-400' },
            ].map((record) => (
              <div key={record.label} className="glass p-8 rounded-[2.5rem] text-center flex flex-col items-center group hover:bg-white/5 transition-all">
                <div className={`w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${record.icon} text-3xl ${record.color}`}></i>
                </div>
                <div className="text-4xl font-black font-oswald mb-1 text-white">{record.value} <span className="text-sm font-normal text-gray-500 uppercase tracking-tighter">kg</span></div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-2">{record.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            <div className="space-y-2">
              <h3 className="text-4xl font-oswald uppercase font-black text-white leading-none tracking-tighter">{currentPlan.title}</h3>
              <div className="flex items-center gap-3">
                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Fokus: {currentPlan.focus}
                </span>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Woche {activeWeek} von {currentPlan.durationWeeks}</span>
              </div>
            </div>
            
            {/* Week Selector Scroller */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
              {weekNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => setActiveWeek(num)}
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-oswald font-black text-xl transition-all border ${
                    activeWeek === num 
                      ? 'bg-white text-black border-white' 
                      : startedWeeks.has(num)
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Week Overview Card */}
          <div className="glass p-8 rounded-[2.5rem] border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-purple-500/5 to-transparent">
            <div>
              <div className="text-sm text-purple-400 font-oswald uppercase font-black tracking-widest mb-1">Status: {startedWeeks.has(activeWeek) ? 'Aktiv' : 'Bereit'}</div>
              <h4 className="text-2xl font-oswald uppercase font-black text-white">Woche {activeWeek} — {startedWeeks.has(activeWeek) ? 'Transformation läuft' : 'Noch nicht gestartet'}</h4>
              <p className="text-gray-500 text-sm max-w-md mt-2">
                {startedWeeks.has(activeWeek) 
                  ? 'Du bist in der aktiven Phase. Zieh durch, um deine Evolution zu maximieren.' 
                  : 'Bereite dich vor. Diese Woche wird deine Kraft auf ein neues Level heben.'}
              </p>
            </div>
            {!startedWeeks.has(activeWeek) && (
              <button 
                onClick={() => handleStartWeek(activeWeek)}
                className="px-8 py-4 unicorn-gradient rounded-2xl font-oswald font-black uppercase tracking-widest text-lg shadow-xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Woche Starten
              </button>
            )}
            {startedWeeks.has(activeWeek) && (
              <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 animate-pulse">
                <i className="fa-solid fa-check text-2xl"></i>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-xs font-black uppercase text-gray-500 tracking-[0.2em] ml-2">Trainingseinheiten</div>
            {currentPlan.days.map((day, idx) => (
              <div 
                key={`${activeWeek}-${day.name}`} 
                onClick={() => setPreviewDay(day)}
                className="glass p-6 rounded-[2.5rem] border border-white/5 flex justify-between items-center group hover:border-purple-500/40 hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center font-oswald font-black text-2xl group-hover:bg-white group-hover:text-black transition-all ${startedWeeks.has(activeWeek) ? 'text-purple-400' : 'text-white'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">{day.name}</h4>
                    <div className="flex gap-3 items-center mt-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{day.exercises.length} Übungen</p>
                      <div className="w-1 h-1 rounded-full bg-white/10"></div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">~ 60 Min.</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline text-[10px] text-gray-500 uppercase font-black opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 tracking-widest">Details ansehen</span>
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-purple-500 group-hover:text-purple-500 transition-all">
                    <i className="fa-solid fa-chevron-right text-xs text-gray-400 group-hover:text-purple-500"></i>
                  </div>
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