import { callLLM } from './llm-sdk';

export interface CustomAgent {
  id: string;
  name: string;
  description: string;
  instructions: string;
  model: string;
  tools: string[];
  triggers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentResponse {
  thinking: string;
  action: string;
  result: string;
}

// System prompt for custom agents
const AGENT_SYSTEM_PROMPT = `You are a specialized AI agent created for a specific task.

Your characteristics:
- Name: {agentName}
- Role: {agentRole}
- Special Instructions: {instructions}

You have access to these tools: {tools}

When responding:
1. Think about the best approach (share your thinking)
2. Choose the appropriate action/tool
3. Execute and provide results
4. Be concise and professional`;

// Create custom agent
export async function createCustomAgent(config: {
  name: string;
  description: string;
  instructions: string;
  model: string;
  tools: string[];
  triggers: string[];
}): Promise<CustomAgent> {
  const agent: CustomAgent = {
    id: `agent_${Date.now()}`,
    name: config.name,
    description: config.description,
    instructions: config.instructions,
    model: config.model,
    tools: config.tools,
    triggers: config.triggers,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return agent;
}

// Run custom agent
export async function runAgent(
  agent: CustomAgent,
  input: string
): Promise<AgentResponse> {
  const systemPrompt = AGENT_SYSTEM_PROMPT.replace('{agentName}', agent.name)
    .replace('{agentRole}', agent.description)
    .replace('{instructions}', agent.instructions)
    .replace('{tools}', agent.tools.join(', '));

  try {
    const response = await callLLM({
      model: agent.model,
      prompt: `${systemPrompt}\n\nUser Request: ${input}`,
      temperature: 0.7,
      maxTokens: 1500,
    });

    // Parse response to extract thinking and action
    const thinkingMatch = response.content.match(/(?:Thinking:|Approach:)([\s\S]*?)(?=Action:|$)/i);
    const actionMatch = response.content.match(/(?:Action:|I will:)([\s\S]*?)(?=Result:|$)/i);
    const resultMatch = response.content.match(/(?:Result:|Completed:)([\s\S]*?)$/i);

    return {
      thinking: thinkingMatch ? thinkingMatch[1].trim() : response.content.slice(0, 200),
      action: actionMatch ? actionMatch[1].trim() : 'Processing request',
      result: resultMatch
        ? resultMatch[1].trim()
        : response.content.slice(200).trim(),
    };
  } catch (error) {
    throw new Error(
      `Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Agent templates
export const AGENT_TEMPLATES = {
  content_creator: {
    name: 'Content Creator',
    description: 'Writes engaging marketing content',
    instructions:
      'You are a professional copywriter. Create compelling, on-brand content that converts. Focus on benefits over features.',
    tools: ['brand_dna', 'tone_analyzer', 'grammar_checker', 'seo_optimizer'],
    triggers: ['manual', 'schedule', 'webhook'],
  },

  sales_assistant: {
    name: 'Sales Assistant',
    description: 'Helps with sales outreach and qualification',
    instructions:
      'You are a sales expert. Help craft personalized outreach messages and qualify leads based on fit. Be direct and professional.',
    tools: ['lead_enrichment', 'company_research', 'email_templates', 'fit_analyzer'],
    triggers: ['lead_created', 'manual', 'webhook'],
  },

  brand_analyst: {
    name: 'Brand Analyst',
    description: 'Analyzes and improves brand positioning',
    instructions:
      'You are a brand strategist. Analyze brand positioning, identify gaps, and suggest improvements. Provide actionable insights.',
    tools: ['competitor_research', 'market_analysis', 'brand_audit', 'positioning_tools'],
    triggers: ['manual', 'schedule'],
  },

  seo_specialist: {
    name: 'SEO Specialist',
    description: 'Optimizes content for search engines',
    instructions:
      'You are an SEO expert. Optimize content for search visibility. Focus on keywords, structure, and backlink opportunities.',
    tools: ['keyword_research', 'seo_analyzer', 'backlink_checker', 'rank_tracker'],
    triggers: ['content_created', 'manual', 'schedule'],
  },

  customer_support: {
    name: 'Customer Support Agent',
    description: 'Handles customer inquiries and support',
    instructions:
      'You are a friendly customer support representative. Help resolve issues, answer questions, and maintain customer satisfaction.',
    tools: ['knowledge_base', 'ticket_system', 'faq_search', 'email_responder'],
    triggers: ['email_received', 'chat_message', 'manual'],
  },

  market_researcher: {
    name: 'Market Researcher',
    description: 'Researches markets and competitors',
    instructions:
      'You are a market research expert. Gather and analyze market data, competitor information, and industry trends.',
    tools: ['web_search', 'data_aggregator', 'competitor_tools', 'analytics'],
    triggers: ['manual', 'schedule', 'webhook'],
  },

  campaign_manager: {
    name: 'Campaign Manager',
    description: 'Plans and executes marketing campaigns',
    instructions:
      'You are a marketing campaign expert. Plan campaigns from strategy to execution. Monitor performance and optimize.',
    tools: ['campaign_builder', 'analytics', 'scheduler', 'budget_optimizer'],
    triggers: ['manual', 'schedule', 'campaign_event'],
  },

  product_manager: {
    name: 'Product Manager',
    description: 'Manages product roadmap and strategy',
    instructions:
      'You are a product manager. Prioritize features, manage roadmap, and align product with business goals.',
    tools: ['feature_prioritizer', 'feedback_analyzer', 'roadmap_builder', 'metrics'],
    triggers: ['feedback_received', 'manual', 'meeting_scheduled'],
  },
};

// Available tools for agents
export const AVAILABLE_TOOLS = [
  { id: 'brand_dna', name: 'Brand DNA Analysis', icon: '🎨' },
  { id: 'tone_analyzer', name: 'Tone Analyzer', icon: '🗣️' },
  { id: 'grammar_checker', name: 'Grammar Check', icon: '✅' },
  { id: 'seo_optimizer', name: 'SEO Optimizer', icon: '🔍' },
  { id: 'lead_enrichment', name: 'Lead Enrichment', icon: '👥' },
  { id: 'company_research', name: 'Company Research', icon: '🏢' },
  { id: 'email_templates', name: 'Email Templates', icon: '📧' },
  { id: 'fit_analyzer', name: 'Fit Analyzer', icon: '📊' },
  { id: 'competitor_research', name: 'Competitor Research', icon: '🎯' },
  { id: 'market_analysis', name: 'Market Analysis', icon: '📈' },
  { id: 'brand_audit', name: 'Brand Audit', icon: '🔍' },
  { id: 'positioning_tools', name: 'Positioning Tools', icon: '🎪' },
  { id: 'keyword_research', name: 'Keyword Research', icon: '🔑' },
  { id: 'seo_analyzer', name: 'SEO Analyzer', icon: '📉' },
  { id: 'backlink_checker', name: 'Backlink Checker', icon: '🔗' },
  { id: 'rank_tracker', name: 'Rank Tracker', icon: '📍' },
  { id: 'knowledge_base', name: 'Knowledge Base', icon: '📚' },
  { id: 'ticket_system', name: 'Ticket System', icon: '🎫' },
  { id: 'faq_search', name: 'FAQ Search', icon: '❓' },
  { id: 'email_responder', name: 'Email Responder', icon: '💬' },
];

// Trigger types
export const TRIGGER_TYPES = [
  { id: 'manual', name: 'Manual Trigger', icon: '👆' },
  { id: 'schedule', name: 'Scheduled', icon: '⏰' },
  { id: 'webhook', name: 'Webhook', icon: '🔗' },
  { id: 'email_received', name: 'Email Received', icon: '📧' },
  { id: 'chat_message', name: 'Chat Message', icon: '💬' },
  { id: 'lead_created', name: 'Lead Created', icon: '👤' },
  { id: 'content_created', name: 'Content Created', icon: '📝' },
  { id: 'campaign_event', name: 'Campaign Event', icon: '📢' },
  { id: 'feedback_received', name: 'Feedback Received', icon: '💭' },
  { id: 'meeting_scheduled', name: 'Meeting Scheduled', icon: '📅' },
];
