import { BrandDNA, type LLMProvider } from '$types';
import { getProviderConfig, LLM_PROVIDERS } from './provider-config';

export interface LLMRequest {
  model: string;
  prompt: string;
  provider?: LLMProvider;
  schema?: any;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Get API keys from localStorage (BYOK model)
function getApiKey(provider: string): string {
  try {
    const encrypted = localStorage.getItem('api_keys');
    if (!encrypted) {
      throw new Error(`No API keys configured. Please go to Settings and add your ${provider} API key.`);
    }
    
    const keys = JSON.parse(atob(encrypted));
    console.log('[getApiKey] Available categories:', Object.keys(keys));
    console.log('[getApiKey] Available LLM providers:', Object.keys(keys.llm || {}));
    
    const key = keys.llm?.[provider];
    if (!key) {
      const availableProviders = Object.keys(keys.llm || {});
      throw new Error(
        `No API key found for "${provider}". ` +
        (availableProviders.length > 0 
          ? `Configured providers: ${availableProviders.join(', ')}`
          : 'No LLM providers configured. Go to Settings to add API keys.')
      );
    }
    return key;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load API keys';
    throw new Error(message);
  }
}

// OpenAI
async function callOpenAI(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = getApiKey('openai');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model || 'gpt-4-turbo',
      messages: [{ role: 'user', content: request.prompt }],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI error: ${error.error?.message}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  };
}

// Claude
async function callClaude(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = getApiKey('claude');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model || 'claude-3-opus-20240229',
      max_tokens: request.maxTokens || 2000,
      messages: [{ role: 'user', content: request.prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude error: ${error.error?.message}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    },
  };
}

// Gemini
async function callGemini(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = getApiKey('gemini');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${request.model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: request.prompt }] }],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini error: ${error.error?.message || JSON.stringify(error)}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0]) {
    throw new Error('Gemini returned no content');
  }
  
  const text = data.candidates[0].content?.parts[0]?.text;
  if (!text) {
    throw new Error('Gemini response missing text content');
  }
  
  return {
    content: text,
  };
}

// Mistral
async function callMistral(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = getApiKey('mistral');
  
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || 'mistral-large-latest',
        messages: [{ role: 'user', content: request.prompt }],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const error = await response.json();
        errorMsg = error.message || error.error?.message || errorMsg;
      } catch (e) {
        const text = await response.text();
        errorMsg = text || errorMsg;
      }
      throw new Error(`Mistral error: ${errorMsg}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[callMistral] Invalid response:', data);
      throw new Error(`Mistral returned invalid response: ${JSON.stringify(data).substring(0, 200)}`);
    }
    
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Mistral error: ${message}`);
  }
}

// Groq
async function callGroq(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = getApiKey('groq');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model || 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: request.prompt }],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Groq error: ${error.error?.message}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  };
}

// Cohere
async function callCohere(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = getApiKey('cohere');
  const response = await fetch('https://api.cohere.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model || 'command',
      prompt: request.prompt,
      max_tokens: request.maxTokens || 2000,
      temperature: request.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cohere error: ${error.message}`);
  }

  const data = await response.json();
  return {
    content: data.generations[0].text,
  };
}

/**
 * Route LLM call to appropriate provider
 * Supports auto-detection from model name or explicit provider
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  let provider = request.provider?.toLowerCase();
  
  // If no explicit provider, try to detect from model
  if (!provider) {
    provider = request.model.split('-')[0].toLowerCase();
  }

  console.log('[callLLM] Provider:', provider, 'Model:', request.model);

  // Try to find provider config
  let providerConfig = LLM_PROVIDERS[provider as keyof typeof LLM_PROVIDERS];
  
  // If not found by ID, search by model
  if (!providerConfig) {
    providerConfig = Object.values(LLM_PROVIDERS).find(
      p => p.models.some(m => request.model.includes(m))
    );
  }

  if (!providerConfig) {
    throw new Error(`Unknown LLM provider: ${provider}. Model: ${request.model}. Available providers: ${Object.keys(LLM_PROVIDERS).join(', ')}`);
  }

  console.log('[callLLM] Resolved to:', providerConfig.id);

  // Route based on provider
  switch (providerConfig.id) {
    case 'openai':
      return callOpenAI(request);
    case 'claude':
      return callClaude(request);
    case 'gemini':
      return callGemini(request);
    case 'mistral':
      return callMistral(request);
    case 'groq':
    case 'mixtral':
      return callGroq(request);
    case 'cohere':
      return callCohere(request);
    
    // Additional providers would route to their respective functions
    // For now, they fall through to custom handler
    default:
      return callCustomProvider(request, providerConfig);
  }
}

/**
 * Generic custom provider caller
 * Handles providers not yet fully implemented
 */
async function callCustomProvider(request: LLMRequest, config: any): Promise<LLMResponse> {
  if (!config.endpoint) {
    throw new Error(`No endpoint configured for ${config.name}`);
  }

  let apiKey: string;
  try {
    apiKey = getApiKey(config.id);
  } catch (err) {
    throw new Error(
      `${config.name} API key not configured. Please go to Settings and add your ${config.name} API key under the "${config.name}" provider.`
    );
  }
  
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        [config.authHeader]: config.authHeader === 'Authorization' ? `Bearer ${apiKey}` : apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: [{ role: 'user', content: request.prompt }],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const error = await response.json();
        errorMsg = error.message || error.error?.message || JSON.stringify(error);
      } catch (e) {
        const text = await response.text();
        errorMsg = text || errorMsg;
      }
      throw new Error(`${config.name} returned ${response.status}: ${errorMsg}`);
    }

    const data = await response.json();
    
    console.log(`[callCustomProvider] ${config.name} response:`, data);
    
    // Try common response formats
    const content = 
      data.choices?.[0]?.message?.content ||
      data.content?.[0]?.text ||
      data.result?.text ||
      data.data?.content ||
      data.output ||
      '';

    if (!content) {
      throw new Error(`${config.name} returned empty response. Full response: ${JSON.stringify(data).substring(0, 300)}`);
    }

    return {
      content,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`${config.name} error: ${message}`);
  }
}

// Brand DNA extraction prompt
export function getBrandExtractionPrompt(html: string): string {
  return `You are a brand strategist. Analyze this website HTML and extract comprehensive brand DNA.

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "core": {
    "mission": "string",
    "vision": "string", 
    "values": ["string"],
    "tagline": "string"
  },
  "identity": {
    "colors": ["hex codes"],
    "fonts": ["font names"],
    "visualStyle": "description"
  },
  "voice": {
    "tone": ["descriptive words"],
    "keywords": ["key terms used"],
    "writingStyle": "description"
  },
  "audience": {
    "demographics": "description",
    "psychographics": "description",
    "painPoints": ["string"]
  },
  "market": {
    "positioning": "string",
    "competitors": ["string"]
  }
}

Website HTML:
${html.slice(0, 8000)}`;
}

// Campaign generation prompt
export function getCampaignPrompt(brandDNA: BrandDNA, objective: string, channel: string): string {
  return `You are a marketing expert. Generate compelling ${channel} content based on this brand and objective.

Brand DNA:
${JSON.stringify(brandDNA, null, 2)}

Objective: ${objective}

Generate creative, on-brand content that resonates with the target audience. Be specific and actionable.
Return only JSON with appropriate fields for the channel (e.g., social: {posts: []}, email: {subject, body, cta}).`;
}

// Website generation prompt
export function getWebsitePrompt(brandDNA: BrandDNA): string {
  return `You are an expert web designer. Create a complete, modern HTML/CSS website for this brand.

Brand DNA:
${JSON.stringify(brandDNA, null, 2)}

Requirements:
- Responsive design (mobile first)
- Modern, clean aesthetics
- Use the brand colors and fonts
- Include sections: hero, features, about, contact
- Make it production-ready
- Use Tailwind CSS classes for styling

Return ONLY the complete HTML code (no markdown, no explanation). Make it self-contained with inline styles and Tailwind classes.`;
}

// Lead analysis prompt
export function getLeadAnalysisPrompt(company: string, website: string, criteria: any): string {
  return `Analyze this company for fit against these criteria.

Company: ${company}
Website: ${website}
Criteria: ${JSON.stringify(criteria, null, 2)}

Return JSON:
{
  "industry": "string",
  "size": "string (startup|smb|mid-market|enterprise)",
  "fitScore": 0-100,
  "painPoints": ["string"],
  "opportunity": "string"
}`;
}
