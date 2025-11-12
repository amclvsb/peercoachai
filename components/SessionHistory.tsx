import React, { useState } from 'react';
import type { SessionSummary, ActionItem, Mood } from '../types';

const moodConfig: { [key in Mood]: { emoji: string; color: string } } = {
  Happy: { emoji: '😊', color: 'text-green-400' },
  Motivated: { emoji: '🔥', color: 'text-orange-400' },
  Neutral: { emoji: '😐', color: 'text-gray-400' },
  Stressed: { emoji: '😟', color: 'text-purple-400' },
  Sad: { emoji: '😢', color: 'text-blue-400' },
};

const MoodIndicator: React.FC<{ mood?: Mood }> = ({ mood }) => {
    if (!mood) return null;
    return (
        <span className={`flex items-center text-sm ${moodConfig[mood].color}`}>
            <span className="text-lg mr-1">{moodConfig[mood].emoji}</span>
            {mood}
        </span>
    );
};

const ActionItemDisplay: React.FC<{ item: ActionItem }> = ({ item }) => (
    <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
        <p>{item.text}</p>
        {item.dueDate && <p className="text-xs text-gray-400">Due: {new Date(item.dueDate).toLocaleDateString()}</p>}
    </div>
);


const SessionCard: React.FC<{ session: SessionSummary }> = ({ session }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden transition-shadow shadow-md hover:shadow-cyan-500/20">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 text-left flex justify-between items-center bg-gray-800 hover:bg-gray-700/50">
                <div>
                    <h3 className="font-bold text-lg text-white">{new Date(session.date).toLocaleString()}</h3>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Pre-Session</p>
                        <MoodIndicator mood={session.preMood} />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Post-Session</p>
                        <MoodIndicator mood={session.postMood} />
                    </div>
                    <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>
            </button>
            {isOpen && (
                <div className="p-6 border-t border-gray-700 space-y-4 animate-fade-in">
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">Key Points</h4>
                        <p className="whitespace-pre-wrap bg-gray-900 p-3 rounded">{session.keyPoints}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">Insights</h4>
                        <p className="whitespace-pre-wrap bg-gray-900 p-3 rounded">{session.insights}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">Action Items</h4>
                        <div className="space-y-2">
                            {session.actionItems.map(item => <ActionItemDisplay key={item.id} item={item} />)}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">Transcript</h4>
                        <div className="bg-gray-900 p-3 rounded max-h-60 overflow-y-auto">
                            {session.transcript.map((t, i) => <p key={i} className="text-sm">{t.text}</p>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

interface SessionHistoryProps {
  sessions: SessionSummary[];
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions }) => {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h2 className="text-3xl font-bold text-white mb-6">Session History</h2>
      {sessions.length > 0 ? (
        <div className="space-y-4">
            {sessions.map(session => <SessionCard key={session.id} session={session} />)}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
            <h3 className="text-xl text-gray-400">No sessions completed yet.</h3>
            <p className="text-gray-500 mt-2">Your completed session summaries will appear here.</p>
        </div>
      )}
    </div>
  );
};
