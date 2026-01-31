
import React from 'react';
import { WorkoutDay } from '../types';

interface WorkoutPreviewModalProps {
  day: WorkoutDay;
  canStart: boolean;
  onClose: () => void;
  onStart: () => void;
}

const WorkoutPreviewModal: React.FC<WorkoutPreviewModalProps> = ({ day, canStart, onClose, onStart }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass w-full max-w-lg rounded-[2.5rem] p-8 border-white/10 shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-20"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="mb-6">
          <h3 className="text-3xl font-oswald uppercase font-black text-white">{day.name}</h3>
          <p className="text-sm text-purple-400 font-bold uppercase tracking-widest">
            {canStart ? 'Workout Details' : 'Übersicht (Gesperrt)'}
          </p>
        </div>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto mb-8 pr-2 custom-scrollbar">
          {day.exercises.map((ex, i) => (
            <div key={ex.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-white text-sm">{ex.name}</span>
                <span className="text-[10px] text-gray-500 font-black uppercase">Ex {i + 1}</span>
              </div>
              <div className="text-xs text-gray-400 flex gap-4">
                <span className="font-bold">{ex.sets} × {ex.reps}</span>
                <span className="italic text-gray-500">💡 {ex.weightHint}</span>
              </div>
            </div>
          ))}
        </div>

        {canStart ? (
          <button 
            onClick={onStart}
            className="w-full py-5 unicorn-gradient rounded-2xl font-bold text-xl uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
          >
            Training Jetzt Starten
          </button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
              <p className="text-xs text-red-400 font-bold uppercase tracking-widest leading-relaxed">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                Dein Einhorn ist noch nicht stark genug für dieses Gewicht!
              </p>
            </div>
            <button 
              disabled
              className="w-full py-5 bg-white/5 text-gray-600 rounded-2xl font-bold text-lg uppercase tracking-widest border border-white/5 cursor-not-allowed"
            >
              Zu Schwach 🔒
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPreviewModal;
