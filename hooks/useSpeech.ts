
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
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            // Cleanup recognition if it was ever initialized.
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
            // Cleanup speech synthesis if it's speaking.
            try {
                // Safer check before accessing the API to prevent security exceptions.
                // Avoid accessing .speaking property which can throw uncatchable errors.
                if ('speechSynthesis' in window && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }
            } catch (e) {
                console.warn("Error cancelling speech on cleanup:", e);
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount/unmount.

    const initRecognition = useCallback(() => {
        if (recognitionRef.current) return; // Abort if already initialized

        try {
            // Use the 'in' operator for a safer check that avoids access exceptions.
            const SpeechRecognitionImpl = 
                ('SpeechRecognition' in window) ? (window as any).SpeechRecognition :
                ('webkitSpeechRecognition' in window) ? (window as any).webkitSpeechRecognition : null;

            if (!SpeechRecognitionImpl) {
                console.warn("Speech Recognition API is not supported in this browser.");
                return;
            }

            const recognition = new SpeechRecognitionImpl();
            recognitionRef.current = recognition;

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                const currentTranscript = event.results[0][0].transcript;
                if (isMountedRef.current) {
                    setTranscript(currentTranscript);
                }
                try {
                    // Stop listening after a result is received. This will trigger onend.
                    recognitionRef.current?.stop();
                } catch (err) {
                    console.error("Error stopping recognition in onresult:", err);
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
            recognitionRef.current = null; // Ensure ref is null if setup fails
        }
    }, []);

    const startListening = useCallback(() => {
        // Lazily initialize the recognition object on first use.
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
                // The onend handler will set isListening to false.
            } catch (error) {
                console.error("Could not stop recognition:", error);
                if (isMountedRef.current) setIsListening(false);
            }
        }
    }, [isListening]);

    const speak = useCallback((text: string) => {
        try {
            // Safer check for API availability before use.
            if (!('speechSynthesis' in window) || !window.speechSynthesis) {
                console.warn("Speech Synthesis API is not available.");
                return;
            }
            const speechSynthesisApi = window.speechSynthesis;

            // Cancel any previous speech to prevent overlap.
            // Call cancel() directly to avoid accessing .speaking property.
            speechSynthesisApi.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            utterance.onstart = () => {
                if (isMountedRef.current) setIsSpeaking(true);
            };
            utterance.onend = () => {
                if (isMountedRef.current) setIsSpeaking(false);
            };
            utterance.onerror = (e) => {
                console.error("Speech synthesis error", e);
                if (isMountedRef.current) setIsSpeaking(false);
            };
            
            speechSynthesisApi.speak(utterance);
        } catch (e) {
            console.error("Speech Synthesis operation failed:", e);
            if (isMountedRef.current) setIsSpeaking(false);
        }
    }, []);

    return { isListening, transcript, startListening, stopListening, isSpeaking, speak };
};