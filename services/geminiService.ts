import { GoogleGenAI, Type, Modality } from '@google/genai';
import { createAudioBlob } from '../utils/audio';
import type { AnalysisData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        positivity: { type: Type.NUMBER, description: "A score from 0-100 representing the positivity of the coach's language." },
        empathy: { type: Type.NUMBER, description: "A score from 0-100 on how empathetic the coach sounds." },
        activeListeningCues: { type: Type.INTEGER, description: "The number of active listening cues used, like 'I see', 'uh-huh', 'tell me more'." },
        keyTopics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the main topics discussed in this turn." },
        suggestedQuestion: { type: Type.STRING, description: "A helpful, open-ended question the coach could ask next to further the conversation." },
    },
    required: ["positivity", "empathy", "activeListeningCues", "keyTopics", "suggestedQuestion"]
};

const analysisPrompt = (transcript: string) => `
You are a conversation analyst for a peer coaching session. Your task is to analyze the following transcript of a coach's turn and provide structured feedback.
Analyze the text for positivity, empathy, and active listening. Identify key topics. Finally, suggest a powerful, open-ended question the coach could ask next.
Return your analysis as a single JSON object that conforms to the provided schema. Do not output any other text, greetings, or explanations.

Transcript to analyze:
---
${transcript}
---
`;

export async function analyzeConversationTurn(transcript: string): Promise<AnalysisData> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ role: 'user', parts: [{ text: analysisPrompt(transcript) }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error analyzing conversation turn:", error);
        throw new Error("Failed to parse analysis from Gemini.");
    }
}

export async function generateSpeech(text: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from TTS API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech from Gemini.");
    }
}

export function startLiveSession(
    stream: MediaStream, 
    onMessage: (message: any) => void,
    onError: (e: ErrorEvent) => void
) {
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = inputAudioContext.createMediaStreamSource(stream);
    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmBlob = createAudioBlob(inputData);
        
        sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
        });
    };
    
    source.connect(scriptProcessor);
    scriptProcessor.connect(inputAudioContext.destination);

    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => console.log('Live session opened.'),
            onmessage: onMessage,
            onerror: onError,
            onclose: () => console.log('Live session closed.'),
        },
        config: {
            responseModalities: [Modality.AUDIO], // Required, even if we don't play back audio
            inputAudioTranscription: {},
        },
    });

    return sessionPromise;
}
