import { callLLM } from './llm-sdk';

export interface VoiceCommand {
  transcript: string;
  intent: 'extract' | 'generate' | 'schedule' | 'analyze' | 'search' | 'deploy' | 'help';
  params: Record<string, any>;
}

export interface VoiceResponse {
  text: string;
  action?: string;
  redirect?: string;
}

// Intent recognition patterns
const INTENT_PATTERNS = {
  extract: [
    /extract.*brand|analyze.*website|scan.*url|pull.*brand/i,
  ],
  generate: [
    /generate.*campaign|create.*content|make.*posts|build.*assets/i,
  ],
  deploy: [
    /deploy.*website|launch.*site|publish.*website|go.*live/i,
  ],
  schedule: [
    /schedule.*post|plan.*content|calendar|when|post.*later/i,
  ],
  search: [
    /find.*leads|search.*prospects|hunt.*companies|look.*for/i,
  ],
  analyze: [
    /compare.*brands|battle|versus|vs|analyze.*market/i,
  ],
  help: [
    /help|what.*can.*do|how.*works|tell.*me|guide/i,
  ],
};

// Extract parameters from transcript
function extractParams(transcript: string, intent: string): Record<string, any> {
  const params: Record<string, any> = {};

  // URL extraction
  const urlMatch = transcript.match(/(?:https?:\/\/|www\.)[^\s]+/);
  if (urlMatch) params.url = urlMatch[0];

  // Brand/company name extraction
  const nameMatch = transcript.match(/(?:for|brand|company|website)\s+["']?([^"'\s]+)["']?/i);
  if (nameMatch) params.name = nameMatch[1];

  // Number extraction (e.g., "5 posts", "3 campaigns")
  const numberMatch = transcript.match(/(\d+)\s+(?:posts?|campaigns?|leads?|websites?)/i);
  if (numberMatch) params.count = parseInt(numberMatch[1]);

  // Channel extraction for campaigns
  const channels = transcript.match(
    /(?:social|email|ads?|content|instagram|twitter|linkedin|facebook)/gi
  );
  if (channels) params.channels = [...new Set(channels.map(c => c.toLowerCase()))];

  // Objective extraction
  const objectives = [
    'awareness',
    'engagement',
    'conversion',
    'traffic',
    'leads',
    'sales',
    'brand',
  ];
  const foundObjective = objectives.find(obj =>
    new RegExp(obj, 'i').test(transcript)
  );
  if (foundObjective) params.objective = foundObjective;

  return params;
}

// Recognize intent from transcript
function recognizeIntent(transcript: string): VoiceCommand['intent'] {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(transcript)) {
        return intent as VoiceCommand['intent'];
      }
    }
  }
  return 'help';
}

// Process voice command and return response
export async function processVoiceCommand(
  transcript: string,
  llmModel: string
): Promise<VoiceResponse> {
  const intent = recognizeIntent(transcript);
  const params = extractParams(transcript, intent);

  let response: VoiceResponse;

  switch (intent) {
    case 'extract':
      response = {
        text: params.url
          ? `I'll extract the brand DNA from ${params.url}. This usually takes about 30 seconds.`
          : 'I can extract brand DNA from any website. Just tell me the URL and I\'ll analyze it for you.',
        action: 'extract',
        redirect: params.url ? `/extract?url=${params.url}` : '/extract',
      };
      break;

    case 'generate':
      response = {
        text: params.name
          ? `I'll generate a marketing campaign for ${params.name}. Do you want social posts, emails, ads, or all of them?`
          : 'I can generate unlimited marketing content for your brand. Which brand would you like to create content for?',
        action: 'generate',
        redirect: '/campaigns',
      };
      break;

    case 'deploy':
      response = {
        text: 'I can build and deploy a website for your brand in seconds. Let me start the website builder for you.',
        action: 'deploy',
        redirect: '/websites',
      };
      break;

    case 'search':
      response = {
        text: `I'll help you find leads. ${
          params.objective
            ? `Looking for leads interested in ${params.objective}. `
            : ''
        }Let me open the lead hunter for you.`,
        action: 'search',
        redirect: '/leads',
      };
      break;

    case 'schedule':
      response = {
        text: 'I can help you schedule content. Let me open the campaign scheduler for you.',
        action: 'schedule',
        redirect: '/campaigns',
      };
      break;

    case 'analyze':
      response = {
        text: 'I can compare two brands side by side. Do you have two brands you\'d like to compare?',
        action: 'analyze',
        redirect: '/dashboard',
      };
      break;

    case 'help':
    default:
      response = {
        text: `I'm Sonic, your AI marketing assistant. I can help you:
        
        • Extract brand DNA from any website
        • Generate marketing campaigns and content
        • Build and deploy websites
        • Find and analyze sales leads
        • Schedule social media posts
        • Compare brands
        
        What would you like to do?`,
        action: 'help',
      };
      break;
  }

  return response;
}

// Text-to-speech using Web Speech API
export async function speakResponse(text: string, voiceName?: string): Promise<void> {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Set voice if available
  if (voiceName) {
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.name.includes(voiceName));
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
}

// Speech-to-text using Web Speech API
export async function transcribeAudio(): Promise<string> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let transcript = '';

    recognition.onstart = () => {
      console.log('Listening...');
    };

    recognition.onresult = (event: any) => {
      transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        transcript += transcriptSegment;
      }
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      resolve(transcript);
    };

    recognition.start();
  });
}

// Get available voices
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}
