
import React, { useState } from 'react';
import { Lifts } from '../types';

interface OnboardingProps {
  onComplete: (lifts: Lifts, gender: 'male' | 'female') => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [lifts, setLifts] = useState<Lifts>({
    bodyweight: 75,
    squat: 0,
    bench: 0,
    deadlift: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onComplete(lifts, gender);
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h2 className="text-5xl font-oswald uppercase font-black mb-4">Deine Basis</h2>
        <p className="text-gray-400 font-medium">Bevor die Journey beginnt, müssen wir wissen, wer du bist. Dein Einhorn passt sich deiner Identität und Kraft an.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden">
        {/* Gender Selection */}
        <div className="space-y-4">
          <label className="text-xs uppercase font-bold text-gray-500 tracking-widest ml-1">Geschlecht wählen</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all duration-300 ${
                gender === 'male' 
                  ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/10' 
                  : 'bg-black/40 border-white/5 hover:border-white/20'
              }`}
            >
              <i className={`fa-solid fa-mars text-3xl ${gender === 'male' ? 'text-purple-400' : 'text-gray-600'}`}></i>
              <span className={`text-sm font-bold uppercase tracking-widest ${gender === 'male' ? 'text-white' : 'text-gray-500'}`}>Männlich</span>
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all duration-300 ${
                gender === 'female' 
                  ? 'bg-pink-500/10 border-pink-500 shadow-lg shadow-pink-500/10' 
                  : 'bg-black/40 border-white/5 hover:border-white/20'
              }`}
            >
              <i className={`fa-solid fa-venus text-3xl ${gender === 'female' ? 'text-pink-400' : 'text-gray-600'}`}></i>
              <span className={`text-sm font-bold uppercase tracking-widest ${gender === 'female' ? 'text-white' : 'text-gray-500'}`}>Weiblich</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase font-bold text-gray-500 tracking-widest ml-1">Körpergewicht (kg)</label>
          <input 
            type="number" 
            required
            min="30"
            max="300"
            value={lifts.bodyweight || ''}
            onChange={(e) => setLifts({...lifts, bodyweight: Number(e.target.value)})}
            className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:border-purple-500 outline-none transition-all text-xl font-bold"
            placeholder="z.B. 80"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Squat', key: 'squat' },
            { label: 'Bench', key: 'bench' },
            { label: 'Deadlift', key: 'deadlift' },
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-xs uppercase font-bold text-gray-500 tracking-widest ml-1">{field.label} (kg)</label>
              <input 
                type="number"
                required
                min="0"
                max="500"
                value={(lifts as any)[field.key] || ''}
                onChange={(e) => setLifts({...lifts, [field.key]: Number(e.target.value)})}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:border-purple-500 outline-none transition-all text-xl font-bold"
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
          <p className="text-[11px] text-gray-400 italic text-center leading-relaxed">
            <i className="fa-solid fa-circle-info text-purple-400 mr-1"></i>
            Hinweis: Dein Avatar wird basierend auf deinem Geschlecht und deiner Kraft evolutionär angepasst.
          </p>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-6 unicorn-gradient rounded-3xl font-bold text-xl uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02]'}`}
        >
          {isSubmitting ? (
            <>
              <i className="fa-solid fa-circle-notch animate-spin"></i>
              Initialisierung...
            </>
          ) : (
            'Journey Starten'
          )}
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
