import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Trash2, Edit2, Plus, PlayCircle, StopCircle } from 'lucide-react';
import { supabase } from '$lib/supabase';
import { useStore } from '$lib/store';
import {
  WORKFLOW_TEMPLATES,
  TRIGGER_TYPES,
  ACTION_TYPES,
  createN8nWorkflow,
  createZapierWorkflow,
} from '$lib/automations-builder';

export function Automations() {
  const navigate = useNavigate();
  const { user, apiKeys } = useStore();
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [automationName, setAutomationName] = useState('');
  const [provider, setProvider] = useState<'n8n' | 'zapier'>('n8n');
  const [creating, setCreating] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    loadAutomations();
  }, [user]);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('automations')
        .select('*')
        .eq('user_id', user.id);
      if (data) setAutomations(data);
    } catch (err) {
      console.error('Failed to load automations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async () => {
    if (!selectedTemplate || !automationName) {
      alert('Please select a template and enter a name');
      return;
    }

    setCreating(true);
    try {
      const template = WORKFLOW_TEMPLATES[selectedTemplate];
      const workflowConfig = { ...template, name: automationName };

      let workflowId: string;

      if (provider === 'n8n') {
        const apiKey = apiKeys?.automation?.n8n;
        if (!apiKey) {
          alert('Please configure N8N API key in Settings');
          return;
        }
        workflowId = await createN8nWorkflow(workflowConfig, apiKey);
      } else {
        const apiKey = apiKeys?.automation?.zapier;
        if (!apiKey) {
          alert('Please configure Zapier API key in Settings');
          return;
        }
        workflowId = await createZapierWorkflow(workflowConfig, apiKey);
      }

      // Save to database
      await supabase.from('automations').insert({
        user_id: user.id,
        name: automationName,
        provider,
        workflow_config: workflowConfig,
        is_active: false,
      });

      setShowBuilder(false);
      setSelectedTemplate('');
      setAutomationName('');
      setProvider('n8n');
      loadAutomations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create automation');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleAutomation = async (automationId: string, isActive: boolean) => {
    try {
      await supabase
        .from('automations')
        .update({ is_active: !isActive })
        .eq('id', automationId);
      loadAutomations();
    } catch {
      alert('Failed to toggle automation');
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    if (!confirm('Delete this automation?')) return;
    try {
      await supabase.from('automations').delete().eq('id', automationId);
      loadAutomations();
    } catch {
      alert('Failed to delete automation');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Automations</h1>
          <p className="text-gray-400">Build powerful workflows with N8N or Zapier</p>
        </div>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus size={20} />
          New Automation
        </button>
      </div>

      {showBuilder ? (
        <div className="space-y-6">
          {/* Builder */}
          <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold">Create Automation</h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Automation Name</label>
              <input
                type="text"
                value={automationName}
                onChange={e => setAutomationName(e.target.value)}
                placeholder="e.g., Social Media Scheduler"
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium mb-2">Provider</label>
              <div className="flex gap-4">
                {[
                  { id: 'n8n', name: 'N8N' },
                  { id: 'zapier', name: 'Zapier' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id as 'n8n' | 'zapier')}
                    className={`px-4 py-2 rounded-lg border transition ${
                      provider === p.id
                        ? 'border-primary bg-primary/20'
                        : 'border-gray-700 hover:border-primary'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div>
              <label className="block text-sm font-medium mb-3">Select Template</label>
              <div className="grid md:grid-cols-2 gap-3">
                {Object.entries(WORKFLOW_TEMPLATES).map(([id, template]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedTemplate(id)}
                    className={`p-4 rounded-lg border text-left transition ${
                      selectedTemplate === id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-primary'
                    }`}
                  >
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-xs text-gray-400">{template.steps.length} steps</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="bg-background rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm">Preview</h3>
                <div className="space-y-2">
                  {WORKFLOW_TEMPLATES[selectedTemplate].steps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      <span className="text-gray-300">{step.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleCreateAutomation}
                disabled={creating || !selectedTemplate || !automationName}
                className="flex-1 px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
              >
                {creating ? (
                  <>
                    <Loader className="animate-spin inline mr-2" size={18} />
                    Creating...
                  </>
                ) : (
                  'Create Automation'
                )}
              </button>
              <button
                onClick={() => {
                  setShowBuilder(false);
                  setSelectedTemplate('');
                  setAutomationName('');
                }}
                className="flex-1 px-6 py-2 border border-gray-700 rounded-lg font-medium hover:border-primary transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-gray-400">
          <Loader className="animate-spin inline mr-2" size={24} />
          Loading automations...
        </div>
      ) : automations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No automations yet. Create your first workflow to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {automations.map(automation => (
            <div
              key={automation.id}
              className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{automation.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                      {automation.provider}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        automation.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}
                    >
                      {automation.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Step Count */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {automation.workflow_config?.steps?.length || 0}
                  </p>
                  <p className="text-xs text-gray-400">steps</p>
                </div>
              </div>

              {/* Steps Preview */}
              {automation.workflow_config?.steps && (
                <div className="space-y-2 text-xs">
                  {automation.workflow_config.steps.slice(0, 3).map((step: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-gray-400">
                      <span className="w-4 h-4 bg-gray-700 rounded-full" />
                      {step.name}
                    </div>
                  ))}
                  {automation.workflow_config.steps.length > 3 && (
                    <p className="text-gray-500">
                      +{automation.workflow_config.steps.length - 3} more steps
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleToggleAutomation(automation.id, automation.is_active)}
                  className={`flex-1 px-3 py-2 rounded text-sm transition flex items-center justify-center gap-1 ${
                    automation.is_active
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                  }`}
                >
                  {automation.is_active ? (
                    <>
                      <StopCircle size={16} />
                      Disable
                    </>
                  ) : (
                    <>
                      <PlayCircle size={16} />
                      Enable
                    </>
                  )}
                </button>
                <button className="px-3 py-2 border border-gray-700 hover:border-primary rounded text-sm transition">
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteAutomation(automation.id)}
                  className="px-3 py-2 border border-red-500/30 hover:border-red-500 text-red-400 rounded text-sm transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 space-y-2">
        <p className="text-sm text-blue-300">
          <strong>💡 Info:</strong> Automations require N8N or Zapier API keys. Add them in Settings.
          N8N is better for complex workflows, Zapier is better for simple integrations.
        </p>
      </div>
    </div>
  );
}
