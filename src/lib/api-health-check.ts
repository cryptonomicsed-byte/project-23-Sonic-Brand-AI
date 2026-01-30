/**
 * API Health Check
 * Validates API keys are working before saving
 */

import { getProviderConfig } from './provider-config';

export async function healthCheckApiKey(
  provider: string,
  apiKey: string,
  category: 'llm' | 'image' | 'video' | 'voice'
): Promise<{ valid: boolean; error?: string }> {
  try {
    const config = getProviderConfig(provider, category);
    if (!config) {
      return { valid: false, error: `Provider ${provider} not found` };
    }

    // Simple health check: try a minimal request to each provider
    switch (provider) {
      case 'openai':
        return await checkOpenAI(apiKey);
      case 'mistral':
        return await checkMistral(apiKey);
      case 'claude':
        return await checkClaude(apiKey);
      case 'gemini':
        return await checkGemini(apiKey);
      case 'groq':
        return await checkGroq(apiKey);
      default:
        return { valid: true }; // Skip health check for unknown providers
    }
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function checkOpenAI(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `OpenAI API error: ${response.status} ${response.statusText}`,
      };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Failed to connect to OpenAI: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function checkMistral(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        valid: false,
        error: `Mistral API error: ${response.status} - ${error.message || error.error?.message || response.statusText}`,
      };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Failed to connect to Mistral: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function checkClaude(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        valid: false,
        error: `Claude API error: ${response.status} - ${error.error?.message || response.statusText}`,
      };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Failed to connect to Claude: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function checkGemini(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:countTokens?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'hi' }] }],
        }),
      }
    );

    if (!response.ok) {
      return {
        valid: false,
        error: `Gemini API error: ${response.status} ${response.statusText}`,
      };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Failed to connect to Gemini: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function checkGroq(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        valid: false,
        error: `Groq API error: ${response.status} - ${error.error?.message || response.statusText}`,
      };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Failed to connect to Groq: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
