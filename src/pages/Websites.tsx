import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Download, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '$lib/supabase';
import { useStore } from '$lib/store';
import { generateWebsite, getWebsiteTemplate, deployToNetlify } from '$lib/website-builder';

export function Websites() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [brands, setBrands] = useState<any[]>([]);
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [generating, setGenerating] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string | null>(null);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    loadBrands();
  }, [user]);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id);
      if (data) setBrands(data);

      const { data: sites } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id);
      if (sites) setWebsites(sites);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWebsite = async () => {
    if (!selectedBrand) {
      alert('Please select a brand');
      return;
    }

    setGenerating(true);
    try {
      const brand = brands.find(b => b.id === selectedBrand);
      let html: string;

      // Try LLM first, fall back to template
      try {
        html = await generateWebsite(brand.brand_dna, 'gpt-4-turbo');
      } catch {
        html = getWebsiteTemplate(brand.brand_dna);
      }

      setPreviewHTML(html);
      setDeploymentUrl(null);

      // Save to database
      await supabase.from('websites').insert({
        user_id: user.id,
        brand_id: selectedBrand,
        html_content: html,
        deployment_status: 'draft',
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeployWebsite = async () => {
    if (!previewHTML) return;

    setDeploying(true);
    try {
      const url = await deployToNetlify(previewHTML, 'sonic-brand');
      setDeploymentUrl(url);

      // Update database
      const { data: site } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (site) {
        await supabase
          .from('websites')
          .update({ url, deployment_status: 'published' })
          .eq('id', site.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const handleDownloadHTML = () => {
    if (!previewHTML) return;
    const blob = new Blob([previewHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    a.click();
  };

  const handleCopyHTML = () => {
    if (!previewHTML) return;
    navigator.clipboard.writeText(previewHTML);
    alert('HTML copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Website Builder</h1>
        <p className="text-gray-400">Generate and deploy beautiful websites instantly</p>
      </div>

      {!previewHTML ? (
        <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Brand</label>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
            >
              <option value="">Choose a brand...</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateWebsite}
            disabled={generating || !selectedBrand}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader className="animate-spin" size={20} />
                Generating Website...
              </>
            ) : (
              'Generate Website'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-surface border border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-900 p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Website Preview</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyHTML}
                  className="p-2 hover:bg-gray-800 rounded transition"
                  title="Copy HTML"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={handleDownloadHTML}
                  className="p-2 hover:bg-gray-800 rounded transition"
                  title="Download HTML"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
            <iframe
              srcDoc={previewHTML}
              className="w-full h-96 border-0"
              title="Website Preview"
            />
          </div>

          {/* Deployment */}
          {!deploymentUrl ? (
            <button
              onClick={handleDeployWebsite}
              disabled={deploying}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {deploying ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Deploying...
                </>
              ) : (
                'Deploy to Netlify'
              )}
            </button>
          ) : (
            <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 space-y-2">
              <p className="text-green-400 font-medium">Website Deployed Successfully!</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">{deploymentUrl}</span>
                <a
                  href={deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-green-500/20 rounded transition"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setPreviewHTML(null);
                setDeploymentUrl(null);
                loadBrands();
              }}
              className="flex-1 px-6 py-2 border border-gray-700 hover:border-primary rounded-lg font-medium transition"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}

      {/* Existing Websites */}
      {websites.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Your Websites</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {websites.map(site => (
              <div key={site.id} className="bg-surface border border-gray-700 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Status: {site.deployment_status}</p>
                  {site.url && (
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-1 mt-1"
                    >
                      {site.url}
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                <button
                  onClick={async () => {
                    await supabase.from('websites').delete().eq('id', site.id);
                    loadBrands();
                  }}
                  className="px-3 py-1 border border-red-500/30 hover:border-red-500 text-red-400 rounded text-sm transition flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
