/**
 * Feature 5: Workflow Integration Service
 * Connect to n8n, Zapier, Make.com, and other automation platforms
 */

export interface WorkflowProvider {
  id: string;
  name: string;
  enabled: boolean;
  webhookUrl?: string;
}

export const WORKFLOW_PROVIDERS = [
  { id: 'n8n', name: 'n8n Automation', icon: '⚙️' },
  { id: 'zapier', name: 'Zapier', icon: '🔗' },
  { id: 'make', name: 'Make.com', icon: '🎯' },
  { id: 'activepieces', name: 'ActivePieces', icon: '🧩' },
  { id: 'pipedream', name: 'Pipedream', icon: '🌊' },
  { id: 'relay', name: 'Relay.app', icon: '📡' },
];

export function getEnabledWorkflows(): WorkflowProvider[] {
  try {
    const settings = JSON.parse(localStorage.getItem('workflow_settings') || '{}');
    return WORKFLOW_PROVIDERS.map(p => ({
      ...p,
      enabled: settings[p.id]?.enabled || false,
      webhookUrl: settings[p.id]?.webhookUrl,
    })).filter(p => p.enabled);
  } catch {
    return [];
  }
}

export function setWorkflowProvider(id: string, webhookUrl: string): void {
  try {
    const settings = JSON.parse(localStorage.getItem('workflow_settings') || '{}');
    settings[id] = { enabled: true, webhookUrl };
    localStorage.setItem('workflow_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to set workflow provider', e);
  }
}

export async function triggerWorkflow(
  providerId: string,
  campaignData: {
    brandName: string;
    goal: string;
    assets: any[];
  }
): Promise<boolean> {
  try {
    const settings = JSON.parse(localStorage.getItem('workflow_settings') || '{}');
    const config = settings[providerId];
    
    if (!config || !config.enabled) {
      throw new Error(`Workflow provider ${providerId} not enabled`);
    }

    if (!config.webhookUrl) {
      throw new Error(`No webhook URL configured for ${providerId}`);
    }

    const payload = {
      timestamp: new Date().toISOString(),
      provider: providerId,
      campaign: {
        brandName: campaignData.brandName,
        goal: campaignData.goal,
        assetCount: campaignData.assets.length,
        assets: campaignData.assets.map(a => ({
          type: a.type,
          content: a.content?.substring(0, 500), // Limit size
        })),
      },
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Workflow error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Workflow trigger failed:', error);
    throw error;
  }
}

export const WORKFLOW_TEMPLATES = [
  {
    id: 'social_scheduling',
    name: 'Social Media Scheduling',
    icon: '📱',
    description: 'Auto-post to social media channels',
    triggers: ['manual', 'schedule'],
    actions: ['twitter', 'linkedin', 'instagram'],
  },
  {
    id: 'lead_nurture',
    name: 'Lead Nurture Sequence',
    icon: '🎯',
    description: 'Send automated email sequences',
    triggers: ['new_lead'],
    actions: ['email', 'delay', 'conditional'],
  },
  {
    id: 'campaign_launch',
    name: 'Campaign Launch',
    icon: '🚀',
    description: 'Launch multi-channel campaigns',
    triggers: ['manual'],
    actions: ['social', 'email', 'slack'],
  },
  {
    id: 'visitor_tracking',
    name: 'Visitor Tracking',
    icon: '📊',
    description: 'Track and log website visitors',
    triggers: ['webhook'],
    actions: ['analytics', 'crm'],
  },
];
