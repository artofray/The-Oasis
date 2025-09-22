import { useState, useEffect, useRef, useCallback } from 'react';

// Manually define the SpeechRecognition interface to fix TypeScript error
// in environments where DOM Speech Recognition API types are not available.
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

export const useSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;

        const handleVoicesChanged = () => {
             try {
                if ('speechSynthesis' in window && window.speechSynthesis) {
                    setVoices(window.speechSynthesis.getVoices());
                }
            } catch (e) {
                console.warn("Error getting speech synthesis voices:", e);
            }
        };
        
        try {
            if ('speechSynthesis' in window && window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
                handleVoicesChanged(); // Initial call
            }
        } catch(e) {
            console.warn("Could not set up onvoiceschanged handler:", e);
        }

        return () => {
            isMountedRef.current = false;
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.onresult = null;
                    recognitionRef.current.onerror = null;
                    recognitionRef.current.onend = null;
                    recognitionRef.current.stop();
                } catch (e) {
                    console.warn("Error stopping recognition on cleanup:", e);
                }
                recognitionRef.current = null;
            }
            try {
                if ('speechSynthesis' in window && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.onvoiceschanged = null;
                }
            } catch (e) {
                console.warn("Error cleaning up speech synthesis on cleanup:", e);
            }
        };
    }, []); 

    const initRecognition = useCallback(() => {
        if (recognitionRef.current) return;

        try {
            const SpeechRecognitionImpl = 
                ('SpeechRecognition' in window) ? (window as any).SpeechRecognition :
                ('webkitSpeechRecognition' in window) ? (window as any).webkitSpeechRecognition : null;

            if (!SpeechRecognitionImpl) {
                console.warn("Speech Recognition API is not supported in this browser.");
                return;
            }

            const recognition = new SpeechRecognitionImpl();
            recognitionRef.current = recognition;

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = 0; i < event.results.length; i++) {
                    const transcriptPart = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcriptPart;
                    } else {
                        interimTranscript += transcriptPart;
                    }
                }
                
                if (isMountedRef.current) {
                    setTranscript(finalTranscript + interimTranscript);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (isMountedRef.current) setIsListening(false);
            };
            
            recognition.onend = () => {
                if (isMountedRef.current) setIsListening(false);
            };
        } catch (e) {
            console.error("Speech Recognition setup failed. Feature will be disabled.", e);
            recognitionRef.current = null;
        }
    }, []);

    const startListening = useCallback(() => {
        initRecognition();

        if (recognitionRef.current && !isListening) {
            try {
                setTranscript('');
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error("Could not start recognition:", error);
                if (isMountedRef.current) setIsListening(false);
            }
        }
    }, [isListening, initRecognition]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.error("Could not stop recognition:", error);
                if (isMountedRef.current) setIsListening(false);
            }
        }
    }, [isListening]);

    const speak = useCallback((text: string, options?: { voice?: SpeechSynthesisVoice; pitch?: number; rate?: number; onStart?: () => void; onEnd?: () => void; }) => {
        try {
            if (!('speechSynthesis' in window) || !window.speechSynthesis) {
                console.warn("Speech Synthesis API is not available.");
                return;
            }
            const speechSynthesisApi = window.speechSynthesis;
            speechSynthesisApi.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            if (options?.voice) {
                utterance.voice = options.voice;
            }
            if (options?.pitch) {
                utterance.pitch = options.pitch;
            }
            if (options?.rate) {
                utterance.rate = options.rate;
            }
            
            utterance.onstart = () => {
                if (isMountedRef.current) setIsSpeaking(true);
                if (options?.onStart) options.onStart();
            };
            utterance.onend = () => {
                if (isMountedRef.current) setIsSpeaking(false);
                if (options?.onEnd) options.onEnd();
            };
            utterance.onerror = (e: any) => {
                if (e.error !== 'canceled') {
                    console.error("Speech synthesis error:", e.error);
                }
                if (isMountedRef.current) setIsSpeaking(false);
                if (options?.onEnd) options.onEnd();
            };
            
            speechSynthesisApi.speak(utterance);
        } catch (e) {
            console.error("Speech Synthesis operation failed:", e);
            if (isMountedRef.current) setIsSpeaking(false);
        }
    }, []);

    // FIX: Add a `stop` function to cancel speech synthesis.
    const stop = useCallback(() => {
        try {
            if ('speechSynthesis' in window && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                if (isMountedRef.current) {
                    setIsSpeaking(false);
                }
            }
        } catch (e) {
            console.error("Speech Synthesis cancellation failed:", e);
        }
    }, []);

    return { isListening, transcript, startListening, stopListening, isSpeaking, speak, voices, stop };
};