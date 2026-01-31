
import React from 'react';
import { REVIEWS, UNICORN_WISDOM } from '../constants';
import { AppRoute } from '../types';

interface LandingPageProps {
  onStart: () => void;
  setRoute: (route: AppRoute) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, setRoute }) => {
  return (
    <div className="pt-24 pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="px-6 max-w-6xl mx-auto text-center py-20">
        <div className="inline-block px-4 py-1 rounded-full border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6 bg-purple-500/5">
          Level up your life
        </div>
        <h1 className="text-6xl md:text-8xl font-black font-oswald uppercase leading-none mb-6">
          You can have <span className="unicorn-text-gradient">excuses</span><br/>
          or <span className="text-white">results.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Trainingspläne von professionellen Athleten – verpackt in die epischste Unicorn-Journey deines Lebens. Werde zum Iron Unicorn.
        </p>
        <button 
          onClick={onStart}
          className="px-10 py-5 unicorn-gradient text-white rounded-xl font-bold text-xl shadow-2xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          Starte deine Unicorn Journey
        </button>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 max-w-6xl mx-auto py-12">
        {[
          { label: 'Aktive Einhörner', value: '12.4k+' },
          { label: 'Erreichte Ziele', value: '45k+' },
          { label: 'Trainingswochen', value: '150k+' },
          { label: 'Expertise', value: 'Pro Athlets' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl text-center">
            <div className="text-3xl font-black font-oswald text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Wisdom Section */}
      <section className="px-6 max-w-6xl mx-auto py-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[2px] flex-grow bg-white/10"></div>
          <h2 className="text-3xl font-oswald uppercase font-bold tracking-tight">Einhorn-Weisheiten</h2>
          <div className="h-[2px] flex-grow bg-white/10"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {UNICORN_WISDOM.map((wisdom, i) => (
            <div key={i} className="p-8 glass rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i className="fa-solid fa-brain text-5xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4 text-purple-400 uppercase">{wisdom.title}</h3>
              <p className="text-gray-400 leading-relaxed">{wisdom.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Level 100 Mystery */}
      <section 
        className="mx-6 md:mx-auto max-w-5xl rounded-3xl bg-black border border-white/5 py-24 px-10 text-center relative overflow-hidden cursor-pointer group"
        onClick={() => setRoute(AppRoute.LEVEL_100)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/10"></div>
        <div className="relative z-10">
          <div className="text-6xl mb-8 opacity-20 grayscale scale-150 group-hover:grayscale-0 transition-all duration-1000">🦄</div>
          <h2 className="text-4xl font-oswald uppercase font-black mb-4 tracking-tighter">Level 100 — Das Ultimative Ziel</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8 uppercase text-sm tracking-[0.2em]">
            Nur wer dranbleibt, sieht die Wahrheit. Das mystische Iron Unicorn wartet am Ende der Reise.
          </p>
          <div className="w-16 h-16 rounded-full border border-white/10 mx-auto flex items-center justify-center text-2xl text-white/20">
            ?
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="px-6 max-w-6xl mx-auto py-20">
        <h2 className="text-3xl font-oswald text-center uppercase font-bold mb-12">Stimmen aus dem Stall</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div key={review.id} className="glass p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-yellow-500 mb-4 text-sm">
                  {[...Array(review.rating)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                </div>
                <p className="text-gray-300 italic mb-6">"{review.text}"</p>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <span className="font-bold text-sm">{review.name}</span>
                <span className="text-xs text-gray-500">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing / CTA */}
      <section className="px-6 max-w-4xl mx-auto py-20 text-center">
        <div className="glass p-12 rounded-[3rem] border-purple-500/20">
          <h2 className="text-5xl font-oswald uppercase font-black mb-6">Full Access</h2>
          <div className="text-6xl font-black mb-4">19,90€ <span className="text-xl text-gray-500 font-normal">/ Monat</span></div>
          <ul className="text-left max-w-xs mx-auto space-y-4 mb-10 text-gray-400">
            <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Professionelle Trainingspläne</li>
            <li><i className="fa-solid fa-check text-green-500 mr-2"></i> KI-Avatar Evolution</li>
            <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Wöchentliche Challenges</li>
            <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Mit Einhorn-Liebe gepflegt 🦄</li>
          </ul>
          <button 
            onClick={onStart}
            className="w-full py-5 unicorn-gradient rounded-2xl font-bold text-xl uppercase tracking-widest hover:scale-[1.02] transition-transform"
          >
            Jetzt Journey starten
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
