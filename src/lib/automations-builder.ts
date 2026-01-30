import { Automation } from '$types';

export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  config: Record<string, any>;
  name: string;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  enabled: boolean;
  steps: WorkflowStep[];
  createdAt: string;
}

// N8N Workflow Builder
export async function createN8nWorkflow(
  config: WorkflowConfig,
  n8nApiKey: string
): Promise<string> {
  try {
    const workflow = {
      name: config.name,
      active: config.enabled,
      nodes: config.steps.map((step, idx) => ({
        name: step.name,
        type: mapStepTypeToN8n(step.type),
        position: [idx * 250, 0],
        parameters: step.config,
      })),
      connections: generateConnections(config.steps),
    };

    const response = await fetch('https://n8n.cloud/api/v1/workflows', {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': n8nApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflow),
    });

    if (!response.ok) {
      throw new Error(`N8N API error: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    throw new Error(
      `Failed to create N8N workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Zapier Integration
export async function createZapierWorkflow(
  config: WorkflowConfig,
  zapierApiKey: string
): Promise<string> {
  try {
    const zapierConfig = {
      name: config.name,
      steps: config.steps.map((step, idx) => ({
        action: mapStepToZapierAction(step),
        data: step.config,
        position: idx,
      })),
    };

    const response = await fetch('https://api.zapier.com/v1/zaps', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${zapierApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zapierConfig),
    });

    if (!response.ok) {
      throw new Error(`Zapier API error: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    throw new Error(
      `Failed to create Zapier workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Map step types to N8N node types
function mapStepTypeToN8n(stepType: string): string {
  const mapping: Record<string, string> = {
    trigger: 'n8n-nodes-base.trigger',
    condition: 'n8n-nodes-base.if',
    action: 'n8n-nodes-base.action',
    delay: 'n8n-nodes-base.delay',
  };
  return mapping[stepType] || 'n8n-nodes-base.action';
}

// Map steps to Zapier actions
function mapStepToZapierAction(step: WorkflowStep): string {
  const actionMap: Record<string, string> = {
    email: 'email.send',
    slack: 'slack.send_message',
    social: 'twitter.post',
    webhook: 'webhook.trigger',
    delay: 'delay.wait',
  };
  return actionMap[step.type] || 'action.custom';
}

// Generate connections between workflow steps
function generateConnections(steps: WorkflowStep[]): Record<string, any> {
  const connections: Record<string, any> = {};

  for (let i = 0; i < steps.length - 1; i++) {
    connections[steps[i].id] = {
      main: [[{ node: steps[i + 1].name, type: 'main', index: 0 }]],
    };
  }

  return connections;
}

// Predefined workflow templates
export const WORKFLOW_TEMPLATES: Record<string, WorkflowConfig> = {
  social_scheduling: {
    id: 'social_scheduling',
    name: 'Social Media Scheduling',
    enabled: true,
    steps: [
      {
        id: '1',
        type: 'trigger',
        name: 'Manual Trigger',
        config: { type: 'manual' },
      },
      {
        id: '2',
        type: 'action',
        name: 'Send to Twitter',
        config: { platform: 'twitter', message: '' },
      },
      {
        id: '3',
        type: 'action',
        name: 'Send to LinkedIn',
        config: { platform: 'linkedin', message: '' },
      },
    ],
    createdAt: new Date().toISOString(),
  },

  lead_nurture: {
    id: 'lead_nurture',
    name: 'Lead Nurture Sequence',
    enabled: true,
    steps: [
      {
        id: '1',
        type: 'trigger',
        name: 'New Lead from Form',
        config: { source: 'form' },
      },
      {
        id: '2',
        type: 'action',
        name: 'Send Welcome Email',
        config: { template: 'welcome' },
      },
      {
        id: '3',
        type: 'delay',
        name: 'Wait 3 Days',
        config: { days: 3 },
      },
      {
        id: '4',
        type: 'action',
        name: 'Send Follow-up Email',
        config: { template: 'followup' },
      },
    ],
    createdAt: new Date().toISOString(),
  },

  campaign_launch: {
    id: 'campaign_launch',
    name: 'Campaign Launch Sequence',
    enabled: true,
    steps: [
      {
        id: '1',
        type: 'trigger',
        name: 'Campaign Publish',
        config: { event: 'campaign.published' },
      },
      {
        id: '2',
        type: 'action',
        name: 'Post to Social Media',
        config: { platforms: ['twitter', 'linkedin', 'instagram'] },
      },
      {
        id: '3',
        type: 'action',
        name: 'Send Campaign Email',
        config: { audience: 'subscribers' },
      },
      {
        id: '4',
        type: 'action',
        name: 'Slack Notification',
        config: { channel: '#campaigns' },
      },
    ],
    createdAt: new Date().toISOString(),
  },

  website_tracking: {
    id: 'website_tracking',
    name: 'Website Visitor Tracking',
    enabled: true,
    steps: [
      {
        id: '1',
        type: 'trigger',
        name: 'Website Visit',
        config: { source: 'pixel' },
      },
      {
        id: '2',
        type: 'action',
        name: 'Log to Analytics',
        config: { platform: 'segment' },
      },
      {
        id: '3',
        type: 'condition',
        name: 'Check if Lead Qualified',
        config: { rules: [] },
      },
    ],
    createdAt: new Date().toISOString(),
  },
};

// Trigger types for workflows
export const TRIGGER_TYPES = [
  { id: 'manual', name: 'Manual Trigger', icon: '🎯' },
  { id: 'schedule', name: 'Schedule/Recurring', icon: '⏰' },
  { id: 'webhook', name: 'Webhook', icon: '🔗' },
  { id: 'email', name: 'Email Received', icon: '📧' },
  { id: 'form', name: 'Form Submission', icon: '📝' },
  { id: 'campaign', name: 'Campaign Event', icon: '📢' },
  { id: 'lead', name: 'New Lead', icon: '👤' },
];

// Action types for workflows
export const ACTION_TYPES = [
  { id: 'email', name: 'Send Email', icon: '📧' },
  { id: 'slack', name: 'Slack Message', icon: '💬' },
  { id: 'social', name: 'Post to Social', icon: '🌐' },
  { id: 'webhook', name: 'Call Webhook', icon: '🔗' },
  { id: 'database', name: 'Update Database', icon: '💾' },
  { id: 'conditional', name: 'Conditional Logic', icon: '⚡' },
  { id: 'transform', name: 'Transform Data', icon: '🔄' },
];
