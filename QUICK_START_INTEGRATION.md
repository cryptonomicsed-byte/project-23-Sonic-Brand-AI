# Quick Start: Using the 8 New Features

## One-Line Summaries

| Feature | File | What to Import | Main Function |
|---------|------|---|---|
| **1. Enhanced Extraction** | `brand-extraction-enhanced.ts` | `enhancedExtractionService` | `extractBrandDNA(url, name, model)` |
| **2. Tier System** | `tiers.ts` | `hasFeatureAccess, getCurrentTier` | `hasFeatureAccess(tier, feature)` |
| **3. Sonic Co-Pilot** | `sonic-copilot.ts` | `sonicExecuteCommand` | `sonicExecuteCommand(input, tier)` |
| **4. Video Generation** | `video-service.ts` | `generateVideo` | `generateVideo({imageUrl, prompt, ...})` |
| **5. Workflows** | `workflow-service.ts` | `triggerWorkflow` | `triggerWorkflow(providerId, data)` |
| **6. Inference Engine** | `inference-engine.ts` | `inferenceRouter` | `wrapLLMCall(llmFn, request)` |
| **7. PDF Export** | `pdf-service.ts` | `exportToPDF` | `exportToPDF(brandData, filename)` |
| **8. Accessibility** | `accessibility-service.ts` | `generateA11yReport` | `generateA11yReport(brandData)` |

---

## Copy-Paste Code Examples

### 1. Use Enhanced Extraction
```typescript
import { enhancedExtractionService } from '$lib/brand-extraction-enhanced';

const brandDNA = await enhancedExtractionService.extractBrandDNA(
  'https://airbnb.com',
  'Airbnb',
  'gpt-4-turbo'
);
console.log(brandDNA.core.mission);
```

### 2. Check Tier Access
```typescript
import { hasFeatureAccess, getCurrentTier } from '$lib/tiers';

const userTier = getCurrentTier(userId);
if (hasFeatureAccess(userTier, 'voiceCommands')) {
  // Show Sonic Co-Pilot
} else {
  // Show upgrade modal
}
```

### 3. Execute Voice Command
```typescript
import { sonicExecuteCommand } from '$lib/sonic-copilot';

const response = await sonicExecuteCommand(
  'extract google.com',
  userTier
);
console.log(response); // "🔍 Extracting brand data from google.com..."
```

### 4. Generate Video
```typescript
import { generateVideo, canGenerateVideo } from '$lib/video-service';

if (await canGenerateVideo(userId, userTier)) {
  const { videoUrl, engineUsed } = await generateVideo({
    imageUrl: 'https://...',
    prompt: 'Create promotional video for our brand',
    engine: 'ltx2',
    userId,
    tier: userTier,
  });
  console.log(`Video created with ${engineUsed}: ${videoUrl}`);
}
```

### 5. Trigger Workflow
```typescript
import { triggerWorkflow, setWorkflowProvider } from '$lib/workflow-service';

// First time: set webhook
setWorkflowProvider('zapier', 'https://hooks.zapier.com/hooks/...');

// Later: trigger
await triggerWorkflow('zapier', {
  brandName: 'Acme Corp',
  goal: 'Lead generation',
  assets: campaignAssets,
});
```

### 6. Use Inference Engine
```typescript
import { inferenceRouter } from '$lib/inference-engine';

inferenceRouter.setTier(userTier); // Set tier for technique access

const { result, usedSelfConsistency, confidence } = 
  await inferenceRouter.wrapLLMCall(
    () => callLLM({ model: 'gpt-4-turbo', prompt: 'Generate campaign...' }),
    { prompt: 'Generate campaign...', task: 'campaign_gen', tier: userTier }
  );

console.log(`Result: ${result}`);
console.log(`Used self-consistency: ${usedSelfConsistency}`);
console.log(`Confidence: ${confidence}`);
```

### 7. Export as PDF
```typescript
import { exportToPDF } from '$lib/pdf-service';

exportToPDF(brandData, 'brand-profile', {
  title: 'My Brand Profile',
  includeColors: true,
  includeFonts: true,
  includeMessaging: true,
  pageSize: 'a4',
});
// Browser downloads: brand-profile.html (open in browser → print as PDF)
```

### 8. Analyze Accessibility
```typescript
import { generateA11yReport, isAccessibleFor } from '$lib/accessibility-service';

const report = generateA11yReport(brandData);
console.log(`Score: ${report.score}/100`);
console.log(`WCAG Level: ${report.wcagLevel}`); // AAA, AA, or Fail
console.log(`Recommendations:`);
report.recommendations.forEach(r => console.log(`  - ${r}`));

// Check specific color combination
const isAccessible = isAccessibleFor(
  { hex: '#000000', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  'AAA' // WCAG AAA level
);
console.log(`Is accessible: ${isAccessible}`); // true
```

---

## Integration Checklist

### For Extract Page
- [ ] Import `enhancedExtractionService`
- [ ] Replace `extractBrandDNA` call
- [ ] Test on 3+ URLs

### For All Pages
- [ ] Import `hasFeatureAccess`
- [ ] Add tier checks before premium features
- [ ] Show upgrade modal if needed

### For Layout
- [ ] Import `isSonicAvailable`
- [ ] Add Sonic Co-Pilot if available
- [ ] Add tier badge to navigation

### For Pricing Page
- [ ] Import `TIER_LIMITS, TIER_PRICES, TIER_NAMES`
- [ ] Display comparison table
- [ ] Update feature descriptions

### For Campaign Page
- [ ] Import `generateVideo`
- [ ] Add video button
- [ ] Show available videos/month

### For Settings
- [ ] Import `setWorkflowProvider`
- [ ] Add webhook URL inputs
- [ ] Test trigger

### For LLM Calls
- [ ] Import `inferenceRouter`
- [ ] Wrap LLM calls
- [ ] Show inference badge

### For Brand Profile
- [ ] Import `exportToPDF`
- [ ] Add "Export PDF" button
- [ ] Import `generateA11yReport`
- [ ] Add accessibility score display

---

## File Locations

```
sonic-brand-ai/
└── src/lib/
    ├── brand-extraction-enhanced.ts  ← Enhanced extraction
    ├── scraper.ts                    ← Web scraping (used by extraction)
    ├── tiers.ts                      ← Tier system
    ├── sonic-copilot.ts              ← Voice commands
    ├── video-service.ts              ← Video generation
    ├── workflow-service.ts           ← Automation workflows
    ├── inference-engine.ts           ← Advanced LLM reasoning
    ├── pdf-service.ts                ← PDF export
    └── accessibility-service.ts      ← A11y analysis
```

---

## Type Definitions (Copy as Needed)

```typescript
// Tier
type Tier = 'free' | 'pro' | 'hunter' | 'agency';

// Brand DNA
interface BrandDNA {
  core: { mission: string; vision: string; values: string[]; tagline: string };
  identity: { colors: any[]; fonts: any[]; visualStyle: string };
  voice: { tone: string[]; keywords: string[]; writingStyle: string };
  audience: { demographics: string; psychographics: string; painPoints: string[] };
  market: { positioning: string; competitors: any[] };
}

// Video
interface VideoGenerationRequest {
  imageUrl: string;
  prompt: string;
  engine?: 'ltx2' | 'sora2' | 'veo3';
  userId: string;
  tier: string;
}

// Inference
interface InferenceRequest {
  prompt: string;
  task: 'campaign_gen' | 'website_gen' | 'extraction' | 'analysis' | 'general';
  tier: 'free' | 'pro' | 'hunter' | 'agency';
  context?: Record<string, any>;
}
```

---

## Testing Commands

```bash
# Test extraction
curl http://localhost:1111/api/extract

# Test tiers
console.log(getCurrentTier('user123'))

# Test video
curl -X POST http://localhost:1111/api/video \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"...","prompt":"..."}'

# Test accessibility
generateA11yReport(brandData)

# Check local state
localStorage.getItem('user_tier_user123')
localStorage.getItem('extractions_user123')
localStorage.getItem('workflow_settings')
```

---

## FAQ

**Q: Do I need a backend for these features?**
A: No! Everything uses localStorage and existing APIs (LLM SDK). No new backend needed.

**Q: Do I need additional npm packages?**
A: No! Uses existing dependencies only.

**Q: Are these features type-safe?**
A: Yes, 100% TypeScript with strict mode.

**Q: Can I use them separately?**
A: Yes, each service is independent.

**Q: How do I add new tiers?**
A: Edit `tiers.ts` and add to `TIER_LIMITS` object.

**Q: How do I add new workflow providers?**
A: Edit `workflow-service.ts` and add to `WORKFLOW_PROVIDERS`.

**Q: How do I change tier pricing?**
A: Edit `TIER_PRICES` in `tiers.ts`.

**Q: Can I disable certain features?**
A: Yes, modify the appropriate config object in each service file.

---

## Key Imports

```typescript
// Extraction
import { enhancedExtractionService } from '$lib/brand-extraction-enhanced';

// Tiers
import { hasFeatureAccess, getCurrentTier, TIER_LIMITS, TIER_PRICES } from '$lib/tiers';

// Voice
import { sonicExecuteCommand, isSonicAvailable } from '$lib/sonic-copilot';

// Video
import { generateVideo, canGenerateVideo, getVideoTierInfo } from '$lib/video-service';

// Workflows
import { triggerWorkflow, setWorkflowProvider, WORKFLOW_PROVIDERS } from '$lib/workflow-service';

// Inference
import { inferenceRouter } from '$lib/inference-engine';

// PDF
import { exportToPDF, generatePrintView } from '$lib/pdf-service';

// A11y
import { generateA11yReport, analyzeAccessibility, isAccessibleFor } from '$lib/accessibility-service';
```

---

## Next Steps

1. ✅ Features are implemented
2. 👉 Wire up UI components
3. 👉 Test each feature
4. 👉 Deploy to production

Ready? Start with Feature 1 (Enhanced Extraction)!

---

**All features documented and ready to use! 🚀**
