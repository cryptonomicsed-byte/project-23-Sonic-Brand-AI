import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Play, Trash2, Plus } from 'lucide-react';
import { useStore } from '$lib/store';
import {
  AGENT_TEMPLATES,
  AVAILABLE_TOOLS,
  TRIGGER_TYPES,
  createCustomAgent,
  runAgent,
  CustomAgent,
} from '$lib/agent-forge';

export function AgentForge() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [agents, setAgents] = useState<CustomAgent[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [llmModel, setLlmModel] = useState('gpt-4-turbo');
  const [creating, setCreating] = useState(false);

  // Agent testing state
  const [testAgent, setTestAgent] = useState<CustomAgent | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLoadTemplate = (templateKey: string) => {
    const template = (AGENT_TEMPLATES as any)[templateKey];
    if (template) {
      setSelectedTemplate(templateKey);
      setAgentName(template.name);
      setAgentDescription(template.description);
      setInstructions(template.instructions);
      setSelectedTools(template.tools);
      setSelectedTriggers(template.triggers);
    }
  };

  const handleCreateAgent = async () => {
    if (!agentName || !agentDescription || !instructions) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const newAgent = await createCustomAgent({
        name: agentName,
        description: agentDescription,
        instructions,
        model: llmModel,
        tools: selectedTools,
        triggers: selectedTriggers,
      });

      setAgents([...agents, newAgent]);
      setShowBuilder(false);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setCreating(false);
    }
  };

  const handleTestAgent = async (agent: CustomAgent) => {
    if (!testInput.trim()) {
      alert('Please enter a test input');
      return;
    }

    setTesting(true);
    try {
      const output = await runAgent(agent, testInput);
      setTestOutput(output);
    } catch (err) {
      setTestOutput({
        thinking: 'Error',
        action: 'Failed',
        result: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate('');
    setAgentName('');
    setAgentDescription('');
    setInstructions('');
    setSelectedTools([]);
    setSelectedTriggers([]);
    setLlmModel('gpt-4-turbo');
  };

  const handleDeleteAgent = (agentId: string) => {
    if (!confirm('Delete this agent?')) return;
    setAgents(agents.filter(a => a.id !== agentId));
    if (testAgent?.id === agentId) {
      setTestAgent(null);
      setTestOutput(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agent Forge</h1>
          <p className="text-gray-400">Create custom AI agents for specific tasks</p>
        </div>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Create Agent
        </button>
      </div>

      {showBuilder ? (
        <div className="space-y-6">
          {/* Template Selection */}
          <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold">Start from Template (Optional)</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(AGENT_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => handleLoadTemplate(key)}
                  className={`p-4 rounded-lg border text-left transition ${
                    selectedTemplate === key
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-700 hover:border-primary'
                  }`}
                >
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Agent Details */}
          <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold">Agent Details</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Agent Name*</label>
              <input
                type="text"
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                placeholder="e.g., Social Media Manager"
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description*</label>
              <input
                type="text"
                value={agentDescription}
                onChange={e => setAgentDescription(e.target.value)}
                placeholder="Brief description of what this agent does"
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Special Instructions*</label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Detailed instructions for how the agent should behave..."
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">LLM Model</label>
              <select
                value={llmModel}
                onChange={e => setLlmModel(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
              >
                <option value="gpt-4-turbo">OpenAI GPT-4 Turbo</option>
                <option value="gpt-4">OpenAI GPT-4</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="gemini-pro">Google Gemini Pro</option>
              </select>
            </div>
          </div>

          {/* Tools Selection */}
          <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold">Available Tools</h2>
            <div className="grid md:grid-cols-3 gap-2">
              {AVAILABLE_TOOLS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() =>
                    setSelectedTools(
                      selectedTools.includes(tool.id)
                        ? selectedTools.filter(t => t !== tool.id)
                        : [...selectedTools, tool.id]
                    )
                  }
                  className={`p-3 rounded-lg border text-sm transition ${
                    selectedTools.includes(tool.id)
                      ? 'border-primary bg-primary/20'
                      : 'border-gray-700 hover:border-primary'
                  }`}
                >
                  <span className="mr-2">{tool.icon}</span>
                  {tool.name}
                </button>
              ))}
            </div>
          </div>

          {/* Triggers Selection */}
          <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold">Triggers</h2>
            <div className="grid md:grid-cols-3 gap-2">
              {TRIGGER_TYPES.map(trigger => (
                <button
                  key={trigger.id}
                  onClick={() =>
                    setSelectedTriggers(
                      selectedTriggers.includes(trigger.id)
                        ? selectedTriggers.filter(t => t !== trigger.id)
                        : [...selectedTriggers, trigger.id]
                    )
                  }
                  className={`p-3 rounded-lg border text-sm transition ${
                    selectedTriggers.includes(trigger.id)
                      ? 'border-primary bg-primary/20'
                      : 'border-gray-700 hover:border-primary'
                  }`}
                >
                  <span className="mr-2">{trigger.icon}</span>
                  {trigger.name}
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <div className="flex gap-4">
            <button
              onClick={handleCreateAgent}
              disabled={creating || !agentName || !agentDescription}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {creating ? (
                <>
                  <Loader className="animate-spin inline mr-2" size={18} />
                  Creating...
                </>
              ) : (
                'Create Agent'
              )}
            </button>
            <button
              onClick={() => {
                setShowBuilder(false);
                resetForm();
              }}
              className="flex-1 px-6 py-3 border border-gray-700 rounded-lg font-medium hover:border-primary transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Agents List */}
          {agents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No agents created yet. Build your first custom agent.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className={`bg-surface border rounded-lg p-6 space-y-4 cursor-pointer transition ${
                    testAgent?.id === agent.id
                      ? 'border-primary'
                      : 'border-gray-700 hover:border-primary'
                  }`}
                  onClick={() => setTestAgent(agent)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{agent.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteAgent(agent.id);
                      }}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                      {agent.tools.length} tools
                    </span>
                    <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded">
                      {agent.triggers.length} triggers
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    Created: {new Date(agent.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Test Panel */}
          {testAgent && (
            <div className="bg-surface border border-primary rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Test: {testAgent.name}</h2>
                <button
                  onClick={() => {
                    setTestAgent(null);
                    setTestOutput(null);
                    setTestInput('');
                  }}
                  className="text-gray-400 hover:text-white transition"
                >
                  ×
                </button>
              </div>

              <p className="text-sm text-gray-400">{testAgent.description}</p>

              <div>
                <label className="block text-sm font-medium mb-2">Test Input</label>
                <textarea
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  placeholder="Enter a request to test the agent..."
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition h-20"
                />
              </div>

              <button
                onClick={() => handleTestAgent(testAgent)}
                disabled={testing || !testInput.trim()}
                className="px-6 py-2 bg-primary hover:opacity-90 disabled:opacity-50 rounded-lg font-medium transition flex items-center gap-2"
              >
                {testing ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Test Agent
                  </>
                )}
              </button>

              {testOutput && (
                <div className="space-y-3 bg-background rounded-lg p-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Thinking:</p>
                    <p className="text-sm mt-1">{testOutput.thinking}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Action:</p>
                    <p className="text-sm mt-1">{testOutput.action}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Result:</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{testOutput.result}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 space-y-2">
        <p className="text-sm text-blue-300">
          <strong>💡 Info:</strong> Create specialized AI agents for specific tasks. Each agent has
          unique instructions, tools, and triggers. Test them before deploying.
        </p>
      </div>
    </div>
  );
}
