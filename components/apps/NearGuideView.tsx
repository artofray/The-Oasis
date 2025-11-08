import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from "@google/genai";

// Audio utility functions from guidelines
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const NearGuideView: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [history, setHistory] = useState<{ speaker: 'user' | 'ai'; text: string }[]>([]);
  const [displayUserTranscription, setDisplayUserTranscription] = useState('');
  const [displayAiTranscription, setDisplayAiTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const currentUserTranscriptionRef = useRef('');
  const currentAiTranscriptionRef = useRef('');

  // Stop conversation and clean up resources
  const stopConversation = useCallback(() => {
    sessionPromiseRef.current?.then((session) => {
        if (session) session.close();
    }).catch(e => console.error("Error closing session:", e));
    sessionPromiseRef.current = null;
    
    scriptProcessorRef.current?.disconnect();
    mediaStreamSourceRef.current?.disconnect();
    audioContextRef.current?.close().catch(e => console.error("Error closing input audio context:", e));

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    
    for (const source of audioSourcesRef.current.values()) {
        source.stop();
    }
    audioSourcesRef.current.clear();
    outputAudioContextRef.current?.close().catch(e => console.error("Error closing output audio context:", e));
    outputAudioContextRef.current = null;
    nextStartTimeRef.current = 0;

    setStatus('idle');
    currentUserTranscriptionRef.current = '';
    currentAiTranscriptionRef.current = '';
    setDisplayUserTranscription('');
    setDisplayAiTranscription('');
  }, []);

  const startConversation = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    setHistory([]);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    setStatus('active');
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                    scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    
                    mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(audioContextRef.current.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.outputTranscription) {
                        const text = message.serverContent.outputTranscription.text;
                        currentAiTranscriptionRef.current += text;
                        setDisplayAiTranscription(currentAiTranscriptionRef.current);
                    } else if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        currentUserTranscriptionRef.current += text;
                        setDisplayUserTranscription(currentUserTranscriptionRef.current);
                    }

                    if (message.serverContent?.turnComplete) {
                        const fullInput = currentUserTranscriptionRef.current.trim();
                        const fullOutput = currentAiTranscriptionRef.current.trim();
                        setHistory(prev => {
                            let newHistory = [...prev];
                            if (fullInput) newHistory.push({ speaker: 'user', text: fullInput });
                            if (fullOutput) newHistory.push({ speaker: 'ai', text: fullOutput });
                            return newHistory;
                        });

                        currentUserTranscriptionRef.current = '';
                        currentAiTranscriptionRef.current = '';
                        setDisplayUserTranscription('');
                        setDisplayAiTranscription('');
                    }
                    
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64Audio) {
                        if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                        }
                        const ctx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }

                    if (message.serverContent?.interrupted) {
                        for (const source of audioSourcesRef.current.values()) {
                            source.stop();
                            audioSourcesRef.current.delete(source);
                        }
                        nextStartTimeRef.current = 0;
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Session error:', e);
                    setError('A session error occurred. Please try again.');
                    setStatus('error');
                    stopConversation();
                },
                onclose: () => {
                    console.log('Session closed.');
                    stopConversation();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                outputAudioTranscription: {},
                inputAudioTranscription: {},
                systemInstruction: 'You are a helpful and friendly expert on the NEAR Protocol. Your goal is to answer developer questions concisely and accurately. Start by introducing yourself.',
            },
        });
    } catch (e) {
        console.error('Failed to start conversation:', e);
        setError(e instanceof Error ? e.message : 'Failed to get microphone permissions.');
        setStatus('error');
    }
  }, [stopConversation]);

  useEffect(() => {
      return () => stopConversation();
  }, [stopConversation]);

  const getStatusText = () => {
    if (status === 'error') return `Error: ${error}`;
    if (status === 'connecting') return 'Connecting...';
    if (status === 'active') {
        if (displayAiTranscription) return 'AI is speaking...';
        if (displayUserTranscription) return 'Listening...';
        return 'Connected. Say something!';
    }
    return 'Ready to chat about NEAR';
  };

  return (
    <div className="min-h-full bg-[#0d1117] text-white flex flex-col items-center justify-center p-4 animate-fadeIn">
      <main className="w-full max-w-3xl flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold mb-2 text-cyan-300">NEAR Protocol AI Guide</h1>
        <p className="text-gray-400 mb-8">Ask me anything about NEAR development via voice!</p>
        <div className="w-48 h-48 rounded-full flex items-center justify-center bg-gray-800/50 border-4 border-gray-700/50 mb-8 relative">
          <div className={`w-32 h-32 rounded-full bg-cyan-500 transition-all duration-300 ${status === 'active' ? 'animate-pulse-orb' : ''}`}></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <p className="text-lg text-gray-300 h-8 mb-8">{getStatusText()}</p>
        {status === 'idle' || status === 'error' ? (
          <button onClick={startConversation} className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-full shadow-lg shadow-cyan-500/20 transition-transform transform hover:scale-105">
            Start Conversation
          </button>
        ) : (
          <button onClick={stopConversation} className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg shadow-red-500/20 transition-transform transform hover:scale-105">
            Stop Conversation
          </button>
        )}
        <div className="w-full mt-8 bg-gray-800/50 rounded-lg p-4 h-64 overflow-y-auto text-left font-mono text-sm">
          {history.map((t, i) => (
            <div key={i} className={`mb-2 ${t.speaker === 'user' ? 'text-cyan-300' : 'text-gray-200'}`}>
              <span className="font-bold">{t.speaker === 'user' ? 'You: ' : 'AI: '}</span>
              <span>{t.text}</span>
            </div>
          ))}
          {displayUserTranscription && <div className="text-cyan-300/70"><span className="font-bold">You: </span><span>{displayUserTranscription}</span></div>}
          {displayAiTranscription && <div className="text-gray-200/70"><span className="font-bold">AI: </span><span>{displayAiTranscription}</span></div>}
        </div>
      </main>
    </div>
  );
};
