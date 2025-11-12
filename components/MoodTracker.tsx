import React from 'react';
import type { Mood } from '../types';

interface MoodTrackerProps {
  timing: 'pre-session' | 'post-session';
  onSubmit: (mood: Mood) => void;
}

const moods: Mood[] = ['Happy', 'Motivated', 'Neutral', 'Stressed', 'Sad'];

const moodConfig: { [key in Mood]: { emoji: string; color: string } } = {
  Happy: { emoji: '😊', color: 'bg-green-500 hover:bg-green-400' },
  Motivated: { emoji: '🔥', color: 'bg-orange-500 hover:bg-orange-400' },
  Neutral: { emoji: '😐', color: 'bg-gray-500 hover:bg-gray-400' },
  Stressed: { emoji: '😟', color: 'bg-purple-500 hover:bg-purple-400' },
  Sad: { emoji: '😢', color: 'bg-blue-500 hover:bg-blue-400' },
};

export const MoodTracker: React.FC<MoodTrackerProps> = ({ timing, onSubmit }) => {
  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-cyan-400 mb-2">
        {timing === 'pre-session' ? 'Ready to Begin?' : 'Session Complete!'}
      </h2>
      <p className="text-center text-gray-400 mb-6">
        First, how are you feeling right now?
      </p>
      <div className="grid grid-cols-5 gap-4">
        {moods.map((mood) => (
          <button
            key={mood}
            onClick={() => onSubmit(mood)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-transform duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${moodConfig[mood].color}`}
            aria-label={`Select mood: ${mood}`}
          >
            <span className="text-4xl">{moodConfig[mood].emoji}</span>
            <span className="text-xs font-semibold mt-2 text-white">{mood}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
