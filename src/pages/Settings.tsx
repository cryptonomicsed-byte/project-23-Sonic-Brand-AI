import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Save, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { useStore } from '$lib/store';
import { getProvidersByCategory } from '$lib/provider-config';
import { healthCheckApiKey } from '$lib/api-health-check';
import { setWorkflowProvider, WORKFLOW_PROVIDERS, getEnabledWorkflows } from '$lib/workflow-service';

export function Settings() {
  const navigate = useNavigate();
  const { user, loadApiKeys, setApiKeys, settings: storeSettings, setSettings, loadSettings } = useStore();
  const [settings, setLocalSettings] = useState(storeSettings);
  const [apiKeys, setLocalApiKeys] = useState<any>({
    llm: {},
    image: {},
    voice: {},
    video: {},
    automation: {},
  });
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [healthChecks, setHealthChecks] = useState<Record<string, { valid: boolean; checking: boolean; error?: string }>>({});
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [newWorkflow, setNewWorkflow] = useState({ provider: '', webhookUrl: '' });
  const [activeTab, setActiveTab] = useState<'llm' | 'image' | 'video' | 'voice'>('llm');

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    const keys = loadApiKeys();
    if (keys) {
      setLocalApiKeys(keys);
    }
    // Load settings from storage
    const storedSettings = loadSettings?.();
    if (storedSettings) {
      setLocalSettings(storedSettings);
      console.log('[Settings] Loaded settings:', storedSettings);
    } else if (!settings) {
      // Initialize default settings if none exist
      const defaults = {
        userId: user?.id || 'guest',
        tier: 'free' as const,
        extractionsUsed: 0,
        extractionsLimit: 3,
        llmProvider: 'openai' as const,
        imageProvider: 'dalle3' as const,
        videoProvider: 'sora2' as const,
        voiceProvider: 'elevenlabs' as const,
        updatedAt: new Date().toISOString(),
      };
      setLocalSettings(defaults);
      setSettings(defaults);
    }
    // Load enabled workflows
    setWorkflows(getEnabledWorkflows());
  }, []);

  const handleKeyChange = (category: string, provider: string, value: string) => {
    setLocalApiKeys({
      ...apiKeys,
      [category]: {
        ...apiKeys[category],
        [provider]: value,
      },
    });
  };

  const handleTestApiKey = async (category: 'llm' | 'image' | 'video' | 'voice', provider: string, apiKey: string) => {
    if (!apiKey) {
      return;
    }

    const key = `${category}-${provider}`;
    setHealthChecks({
      ...healthChecks,
      [key]: { valid: false, checking: true },
    });

    const result = await healthCheckApiKey(provider, apiKey, category);
    setHealthChecks({
      ...healthChecks,
      [key]: { valid: result.valid, checking: false, error: result.error },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      setApiKeys(apiKeys);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectProvider = (category: 'llm' | 'image' | 'video' | 'voice', providerId: string) => {
    if (settings) {
      // Get the provider config to find its first model
      const provider = getProvidersByCategory(category).find(p => p.id === providerId);
      const defaultModel = provider?.models[0] || 'gpt-4-turbo';

      const updated = {
        ...settings,
        [`${category}Provider`]: providerId,
        preferences: {
          ...settings.preferences,
          [`${category}Model`]: defaultModel,
        },
      };
      console.log(`[Settings] Setting ${category}Provider to:`, providerId, 'with model:', defaultModel);
      setLocalSettings(updated);
      setSettings(updated);
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setVisibleKeys({
      ...visibleKeys,
      [key]: !visibleKeys[key],
    });
  };

  const handleAddWorkflow = () => {
    if (newWorkflow.provider && newWorkflow.webhookUrl) {
      setWorkflowProvider(newWorkflow.provider, newWorkflow.webhookUrl);
      setWorkflows(getEnabledWorkflows());
      setNewWorkflow({ provider: '', webhookUrl: '' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Manage your API keys and preferences</p>
      </div>

      {saved && (
        <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-400 flex items-center gap-2">
          <Check size={20} />
          API keys saved successfully
        </div>
      )}

      {/* Provider Selection Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {(['llm', 'image', 'video', 'voice'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium transition ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Providers Grid */}
      <section className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
        <div className="grid gap-4">
          {getProvidersByCategory(activeTab).map(provider => {
            const key = `${activeTab}-${provider.id}`;
            const value = apiKeys[activeTab]?.[provider.id] || '';
            const isVisible = visibleKeys[key];
            const isSelected = settings?.[`${activeTab}Provider` as keyof typeof settings] === provider.id;

            return (
              <div
                key={provider.id}
                className={`border rounded-lg p-4 transition ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-700 bg-background hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{provider.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        provider.tier === 'free' ? 'bg-green-500/20 text-green-400' :
                        provider.tier === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {provider.tier.toUpperCase()}
                      </span>
                      {provider.status !== 'active' && (
                        <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                          {provider.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{provider.description}</p>
                    <p className="text-xs text-gray-500">Models: {provider.models.slice(0, 2).join(', ')}</p>
                    {isSelected && (
                      <p className="text-xs text-primary mt-1">
                        Using: <code className="bg-black/30 px-1 rounded">{settings?.preferences?.[`${activeTab}Model`] || provider.models[0]}</code>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleSelectProvider(activeTab, provider.id)}
                    className={`px-3 py-1 text-sm rounded font-medium transition ${
                      isSelected
                        ? 'bg-primary text-black'
                        : 'border border-gray-700 text-gray-300 hover:border-primary'
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center gap-1">
                        <Check size={14} /> Default
                      </span>
                    ) : (
                      'Set Default'
                    )}
                  </button>
                </div>

                {/* API Key Input */}
                <div className="space-y-2 pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">API Key</label>
                    {healthChecks[key]?.valid && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 flex items-center gap-1">
                        <Check size={12} /> Valid
                      </span>
                    )}
                    {healthChecks[key]?.error && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 flex items-center gap-1">
                        <AlertCircle size={12} /> Invalid
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type={isVisible ? 'text' : 'password'}
                      value={value}
                      onChange={e => handleKeyChange(activeTab, provider.id, e.target.value)}
                      placeholder={`Enter ${provider.name} API key...`}
                      className="flex-1 px-3 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-sm"
                    />
                    <button
                      onClick={() => toggleKeyVisibility(key)}
                      className="px-3 py-2 border border-gray-700 hover:border-gray-600 rounded-lg transition"
                    >
                      {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleTestApiKey(activeTab, provider.id, value)}
                      disabled={!value || healthChecks[key]?.checking}
                      className="px-3 py-2 border border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 rounded-lg transition disabled:opacity-50 text-sm font-medium"
                    >
                      {healthChecks[key]?.checking ? 'Testing...' : 'Test'}
                    </button>
                  </div>
                  {healthChecks[key]?.error && (
                    <p className="text-xs text-red-400">{healthChecks[key].error}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Automation Providers */}
      <section className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold">Automation</h2>
        <p className="text-sm text-gray-400">
          Add API keys for workflow automation (n8n, Zapier, etc.)
        </p>

        {['n8n', 'zapier'].map(provider => {
          const key = `automation-${provider}`;
          const value = apiKeys.automation?.[provider] || '';
          const isVisible = visibleKeys[key];

          return (
            <div key={provider} className="space-y-2">
              <label className="block text-sm font-medium capitalize">{provider} API Key</label>
              <div className="flex gap-2">
                <input
                  type={isVisible ? 'text' : 'password'}
                  value={value}
                  onChange={e => handleKeyChange('automation', provider, e.target.value)}
                  placeholder={`Enter your ${provider} API key`}
                  className="flex-1 px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                />
                <button
                  onClick={() => toggleKeyVisibility(key)}
                  className="px-3 py-2 border border-gray-700 hover:border-primary rounded-lg transition"
                >
                  {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Workflows */}
      <section className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold">Automation Workflows</h2>
        <p className="text-sm text-gray-400">
          Connect your automation platforms (n8n, Zapier, Make.com, etc.)
        </p>

        {workflows.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Connected Workflows:</h3>
            {workflows.map(w => (
              <div key={w.id} className="flex items-center justify-between bg-background p-3 rounded border border-gray-700">
                <span className="font-medium capitalize">{w.name}</span>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Connected</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-medium">Add Workflow Provider:</h3>
          <select
            value={newWorkflow.provider}
            onChange={e => setNewWorkflow({ ...newWorkflow, provider: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
          >
            <option value="">Select a provider...</option>
            {WORKFLOW_PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input
            type="password"
            value={newWorkflow.webhookUrl}
            onChange={e => setNewWorkflow({ ...newWorkflow, webhookUrl: e.target.value })}
            placeholder="Webhook URL"
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
          />

          <button
            onClick={handleAddWorkflow}
            disabled={!newWorkflow.provider || !newWorkflow.webhookUrl}
            className="w-full px-4 py-2 bg-primary hover:opacity-90 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={18} />
            Connect Workflow
          </button>
        </div>
      </section>

      {/* Security Note */}
      <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>🔒 Security:</strong> All API keys are stored securely in your browser's local storage and are never sent to our servers.
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
      >
        <Save size={20} />
        {saving ? 'Saving...' : 'Save API Keys'}
      </button>
    </div>
  );
}
