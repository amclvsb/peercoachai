import React, { useState } from 'react';
import type { ActionItem, Mood, SessionSummary } from '../types';
import { MoodTracker } from './MoodTracker';

interface SessionSummaryFormProps {
  onSubmit: (summaryData: Omit<SessionSummary, 'id' | 'date' | 'transcript' | 'preMood' | 'postMood'>) => void;
  onPostMoodSelect: (mood: Mood) => void;
}

export const SessionSummaryForm: React.FC<SessionSummaryFormProps> = ({ onSubmit, onPostMoodSelect }) => {
  const [keyPoints, setKeyPoints] = useState('');
  const [insights, setInsights] = useState('');
  const [actionItems, setActionItems] = useState<Omit<ActionItem, 'id' | 'completed'>[]>([]);
  const [currentActionText, setCurrentActionText] = useState('');
  const [currentActionDueDate, setCurrentActionDueDate] = useState('');
  const [moodSelected, setMoodSelected] = useState(false);

  const handleAddActionItem = () => {
    if (currentActionText.trim()) {
      setActionItems([...actionItems, { text: currentActionText, dueDate: currentActionDueDate }]);
      setCurrentActionText('');
      setCurrentActionDueDate('');
    }
  };
  
  const handleMoodSubmit = (mood: Mood) => {
    onPostMoodSelect(mood);
    setMoodSelected(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalActionItems: ActionItem[] = actionItems.map(item => ({...item, id: crypto.randomUUID(), completed: false}));
    onSubmit({ keyPoints, insights, actionItems: finalActionItems });
  };
  
  if (!moodSelected) {
    return <MoodTracker timing="post-session" onSubmit={handleMoodSubmit} />
  }

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-cyan-400 mb-6">Session Summary & Action Plan</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="key-points" className="block text-sm font-medium text-gray-300 mb-1">Key Discussion Points</label>
          <textarea
            id="key-points"
            rows={4}
            className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="insights" className="block text-sm font-medium text-gray-300 mb-1">Key Insights</label>
          <textarea
            id="insights"
            rows={4}
            className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
            value={insights}
            onChange={(e) => setInsights(e.target.value)}
            required
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Action Items</h3>
          <div className="space-y-2">
            {actionItems.map((item, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded-md flex justify-between items-center">
                <span>{item.text}</span>
                {item.dueDate && <span className="text-xs text-gray-400">{new Date(item.dueDate).toLocaleDateString()}</span>}
              </div>
            ))}
          </div>
          <div className="flex space-x-2 mt-2">
            <input
              type="text"
              placeholder="New action item..."
              className="flex-grow bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
              value={currentActionText}
              onChange={(e) => setCurrentActionText(e.target.value)}
            />
             <input
              type="date"
              className="bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
              value={currentActionDueDate}
              onChange={(e) => setCurrentActionDueDate(e.target.value)}
            />
            <button type="button" onClick={handleAddActionItem} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors">Add</button>
          </div>
        </div>

        <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-md transition-colors text-lg">Save Summary</button>
      </form>
    </div>
  );
};
