import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Check, Copy, Download, FileText, AlertCircle, Zap } from 'lucide-react';
import { enhancedExtractionService } from '$lib/brand-extraction-enhanced';
import { deepBrandExtractor } from '$lib/deep-brand-extractor';
import { extractEnhancedBrandDNA } from '$lib/enhanced-brand-extractor';
import { exportToPDF, generatePrintView } from '$lib/pdf-service';
import { generateA11yReport } from '$lib/accessibility-service';
import { EnhancedPortfolioDisplay } from '$components/EnhancedPortfolioDisplay';
import { hasFeatureAccess, getCurrentTier, getMonthlyExtractionCount, addExtraction } from '$lib/tiers';
import { BrandDNA, BrandProfile } from '$types';
import { useStore } from '$lib/store';
import { supabase } from '$lib/supabase';

export function Extract() {
  const navigate = useNavigate();
  const { user, settings: storeSettings, loadSettings } = useStore();
  const [settings, setLocalSettings] = useState(storeSettings);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [deepLoading, setDeepLoading] = useState(false);
  const [error, setError] = useState('');
  const [brandDNA, setBrandDNA] = useState<BrandDNA | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [a11yReport, setA11yReport] = useState<any>(null);
  const [userTier] = useState(getCurrentTier(user?.id || 'guest'));
  const [deepProgress, setDeepProgress] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    // Load settings on mount
    if (!settings && loadSettings) {
      const loaded = loadSettings();
      setLocalSettings(loaded);
      console.log('[Extract] Loaded settings:', loaded);
    }
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBrandDNA(null);

    try {
      const userTier = getCurrentTier(user?.id || 'guest');
      const monthlyCount = getMonthlyExtractionCount(user?.id || 'guest');
      
      if (!hasFeatureAccess(userTier, 'extractionsPerMonth')) {
        setError('Your tier does not have access to brand extraction. Upgrade to Pro or higher.');
        setLoading(false);
        return;
      }

      if (userTier === 'free' && monthlyCount >= 3) {
        setError('You\'ve reached your 3 extractions/month limit. Upgrade to Pro for unlimited.');
        setLoading(false);
        return;
      }

      console.log('[Extract] Extracting enhanced brand DNA from:', url);
      
      // Use enhanced extractor with deep analysis
      const dna = await extractEnhancedBrandDNA(url);
      setBrandDNA(dna);
      setProfileName(new URL(url.startsWith('http') ? url : `https://${url}`).hostname);
      addExtraction(user?.id || 'guest');

      try {
        const report = generateA11yReport(dna);
        setA11yReport(report);
      } catch (e) {
        console.warn('A11y analysis failed:', e);
      }

      if (user && settings) {
        const { data: userSettings } = await supabase
          .from('user_settings')
          .select('extractions_used')
          .eq('user_id', user.id)
          .single();

        if (userSettings) {
          await supabase
            .from('user_settings')
            .update({ extractions_used: (userSettings.extractions_used || 0) + 1 })
            .eq('user_id', user.id);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Extraction failed. Please try another URL.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeepScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userTier = getCurrentTier(user?.id || 'guest');
    if (!hasFeatureAccess(userTier, 'deepBrandScan')) {
      setError('Deep Brand Scan is only available for Pro+ tiers. Upgrade to unlock.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setDeepLoading(true);
    setError('');
    setBrandDNA(null);
    setDeepProgress('');

    try {
      // Use user's configured LLM provider and model
      const provider = (settings?.llmProvider as string) || 'openai';
      
      // Determine model based on provider
      const modelsByProvider: Record<string, string> = {
        openai: 'gpt-4-turbo',
        claude: 'claude-3-opus-20240229',
        gemini: 'gemini-1.5-flash',
        mistral: 'mistral-large-latest',
        groq: 'mixtral-8x7b-32768',
        cohere: 'command',
      };
      
      let model = modelsByProvider[provider] || 'gpt-4-turbo';
      
      // Override with preferences if available
      if (settings?.preferences && typeof settings.preferences === 'object') {
        const prefs = settings.preferences as any;
        if (prefs.llmModel) model = prefs.llmModel;
      }
      
      console.log('[Extract Deep] Using provider:', provider, 'model:', model);
      
      const dna = await deepBrandExtractor.extractBrandDNA(
        url,
        model,
        setDeepProgress,
        provider
      );
      
      setBrandDNA(dna);
      setProfileName(new URL(url.startsWith('http') ? url : `https://${url}`).hostname);
      addExtraction(user?.id || 'guest');

      try {
        const report = generateA11yReport(dna);
        setA11yReport(report);
      } catch (e) {
        console.warn('A11y analysis failed:', e);
      }

      if (user && settings) {
        const { data: userSettings } = await supabase
          .from('user_settings')
          .select('extractions_used')
          .eq('user_id', user.id)
          .single();

        if (userSettings) {
          await supabase
            .from('user_settings')
            .update({ extractions_used: (userSettings.extractions_used || 0) + 1 })
            .eq('user_id', user.id);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Deep scan failed. Please try another URL.';
      if (errorMsg.includes('API key') || errorMsg.includes('configured')) {
        setError(`⚠️ Missing API Key: ${errorMsg}\n\nPlease go to Settings and configure your LLM provider first.`);
      } else {
        setError(errorMsg);
      }
    } finally {
      setDeepLoading(false);
      setAbortController(null);
    }
  };

  const handleCancelDeepScan = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setDeepLoading(false);
      setDeepProgress('');
    }
  };

  const handleSave = async () => {
    if (!brandDNA || !profileName) return;
    setSaving(true);

    try {
      const { error: dbError } = await supabase.from('brand_profiles').insert({
        user_id: user.id,
        name: profileName,
        url,
        brand_dna: brandDNA,
        is_public: false,
      });

      if (dbError) throw dbError;

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!brandDNA) return;
    const json = JSON.stringify(brandDNA, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profileName}-brand-dna.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Brand DNA Extraction</h1>
        <p className="text-gray-400">
          Paste a URL and let AI analyze the brand's core identity, voice, and positioning.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {!brandDNA ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Website URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
              required
              disabled={loading || deepLoading}
            />
          </div>

          {deepProgress && (
            <div className="p-4 bg-blue-500/10 border border-blue-500 rounded-lg text-blue-400 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Loader className="animate-spin" size={18} />
                <span>{deepProgress}</span>
              </div>
              <button
                onClick={handleCancelDeepScan}
                className="text-xs text-blue-300 hover:text-blue-200 underline"
              >
                Cancel Deep Scan
              </button>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleExtract}
              disabled={loading || deepLoading || !url}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Extracting...
                </>
              ) : (
                'Extract Brand DNA'
              )}
            </button>

            {hasFeatureAccess(userTier, 'deepBrandScan') && (
              <button
                onClick={handleDeepScan}
                disabled={loading || deepLoading || !url}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                title="Multi-page crawl: slower but more accurate analysis"
              >
                {deepLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Deep Scan...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Deep Scan
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
           {/* Enhanced Portfolio Display */}
           <EnhancedPortfolioDisplay dna={brandDNA} />

           {/* Analysis Mode Badge */}
           {brandDNA.analysisMode === 'deep' && (
             <div className="p-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/50 rounded-lg text-sm text-yellow-300 flex items-center gap-2">
               <Zap size={18} />
               <div>
                 <strong>Deep Brand Scan</strong> - Analyzed {brandDNA.pagesAnalyzed || 1} page(s)
                 {brandDNA.crawlErrors && brandDNA.crawlErrors.length > 0 && (
                   <p className="text-xs text-yellow-400/80 mt-1">
                     {brandDNA.crawlErrors.length} crawl issue(s) encountered (non-blocking)
                   </p>
                 )}
               </div>
             </div>
           )}

           {/* Results */}
           <div className="grid md:grid-cols-2 gap-4">
            {/* Core */}
            <ResultCard title="Core Identity">
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-primary">Mission:</strong>
                  <p className="text-gray-300">{brandDNA.core.mission}</p>
                </div>
                <div>
                  <strong className="text-primary">Vision:</strong>
                  <p className="text-gray-300">{brandDNA.core.vision}</p>
                </div>
                <div>
                  <strong className="text-primary">Tagline:</strong>
                  <p className="text-gray-300">{brandDNA.core.tagline}</p>
                </div>
                <div>
                  <strong className="text-primary">Values:</strong>
                  <p className="text-gray-300">{brandDNA.core.values.join(', ')}</p>
                </div>
              </div>
            </ResultCard>

            {/* Visual Identity */}
            <ResultCard title="Visual Identity">
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-primary">Colors:</strong>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {brandDNA.identity.colors.map(color => (
                      <div key={color} className="flex items-center gap-1">
                        <div
                          className="w-6 h-6 rounded border border-gray-600"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                        <span className="text-xs text-gray-400">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <strong className="text-primary">Fonts:</strong>
                  <p className="text-gray-300">{brandDNA.identity.fonts.join(', ')}</p>
                </div>
                <div>
                  <strong className="text-primary">Style:</strong>
                  <p className="text-gray-300">{brandDNA.identity.visualStyle}</p>
                </div>
              </div>
            </ResultCard>

            {/* Voice */}
            <ResultCard title="Brand Voice">
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-primary">Tone:</strong>
                  <p className="text-gray-300">{brandDNA.voice.tone.join(', ')}</p>
                </div>
                <div>
                  <strong className="text-primary">Keywords:</strong>
                  <p className="text-gray-300">{brandDNA.voice.keywords.join(', ')}</p>
                </div>
                <div>
                  <strong className="text-primary">Writing Style:</strong>
                  <p className="text-gray-300">{brandDNA.voice.writingStyle}</p>
                </div>
              </div>
            </ResultCard>

            {/* Market */}
            <ResultCard title="Market Position">
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-primary">Positioning:</strong>
                  <p className="text-gray-300">{brandDNA.market.positioning}</p>
                </div>
                <div>
                  <strong className="text-primary">Competitors:</strong>
                  <p className="text-gray-300">{brandDNA.market.competitors.join(', ')}</p>
                </div>
              </div>
            </ResultCard>

            {/* Audience */}
            <ResultCard title="Target Audience">
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-primary">Demographics:</strong>
                  <p className="text-gray-300">{brandDNA.audience.demographics}</p>
                </div>
                <div>
                  <strong className="text-primary">Psychographics:</strong>
                  <p className="text-gray-300">{brandDNA.audience.psychographics}</p>
                </div>
                <div>
                  <strong className="text-primary">Pain Points:</strong>
                  <p className="text-gray-300">{brandDNA.audience.painPoints.join(', ')}</p>
                </div>
              </div>
            </ResultCard>

            {/* Accessibility */}
            {a11yReport && (
              <ResultCard title={`Accessibility Score: ${a11yReport.score}/100`}>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">WCAG Level:</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      a11yReport.wcagLevel === 'AAA' ? 'bg-green-500/20 text-green-400' :
                      a11yReport.wcagLevel === 'AA' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {a11yReport.wcagLevel}
                    </span>
                  </div>
                  <div>
                    <strong className="text-primary">Recommendations:</strong>
                    <ul className="text-gray-300 mt-1 space-y-1">
                      {a11yReport.recommendations.slice(0, 3).map((rec: string, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span>▸</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ResultCard>
            )}
          </div>

          {/* Save Section */}
          <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Save as Portfolio Item</label>
              <input
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                placeholder="Brand name"
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
              />
            </div>

            <div className="flex gap-4 flex-wrap">
              <button
                onClick={handleSave}
                disabled={saving || !profileName}
                className="flex-1 px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Save to Portfolio
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="flex-1 px-6 py-2 border border-gray-700 hover:border-primary rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download JSON
              </button>

              {hasFeatureAccess(userTier, 'pdfExport') && (
                <button
                  onClick={() => exportToPDF(brandDNA, profileName)}
                  className="flex-1 px-6 py-2 border border-gray-700 hover:border-primary rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  Export PDF
                </button>
              )}
            </div>
          </div>

          {/* Start Over */}
          <button
            onClick={() => {
              setBrandDNA(null);
              setUrl('');
              setProfileName('');
            }}
            className="w-full px-6 py-2 border border-gray-700 hover:border-primary rounded-lg font-medium transition"
          >
            Extract Another Brand
          </button>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-4 text-primary">{title}</h3>
      {children}
    </div>
  );
}
