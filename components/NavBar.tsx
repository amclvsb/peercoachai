import React from 'react';

type View = 'session' | 'history' | 'resources';

interface NavBarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-cyan-500 text-white'
        : 'text-gray-300 hover:bg-gray-700'
    }`}
  >
    {label}
  </button>
);

export const NavBar: React.FC<NavBarProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="bg-gray-800/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-700">
      <div>
        <h1 className="text-xl font-bold text-cyan-400">Peer Support AI Coach</h1>
        <p className="text-xs text-gray-400">Powered by Gemini</p>
      </div>
      <div className="flex items-center space-x-2">
        <NavButton
          label="Live Session"
          isActive={currentView === 'session'}
          onClick={() => onViewChange('session')}
        />
        <NavButton
          label="Session History"
          isActive={currentView === 'history'}
          onClick={() => onViewChange('history')}
        />
        <NavButton
          label="Resource Library"
          isActive={currentView === 'resources'}
          onClick={() => onViewChange('resources')}
        />
      </div>
    </nav>
  );
};
