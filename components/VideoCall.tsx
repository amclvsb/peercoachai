import React, { useRef, useEffect } from 'react';

interface VideoCallProps {
  localStream: MediaStream | null;
  isVideoOn: boolean;
  isSessionActive: boolean;
}

export const VideoCall: React.FC<VideoCallProps> = ({ localStream, isVideoOn, isSessionActive }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl relative">
      {/* Remote Participant View */}
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <img 
            src="https://picsum.photos/seed/client/1200/900" 
            alt="Client" 
            className="object-cover w-full h-full opacity-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            {!isSessionActive ? (
                <div className="text-center p-8 bg-black/50 rounded-lg">
                    <h2 className="text-3xl font-semibold text-gray-200">Session Ended</h2>
                    <p className="text-gray-400 mt-2">Click the phone icon to start a new coaching session.</p>
                </div>
            ) : (
                 <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-sm">
                    Client View
                </div>
            )}
        </div>
      </div>

      {/* Local Participant (Coach) View */}
      {isSessionActive && (
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-36 h-24 sm:w-48 sm:h-32 md:w-64 md:h-48 rounded-lg overflow-hidden border-2 border-cyan-500 shadow-lg transition-opacity duration-300">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoOn ? 'opacity-100' : 'opacity-0'}`}
          />
          {!isVideoOn && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Video Off</span>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/50 px-2 py-0.5 rounded-full text-xs">
            Coach (You)
          </div>
        </div>
      )}
    </div>
  );
};
