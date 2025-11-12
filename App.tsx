import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { LiveSession } from '@google/genai';

import { VideoCall } from './components/VideoCall';
import { CoachingConsole } from './components/CoachingConsole';
import { ControlBar } from './components/ControlBar';
import { NavBar } from './components/NavBar';
import { MoodTracker } from './components/MoodTracker';
import { SessionSummaryForm } from './components/SessionSummaryForm';
import { SessionHistory } from './components/SessionHistory';
import { ResourceLibrary } from './components/ResourceLibrary';

import { startLiveSession, analyzeConversationTurn, generateSpeech } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audio';
import type { AnalysisData, TranscriptEntry, Mood, SessionSummary, Resource } from './types';

type View = 'session' | 'history' | 'resources';
type SessionStage = 'idle' | 'live' | 'summary';

const App: React.FC = () => {
  // Global App State
  const [view, setView] = useState<View>('session');
  const [sessionStage, setSessionStage] = useState<SessionStage>('idle');
  
  // Data State
  const [sessionHistory, setSessionHistory] = useState<SessionSummary[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  // Live Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Idle');
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
  const [isAudioFeedbackOn, setIsAudioFeedbackOn] = useState(false);


  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const currentTurnTranscriptRef = useRef('');
  const currentSessionData = useRef<{ id: string; preMood?: Mood; postMood?: Mood }>({ id: '' });
  const localStreamRef = useRef<MediaStream | null>(null);
  const speechEndTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('peerCoach_sessionHistory');
      if (savedHistory) setSessionHistory(JSON.parse(savedHistory));

      const savedResources = localStorage.getItem('peerCoach_resources');
      if (savedResources) setResources(JSON.parse(savedResources));
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);

  // Persist data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('peerCoach_sessionHistory', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  useEffect(() => {
    localStorage.setItem('peerCoach_resources', JSON.stringify(resources));
  }, [resources]);

  // Effect for playing audio feedback
  useEffect(() => {
    if (isAudioFeedbackOn && analysis?.suggestedQuestion) {
        const playAudio = async () => {
            try {
                setStatus('Generating audio cue...');
                const base64Audio = await generateSpeech(analysis.suggestedQuestion);

                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const ctx = audioContextRef.current;
                
                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    ctx,
                    24000,
                    1,
                );

                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.start();
                setStatus('Listening...');
            } catch (err) {
                console.error("Failed to play audio feedback:", err);
                setError("Could not generate audio cue.");
                setStatus('Listening...'); // Reset status
            }
        };
        playAudio();
    }
}, [analysis, isAudioFeedbackOn]);


  const updateLocalStream = (stream: MediaStream | null) => {
    localStreamRef.current = stream;
    setLocalStream(stream);
  }

  const handleAnalysis = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setStatus('Analyzing...');
    try {
      const result = await analyzeConversationTurn(text);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to get analysis from Gemini.');
    } finally {
        if(!isAudioFeedbackOn) {
          setStatus('Listening...');
        }
    }
  }, [isAudioFeedbackOn]);

  const onMessage = useCallback((message: any) => {
      if (message.serverContent?.inputTranscription) {
        const text = message.serverContent.inputTranscription.text;
        currentTurnTranscriptRef.current += text;
        
        // Coach is speaking
        setIsCoachSpeaking(true);
        if (speechEndTimerRef.current) clearTimeout(speechEndTimerRef.current);
        speechEndTimerRef.current = window.setTimeout(() => {
            setIsCoachSpeaking(false);
        }, 1500); // 1.5 second pause indicates end of speech
      }
      
      // Per Gemini API guidelines, we must handle the audio output stream,
      // even if we don't intend to play it. This ensures connection stability.
      const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        // Audio chunk received from Gemini. We are not playing it back in this app.
      }
      
      if (message.serverContent?.turnComplete) {
        // Coach has finished their turn
        if (speechEndTimerRef.current) clearTimeout(speechEndTimerRef.current);
        setIsCoachSpeaking(false);

        const fullTurnText = currentTurnTranscriptRef.current;
        if(fullTurnText.trim()){
            setTranscript(prev => [...prev, { speaker: 'Coach', text: fullTurnText }]);
            handleAnalysis(fullTurnText);
        }
        currentTurnTranscriptRef.current = '';
      }
  }, [handleAnalysis]);
  
  const stopSession = useCallback(() => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      updateLocalStream(null);
    }
    setIsSessionActive(false);
    setSessionStage('summary');
    setStatus('Session Ended');

    if (speechEndTimerRef.current) {
      clearTimeout(speechEndTimerRef.current);
      speechEndTimerRef.current = null;
    }
    setIsCoachSpeaking(false);
  }, []);

  const startSession = useCallback(async (mood: Mood) => {
    setError(null);
    setStatus('Initializing...');
    currentSessionData.current = { id: crypto.randomUUID(), preMood: mood };
    setTranscript([]);
    setAnalysis(null);

    let stream: MediaStream | null = null;
    let videoEnabled = false;

    try {
        // Attempt 1: Get both audio and video
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        videoEnabled = true;
    } catch (err) {
        console.warn('Could not get audio and video stream, falling back to audio-only.', err);
        try {
            // Attempt 2: Get audio only if the first attempt failed
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            videoEnabled = false;
        } catch (audioErr) {
            console.error('Failed to get audio stream:', audioErr);
            let errorMessage = 'Could not access the microphone. Please check permissions and ensure a device is connected.';
            if (audioErr instanceof Error) {
                switch (audioErr.name) {
                    case 'NotFoundError':
                    case 'DevicesNotFoundError':
                        errorMessage = 'No microphone found. Please connect a microphone and grant permission to use it.';
                        break;
                    case 'NotAllowedError':
                    case 'PermissionDeniedError':
                        errorMessage = 'Microphone access was denied. Please grant permission in your browser settings to continue.';
                        break;
                    case 'NotReadableError':
                        errorMessage = 'Your microphone might be in use by another application. Please close it and try again.';
                        break;
                }
            }
            setError(errorMessage);
            setStatus('Idle');
            setSessionStage('idle');
            return; // Exit function, cannot proceed without audio
        }
    }

    updateLocalStream(stream);
    setIsVideoOn(videoEnabled);
    setStatus('Connecting to Gemini...');

    try {
        const sessionPromise = startLiveSession(stream, onMessage, (e) => {
            console.error('Live session error:', e);
            setError('Connection to Gemini failed.');
            stopSession();
        });
        sessionPromiseRef.current = sessionPromise;

        await sessionPromise;
        setIsSessionActive(true);
        setSessionStage('live');
        setStatus('Listening...');
    } catch (geminiErr) {
        console.error('Failed to connect to Gemini Live Session:', geminiErr);
        setError('Failed to establish a connection with the AI service.');
        // Clean up stream if Gemini connection fails
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            updateLocalStream(null);
        }
        setStatus('Idle');
        setSessionStage('idle');
    }
  }, [onMessage, stopSession]);

  const handleSummarySave = (summaryData: Omit<SessionSummary, 'id' | 'date' | 'transcript' | 'preMood' | 'postMood'>) => {
    const newSummary: SessionSummary = {
      ...summaryData,
      id: currentSessionData.current.id,
      date: new Date().toISOString(),
      transcript,
      preMood: currentSessionData.current.preMood,
      postMood: currentSessionData.current.postMood,
    };
    setSessionHistory(prev => [newSummary, ...prev]);
    setSessionStage('idle');
    setTranscript([]);
    setAnalysis(null);
    setStatus('Idle');
  };
  
  const handleAddResource = (resource: Omit<Resource, 'id'>) => {
    const newResource: Resource = { ...resource, id: crypto.randomUUID() };
    setResources(prev => [newResource, ...prev]);
  };

  const renderSessionView = () => {
    if (sessionStage === 'live') {
      return (
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
            <div className="flex-grow w-full h-full relative">
              <VideoCall 
                localStream={localStream} 
                isVideoOn={isVideoOn} 
                isSessionActive={isSessionActive} 
                isCoachSpeaking={isCoachSpeaking}
              />
              <ControlBar
                onStart={() => {}} // Start is handled by MoodTracker now
                onStop={stopSession}
                onToggleMute={toggleMute}
                onToggleVideo={toggleVideo}
                isSessionActive={isSessionActive}
                isMuted={isMuted}
                isVideoOn={isVideoOn}
              />
            </div>
          </main>
          <aside className="w-full md:w-1/3 xl:w-1/4 bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 border-l border-gray-700 flex flex-col">
            <CoachingConsole 
              transcript={transcript} 
              analysis={analysis} 
              status={status} 
              error={error} 
              isAudioFeedbackOn={isAudioFeedbackOn}
              onToggleAudioFeedback={() => setIsAudioFeedbackOn(prev => !prev)}
            />
          </aside>
        </div>
      );
    }

    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-lg text-center">
                {sessionStage === 'idle' && (
                    <MoodTracker timing="pre-session" onSubmit={startSession} />
                )}
                {sessionStage === 'summary' && (
                    <SessionSummaryForm
                        onSubmit={handleSummarySave}
                        onPostMoodSelect={(mood) => {
                            currentSessionData.current.postMood = mood;
                        }}
                    />
                )}
            </div>
        </div>
    );
  };
  
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => { track.enabled = !track.enabled; });
      setIsMuted(prev => !prev);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
        const videoTracks = localStreamRef.current.getVideoTracks();
        if (videoTracks.length > 0) {
            videoTracks.forEach(track => { track.enabled = !track.enabled; });
            setIsVideoOn(prev => !prev);
        } else {
            console.log("No video track available to toggle.");
        }
    }
  }, []);
  
  useEffect(() => {
    return () => {
        if(isSessionActive) stopSession();
    }
  }, [isSessionActive, stopSession]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <header className="flex-shrink-0">
        <NavBar currentView={view} onViewChange={setView} />
      </header>
      <div className="flex-1 flex flex-col min-h-0">
        {view === 'session' && renderSessionView()}
        {view === 'history' && <SessionHistory sessions={sessionHistory} />}
        {view === 'resources' && <ResourceLibrary resources={resources} onAddResource={handleAddResource} />}
      </div>
    </div>
  );
};

export default App;