
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
              className={`text-sm font-semibold uppercase tracking-wider ${currentRoute === AppRoute.DASHBOARD ? 'text-purple-400' : 'text-gray-400'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setRoute(AppRoute.CHALLENGES)}
              className={`text-sm font-semibold uppercase tracking-wider ${currentRoute === AppRoute.CHALLENGES ? 'text-purple-400' : 'text-gray-400'}`}
            >
              Challenges
            </button>
            <div className="w-10 h-10 rounded-full unicorn-gradient p-[2px]">
              <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                 <i className="fa-solid fa-user text-xs"></i>
              </div>
            </div>
          </>
        ) : (
          <button 
            onClick={() => setRoute(AppRoute.DASHBOARD)}
            className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm uppercase hover:bg-purple-500 hover:text-white transition-all"
          >
            Anmelden
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
