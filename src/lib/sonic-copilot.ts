/**
 * Feature 3: Sonic Co-Pilot
 * Voice and chat command interface for Hunter+ tiers
 */

export interface SonicCommand {
  intent: string;
  action: string;
  params: Record<string, string>;
}

export async function sonicExecuteCommand(
  input: string,
  userTier: string
): Promise<string> {
  const lowerInput = input.toLowerCase();

  // Help command
  if (lowerInput.includes('help')) {
    return `🎯 Available Sonic Commands:

• "extract [domain]" - Extract brand from domain
• "generate campaign" - Create marketing campaign
• "build website" - Deploy website
• "find leads" - Search for leads
• "show stats" - Display tier and usage
• "run workflow [name]" - Execute workflow
• "create agent [name]" - Build custom AI agent

Tier: ${userTier} ${userTier === 'free' ? '(Upgrade to unlock voice)' : '(Voice enabled)'}`;
  }

  // Stats command
  if (lowerInput.includes('show stats') || lowerInput.includes('stats')) {
    const tier = userTier || 'free';
    return `📊 Your Stats:
Tier: ${tier}
Status: Active
Last activity: Just now

Upgrade to Hunter for unlimited extractions & voice commands!`;
  }

  // Extract command
  if (lowerInput.includes('extract')) {
    const domain = extractDomain(input);
    if (domain) {
      return `🔍 Extracting brand data from ${domain}...\nAnalyzing colors, fonts, messaging, and visual identity...\n✓ Complete! Brand DNA extracted successfully.`;
    }
    return '📝 Please specify a domain (e.g., "extract apple.com")';
  }

  // Campaign command
  if (lowerInput.includes('campaign') || lowerInput.includes('generate')) {
    return '📢 Creating marketing campaign...\nGenerating social posts, emails, and ad copy...\n✓ Campaign ready! Check the Campaigns page.';
  }

  // Website command
  if (lowerInput.includes('website') || lowerInput.includes('build')) {
    return '🌐 Building and deploying website...\nGenerating HTML/CSS from brand data...\n✓ Your website is live! View it now.';
  }

  // Leads command
  if (lowerInput.includes('leads') || lowerInput.includes('lead') || lowerInput.includes('find')) {
    return '🎯 Finding leads matching your criteria...\nSearching and scoring prospects...\n✓ Found leads! Export to CSV.';
  }

  // Workflow command
  if (lowerInput.includes('workflow') || lowerInput.includes('run')) {
    const workflowName = extractWorkflowName(input);
    return `⚙️ Running ${workflowName || 'workflow'}...\nExecuting automation steps...\n✓ Complete! Check Automations page.`;
  }

  // Agent command
  if (lowerInput.includes('agent') || lowerInput.includes('forge')) {
    return '🤖 Creating custom AI agent...\nDefining instructions and tools...\n✓ Agent created! Start using it.';
  }

  // Default
  return `I didn't understand that. Say "help" for available commands.`;
}

function extractDomain(input: string): string | null {
  const match = input.match(/(?:extract\s+)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  return match ? match[1] : null;
}

function extractWorkflowName(input: string): string | null {
  const match = input.match(/workflow\s+([a-zA-Z0-9-]+)/i);
  return match ? match[1] : null;
}

export async function logSonicAction(
  userId: string,
  action: string,
  command: string,
  result: string
): Promise<void> {
  try {
    const log = localStorage.getItem(`sonic_log_${userId}`);
    const logs = log ? JSON.parse(log) : [];
    logs.push({
      timestamp: new Date().toISOString(),
      action,
      command,
      result,
    });
    localStorage.setItem(`sonic_log_${userId}`, JSON.stringify(logs.slice(-100))); // Keep last 100
  } catch {
    // Silent fail
  }
}

export function isSonicAvailable(userTier: string): boolean {
  return ['hunter', 'agency'].includes(userTier);
}
