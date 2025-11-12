import React from 'react';
import { MicIcon } from './icons/MicIcon';
import { MicOffIcon } from './icons/MicOffIcon';
import { VideoIcon } from './icons/VideoIcon';
import { VideoOffIcon } from './icons/VideoOffIcon';
import { PhoneIcon } from './icons/PhoneIcon';

interface ControlBarProps {
  onStart: () => void;
  onStop: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  isSessionActive: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
}

const ControlButton: React.FC<{ onClick: () => void; className: string; children: React.ReactNode; 'aria-label': string }> = ({ onClick, className, children, 'aria-label': ariaLabel }) => (
    <button 
        onClick={onClick}
        aria-label={ariaLabel}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${className}`}
    >
        {children}
    </button>
);


export const ControlBar: React.FC<ControlBarProps> = ({ onStart, onStop, onToggleMute, onToggleVideo, isSessionActive, isMuted, isVideoOn }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-auto">
      <div className="flex items-center space-x-3 md:space-x-4 bg-gray-800/70 backdrop-blur-md p-3 rounded-full shadow-lg">
        {isSessionActive && (
          <>
            <ControlButton onClick={onToggleMute} className={isMuted ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'} aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}>
              {isMuted ? <MicOffIcon /> : <MicIcon />}
            </ControlButton>
            <ControlButton onClick={onToggleVideo} className={!isVideoOn ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'} aria-label={!isVideoOn ? 'Turn video on' : 'Turn video off'}>
              {!isVideoOn ? <VideoOffIcon /> : <VideoIcon />}
            </ControlButton>
          </>
        )}
        <ControlButton 
            onClick={isSessionActive ? onStop : onStart} 
            className={isSessionActive ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500 animate-pulse'}
            aria-label={isSessionActive ? 'End session' : 'Start session'}
        >
            <PhoneIcon className={`w-6 h-6 md:w-7 md:h-7 transition-transform duration-300 ${isSessionActive ? 'transform rotate-135' : ''}`} />
        </ControlButton>
      </div>
    </div>
  );
};
