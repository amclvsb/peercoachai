import React from 'react';
import type { AnalysisData, TranscriptEntry } from '../types';

interface CoachingConsoleProps {
  transcript: TranscriptEntry[];
  analysis: AnalysisData | null;
  status: string;
  error: string | null;
}

const MetricDisplay: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
  <div className="bg-gray-700/50 p-4 rounded-lg text-center">
    <div className="text-sm text-cyan-300 uppercase tracking-wider">{label}</div>
    <div className="text-3xl font-bold text-white mt-1">
      {value}
      {unit && <span className="text-xl ml-1">{unit}</span>}
    </div>
  </div>
);

const ProgressBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-300">{label}</span>
            <span className="text-sm font-bold text-cyan-400">{value}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
        </div>
    </div>
);


export const CoachingConsole: React.FC<CoachingConsoleProps> = ({ transcript, analysis, status, error }) => {
  return (
    <div className="flex flex-col h-full text-gray-300">
      <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">AI Analysis Console</h2>
      
      <div className="mb-4 p-3 bg-gray-900 rounded-lg flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full animate-pulse ${status === 'Listening...' ? 'bg-green-500' : status === 'Analyzing...' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
        <span className="text-sm font-medium">{status}</span>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ProgressBar label="Positivity" value={analysis?.positivity ?? 0} />
        <ProgressBar label="Empathy" value={analysis?.empathy ?? 0} />
      </div>
      <div className="grid grid-cols-1 gap-4 mb-6">
         <MetricDisplay label="Listening Cues" value={analysis?.activeListeningCues ?? 0} />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-cyan-400">Suggested Question</h3>
        <p className="bg-gray-700/50 p-4 rounded-lg italic">
          {analysis?.suggestedQuestion || "Waiting for analysis..."}
        </p>
      </div>

      <div className="flex-grow flex flex-col min-h-0">
        <h3 className="text-lg font-semibold mb-2 text-cyan-400">Live Transcript</h3>
        <div className="bg-gray-900/70 p-3 rounded-lg flex-grow overflow-y-auto">
          {transcript.length > 0 ? (
            transcript.map((entry, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm">{entry.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center pt-4">Transcript will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
};
