/**
 * Provider Settings Component
 * Manage API keys and provider selection for LLM, Image, Video, Voice
 */

import React, { useState } from 'react';
import { Save, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { useStore } from '$lib/store';
import { getProvidersByCategory } from '$lib/provider-config';
import type { LLMProvider, ImageProvider, VideoProvider, VoiceProvider } from '$types';

type Category = 'llm' | 'image' | 'video' | 'voice';

const CATEGORY_LABELS: Record<Category, string> = {
  llm: 'Language Models',
  image: 'Image Generation',
  video: 'Video Generation',
  voice: 'Voice/TTS',
};

export function SettingsProviders() {
  const { settings, setSettings, apiKeys, setApiKeys } = useStore();
  const [activeCategory, setActiveCategory] = useState<Category>('llm');
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState(apiKeys || { llm: {}, image: {}, video: {}, voice: {}, automation: {} });

  const providers = getProvidersByCategory(activeCategory);

  const toggleKeyReveal = (key: string) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(key)) {
      newRevealed.delete(key);
    } else {
      newRevealed.add(key);
    }
    setRevealedKeys(newRevealed);
  };

  const handleKeyChange = (provider: string, value: string) => {
    setFormData({
      ...formData,
      [activeCategory]: {
        ...formData[activeCategory as keyof typeof formData],
        [provider]: value,
      },
    });
  };

  const handleProviderSelect = (provider: string) => {
    if (settings) {
      const key = `${activeCategory}Provider` as keyof typeof settings;
      setSettings({
        ...settings,
        [key]: provider,
      });
    }
  };

  const handleSave = () => {
    setApiKeys(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getSelectedProvider = (): string => {
    if (!settings) return '';
    const key = `${activeCategory}Provider` as keyof typeof settings;
    return settings[key] as string || '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">API Provider Settings</h1>
        <p className="text-gray-400">
          Configure your API keys and select default providers for each service category.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-3 font-medium transition ${
              activeCategory === cat
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Provider Grid */}
      <div className="grid gap-4">
        {providers.map(provider => {
          const keyName = `${provider.id}`;
          const currentKey = formData[activeCategory as keyof typeof formData]?.[provider.id] || '';
          const isSelected = getSelectedProvider() === provider.id;
          const isRevealed = revealedKeys.has(keyName);

          return (
            <div
              key={provider.id}
              className={`border rounded-lg p-4 transition ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-700 bg-surface hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      provider.tier === 'free' ? 'bg-green-500/20 text-green-400' :
                      provider.tier === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                      provider.tier === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {provider.tier.toUpperCase()}
                    </span>
                    {provider.status !== 'active' && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                        {provider.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{provider.description}</p>
                  <p className="text-xs text-gray-500">Models: {provider.models.join(', ')}</p>
                </div>

                <button
                  onClick={() => handleProviderSelect(provider.id)}
                  className={`px-4 py-2 rounded font-medium transition ${
                    isSelected
                      ? 'bg-primary text-black'
                      : 'border border-gray-700 text-gray-300 hover:border-primary hover:text-primary'
                  }`}
                >
                  {isSelected ? (
                    <span className="flex items-center gap-1">
                      <Check size={16} /> Selected
                    </span>
                  ) : (
                    'Select'
                  )}
                </button>
              </div>

              {/* API Key Input */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">API Key</label>
                <div className="flex gap-2">
                  <input
                    type={isRevealed ? 'text' : 'password'}
                    value={currentKey}
                    onChange={e => handleKeyChange(provider.id, e.target.value)}
                    placeholder={`Enter ${provider.name} API key...`}
                    className="flex-1 px-3 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-sm"
                  />
                  <button
                    onClick={() => toggleKeyReveal(keyName)}
                    className="px-3 py-2 border border-gray-700 rounded-lg hover:border-gray-600 transition"
                  >
                    {isRevealed ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
                {provider.endpoint && (
                  <p className="text-xs text-gray-500">
                    Endpoint: <code className="bg-black/50 px-1 rounded">{provider.endpoint.split('?')[0]}</code>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex gap-3 justify-between items-center">
        <div className="text-sm text-gray-400">
          <AlertCircle className="inline mr-2" size={16} />
          Keys are encrypted in localStorage. Use environment variables for production.
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Save size={18} />
          Save Settings
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-400 flex items-center gap-2">
          <Check size={20} />
          Settings saved successfully
        </div>
      )}

      {/* Provider Recommendations */}
      <div className="mt-8 pt-8 border-t border-gray-700 space-y-4">
        <h2 className="text-xl font-bold">Recommendations</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-surface border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">💰 Best Value</h3>
            <ul className="space-y-1 text-gray-300">
              <li>• LLM: DeepSeek (cheapest) or Groq (fastest free)</li>
              <li>• Images: Stable Diffusion 3 or Segmind</li>
              <li>• Video: Open-source or Replicate</li>
              <li>• Voice: Google TTS or Amazon Polly</li>
            </ul>
          </div>

          <div className="bg-surface border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">⭐ Best Quality</h3>
            <ul className="space-y-1 text-gray-300">
              <li>• LLM: Claude 3.5 Sonnet or GPT-4o</li>
              <li>• Images: DALL-E 4 or Midjourney</li>
              <li>• Video: Sora 2 or Veo 3</li>
              <li>• Voice: ElevenLabs</li>
            </ul>
          </div>

          <div className="bg-surface border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🚀 Fastest</h3>
            <ul className="space-y-1 text-gray-300">
              <li>• LLM: Groq or SambaNova (ms-level latency)</li>
              <li>• Images: Flux Schnell</li>
              <li>• Video: LTX Video 2 or Mochi</li>
              <li>• Voice: Cartesia</li>
            </ul>
          </div>

          <div className="bg-surface border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔒 Privacy/Self-Hosted</h3>
            <ul className="space-y-1 text-gray-300">
              <li>• LLM: Ollama (local models)</li>
              <li>• Images: Stable Diffusion (local)</li>
              <li>• Video: Open-source models</li>
              <li>• Voice: Piper (local)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
