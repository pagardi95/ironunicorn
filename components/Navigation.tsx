
import React from 'react';
import { AppRoute } from '../types';

interface NavigationProps {
  currentRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
  isLoggedIn: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentRoute, setRoute, isLoggedIn }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => setRoute(AppRoute.LANDING)}
      >
        <span className="text-2xl">🦄</span>
        <h1 className="font-oswald text-xl tracking-tighter uppercase font-bold">
          Iron <span className="text-purple-500">Unicorn</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        {isLoggedIn ? (
          <>
            <button 
              onClick={() => setRoute(AppRoute.DASHBOARD)}
              className={`text-xs font-black uppercase tracking-widest transition-colors ${currentRoute === AppRoute.DASHBOARD ? 'text-purple-400' : 'text-gray-500 hover:text-white'}`}
            >
              Dashboard
            </button>
            <div className="w-9 h-9 rounded-xl unicorn-gradient p-[2px] shadow-lg shadow-purple-500/20">
              <div className="w-full h-full rounded-xl bg-black overflow-hidden flex items-center justify-center">
                 <i className="fa-solid fa-user text-[10px]"></i>
              </div>
            </div>
          </>
        ) : (
          <button 
            onClick={() => setRoute(AppRoute.DASHBOARD)}
            className="bg-white text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-purple-500 hover:text-white transition-all tracking-widest"
          >
            Anmelden
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
