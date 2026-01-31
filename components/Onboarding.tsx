
import React, { useState } from 'react';
import { Lifts } from '../types';

interface OnboardingProps {
  onComplete: (lifts: Lifts, name: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [lifts, setLifts] = useState<Lifts>({
    bodyweight: 75,
    squat: 0,
    bench: 0,
    deadlift: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(lifts, name);
  };

  return (
    <div className="pt-8 pb-20 px-6 max-w-xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-oswald uppercase font-black mb-4">Deine Basis</h2>
        <p className="text-gray-400">Bevor die Journey beginnt, müssen wir wissen, wer du bist und wo du stehst. Dein Einhorn passt sich deiner Identität und Kraft an.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-[2rem] space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase font-bold text-gray-500 tracking-widest">Wie soll dein Einhorn heißen? (Dein Name)</label>
          <input 
            type="text" 
            required
            placeholder="z.B. Patrick"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none text-white font-bold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase font-bold text-gray-500 tracking-widest">Körpergewicht (kg)</label>
          <input 
            type="number" 
            required
            value={lifts.bodyweight || ''}
            onChange={(e) => setLifts({...lifts, bodyweight: Number(e.target.value)})}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Squat', key: 'squat' },
            { label: 'Bench', key: 'bench' },
            { label: 'Deadlift', key: 'deadlift' },
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-xs uppercase font-bold text-gray-500 tracking-widest">{field.label} (kg)</label>
              <input 
                type="number"
                required
                value={(lifts as any)[field.key] || ''}
                onChange={(e) => setLifts({...lifts, [field.key]: Number(e.target.value)})}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
              />
            </div>
          ))}
        </div>

        <p className="text-[10px] text-gray-500 italic text-center">
          Hinweis: Wenn deine Grundübungen über deinem Körpergewicht liegen, startest du bereits als fortgeschrittenes Einhorn.
        </p>

        <button 
          type="submit"
          className="w-full py-5 unicorn-gradient rounded-2xl font-bold text-xl uppercase tracking-widest shadow-xl shadow-purple-500/10 active:scale-[0.98] transition-all"
        >
          Journey Starten
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
