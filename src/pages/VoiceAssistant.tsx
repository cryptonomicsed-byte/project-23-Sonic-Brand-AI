import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, Loader } from 'lucide-react';
import {
  transcribeAudio,
  processVoiceCommand,
  speakResponse,
  getAvailableVoices,
} from '$lib/voice-commands';
import { useStore } from '$lib/store';

export function VoiceAssistant() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(0));
  const [voiceOptions] = useState(getAvailableVoices());
  const [selectedVoice, setSelectedVoice] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleStartRecording = async () => {
    setRecording(true);
    setTranscript('');
    setResponse('');

    try {
      // Simulate waveform animation
      const waveformInterval = setInterval(() => {
        setWaveform(prev =>
          prev.map(() => Math.random() * 100)
        );
      }, 100);

      const transcript = await transcribeAudio();
      clearInterval(waveformInterval);
      setWaveform(Array(20).fill(0));

      if (transcript) {
        setTranscript(transcript);
        await handleProcessCommand(transcript);
      }
    } catch (err) {
      console.error('Recording error:', err);
      setResponse(
        err instanceof Error
          ? err.message
          : 'Failed to record audio'
      );
    } finally {
      setRecording(false);
    }
  };

  const handleProcessCommand = async (text: string) => {
    setLoading(true);
    try {
      const result = await processVoiceCommand(text, 'gpt-4-turbo');
      setResponse(result.text);

      // Speak response
      setSpeaking(true);
      await speakResponse(result.text, selectedVoice);
      setSpeaking(false);

      // Navigate if action requires it
      if (result.redirect) {
        setTimeout(() => {
          navigate(result.redirect);
        }, 2000);
      }
    } catch (err) {
      setResponse(
        err instanceof Error ? err.message : 'Failed to process command'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Sonic Voice Assistant</h1>
        <p className="text-gray-400">
          Control everything with natural language voice commands
        </p>
      </div>

      {/* Voice Settings */}
      <div className="bg-surface border border-gray-700 rounded-lg p-4 space-y-3">
        <label className="block text-sm font-medium">Voice</label>
        <select
          value={selectedVoice}
          onChange={e => setSelectedVoice(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
        >
          <option value="">Default Voice</option>
          {voiceOptions.map((voice, idx) => (
            <option key={idx} value={voice.name}>
              {voice.name}
            </option>
          ))}
        </select>
      </div>

      {/* Microphone Button & Waveform */}
      <div className="flex flex-col items-center space-y-8">
        {/* Waveform Visualization */}
        {recording && (
          <div className="flex items-end justify-center gap-1 h-16">
            {waveform.map((height, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-primary to-secondary rounded-sm transition-all"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        )}

        {/* Main Mic Button */}
        <button
          onClick={handleStartRecording}
          disabled={recording || loading || speaking}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition ${
            recording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gradient-to-br from-primary to-secondary text-white hover:opacity-90'
          } disabled:opacity-50`}
        >
          {recording ? (
            <MicOff size={48} />
          ) : loading ? (
            <Loader className="animate-spin" size={48} />
          ) : (
            <Mic size={48} />
          )}
        </button>

        {/* Status */}
        <div className="text-center">
          {recording && (
            <p className="text-sm text-yellow-400">Listening... Speak now</p>
          )}
          {loading && (
            <p className="text-sm text-blue-400">Processing command...</p>
          )}
          {speaking && (
            <p className="text-sm text-green-400 flex items-center justify-center gap-1">
              <Volume2 size={16} />
              Speaking...
            </p>
          )}
          {!recording && !loading && !speaking && transcript && (
            <p className="text-sm text-gray-400">Ready for next command</p>
          )}
        </div>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-2">
          <h2 className="text-sm font-medium text-gray-400">Your Command:</h2>
          <p className="text-lg">{transcript}</p>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="bg-primary/10 border border-primary rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-primary">Assistant Response:</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{response}</p>
        </div>
      )}

      {/* Examples */}
      <div className="space-y-4">
        <h2 className="font-semibold">Try saying:</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            'Extract brand DNA from apple.com',
            'Generate a marketing campaign',
            'Build a website for my brand',
            'Find me B2B SaaS leads',
            'Compare two brands',
            'Help me with options',
          ].map((example, i) => (
            <button
              key={i}
              onClick={() => handleProcessCommand(example)}
              disabled={recording || loading}
              className="px-4 py-2 border border-gray-700 hover:border-primary rounded-lg text-sm text-left transition disabled:opacity-50"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 space-y-2">
        <p className="text-sm text-blue-300">
          <strong>💡 Tips:</strong> For best results, speak clearly and naturally. The assistant
          understands commands like "extract", "generate", "deploy", "find leads", "schedule", and
          "compare brands".
        </p>
      </div>
    </div>
  );
}
