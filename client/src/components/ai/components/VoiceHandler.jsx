// Voice Handler - Advanced voice recognition and text-to-speech functionality
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Square, 
  Play,
  Pause,
  RotateCcw,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const VoiceHandler = ({ 
  onVoiceInput,
  onTextToSpeech,
  autoListen = false,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
    volume: 0.8,
    rate: 1.0,
    pitch: 1.0
  });

  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const speechSynthesisSupported = 'speechSynthesis' in window;
    setIsSupported(speechRecognitionSupported && speechSynthesisSupported);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = voiceSettings.continuous;
    recognition.interimResults = voiceSettings.interimResults;
    recognition.lang = voiceSettings.language;
    recognition.maxAlternatives = voiceSettings.maxAlternatives;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          setConfidence(result[0].confidence);
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);

      if (finalTranscript) {
        onVoiceInput?.(finalTranscript, event.results[event.results.length - 1][0].confidence);
        
        // Auto-stop after final result unless continuous mode
        if (!voiceSettings.continuous) {
          setTimeout(() => stopListening(), 500);
        }
      }
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
      
      // Auto-retry on network errors
      if (event.error === 'network' && autoListen) {
        setTimeout(() => startListening(), 2000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Auto-restart if continuous listening is enabled
      if (autoListen && !error) {
        setTimeout(() => startListening(), 100);
      }
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isSupported, voiceSettings, autoListen, onVoiceInput, error]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      setError(null);
    } catch (err) {
      if (err.name !== 'InvalidStateError') {
        setError(err.message);
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const speakText = useCallback((text, options = {}) => {
    if (!isSupported || !text) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = options.volume || voiceSettings.volume;
    utterance.rate = options.rate || voiceSettings.rate;
    utterance.pitch = options.pitch || voiceSettings.pitch;
    utterance.lang = options.language || voiceSettings.language;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setError(`Speech synthesis error: ${event.error}`);
    };

    speechSynthesis.speak(utterance);
    speechSynthesisRef.current = utterance;
    
    onTextToSpeech?.(text, options);
  }, [isSupported, voiceSettings, onTextToSpeech]);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleSpeaking = useCallback((text) => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (text) {
      speakText(text);
    }
  }, [isSpeaking, stopSpeaking, speakText]);

  const clearTranscript = () => {
    setTranscript('');
    setConfidence(0);
    setError(null);
  };

  const getLanguageOptions = () => [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ru-RU', name: 'Russian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'hi-IN', name: 'Hindi' }
  ];

  if (!isSupported) {
    return (
      <div className={`p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Voice features not supported</span>
        </div>
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
          Your browser doesn't support speech recognition or text-to-speech features.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Controls */}
      <div className="flex items-center gap-3">
        {/* Listening Control */}
        <button
          onClick={toggleListening}
          disabled={!isSupported}
          className={`relative p-3 rounded-full transition-all ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg animate-pulse'
              : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
          }`}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          
          {isListening && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
          )}
        </button>

        {/* Speaking Control */}
        <button
          onClick={() => toggleSpeaking(transcript)}
          disabled={!transcript || !isSupported}
          className={`p-3 rounded-full transition-all ${
            isSpeaking
              ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
              : 'bg-gray-500 text-white hover:bg-gray-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
          title={isSpeaking ? 'Stop speaking' : 'Speak transcript'}
        >
          {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>

        {/* Clear Transcript */}
        <button
          onClick={clearTranscript}
          disabled={!transcript}
          className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear transcript"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      {/* Status Display */}
      <div className="space-y-2">
        {/* Current Status */}
        <div className="flex items-center gap-2 text-sm">
          {isListening ? (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Listening...</span>
            </div>
          ) : isSpeaking ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Volume2 className="h-4 w-4" />
              <span>Speaking...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <CheckCircle className="h-4 w-4" />
              <span>Ready</span>
            </div>
          )}
          
          {confidence > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Confidence: {Math.round(confidence * 100)}%
            </span>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Transcript
              </span>
              {confidence > 0 && (
                <div className={`px-2 py-1 rounded-full text-xs ${
                  confidence > 0.8 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : confidence > 0.6
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {Math.round(confidence * 100)}% confidence
                </div>
              )}
            </div>
            <p className="text-gray-900 dark:text-gray-100">{transcript}</p>
          </div>
        )}
      </div>

      {/* Voice Settings */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
          <Settings className="h-4 w-4" />
          Voice Settings
          <div className="ml-auto transform group-open:rotate-180 transition-transform">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        
        <div className="mt-3 space-y-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            <select
              value={voiceSettings.language}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {getLanguageOptions().map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          {/* Voice Settings Sliders */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Volume: {Math.round(voiceSettings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceSettings.volume}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Speed: {voiceSettings.rate}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.rate}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pitch: {voiceSettings.pitch}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.pitch}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Checkbox Settings */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={voiceSettings.continuous}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, continuous: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-gray-700 dark:text-gray-300">Continuous listening</span>
            </label>
            
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={voiceSettings.interimResults}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, interimResults: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-gray-700 dark:text-gray-300">Show interim results</span>
            </label>
          </div>
        </div>
      </details>
    </div>
  );
};

export default VoiceHandler;
