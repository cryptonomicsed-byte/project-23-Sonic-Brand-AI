import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Download, Share2, Trash2 } from 'lucide-react';
import { supabase } from '$lib/supabase';
import { useStore } from '$lib/store';
import { BrandDNA, Campaign } from '$types';
import { generateCampaignAssets, CampaignAssets } from '$lib/campaign-generation';

export function Campaigns() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [brands, setBrands] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // Wizard state
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [campaignName, setCampaignName] = useState('');
  const [objective, setObjective] = useState('');
  const [channels, setChannels] = useState<string[]>(['social']);
  const [generating, setGenerating] = useState(false);
  const [campaignAssets, setCampaignAssets] = useState<CampaignAssets | null>(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    loadBrandsAndCampaigns();
  }, [user]);

  const loadBrandsAndCampaigns = async () => {
    setLoading(true);
    try {
      const [brandsRes, campaignsRes] = await Promise.all([
        supabase.from('brand_profiles').select('*').eq('user_id', user.id),
        supabase.from('campaigns').select('*').eq('user_id', user.id),
      ]);

      if (brandsRes.data) setBrands(brandsRes.data);
      if (campaignsRes.data) setCampaigns(campaignsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCampaign = async () => {
    if (!selectedBrand || !campaignName || !objective) {
      alert('Please fill in all fields');
      return;
    }

    setGenerating(true);
    try {
      const brand = brands.find(b => b.id === selectedBrand);
      const assets = await generateCampaignAssets(
        brand.brand_dna,
        objective,
        channels,
        'gpt-4-turbo' // From settings
      );

      // Save campaign
      const { data } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          brand_id: selectedBrand,
          name: campaignName,
          type: channels[0],
          status: 'draft',
          assets,
        })
        .select()
        .single();

      if (data) {
        setCampaignAssets(assets);
        // Reset wizard
        setCampaignName('');
        setObjective('');
        setChannels(['social']);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (assets: CampaignAssets) => {
    const json = JSON.stringify(assets, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaign-assets.json';
    a.click();
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await supabase.from('campaigns').delete().eq('id', campaignId);
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campaign Generator</h1>
          <p className="text-gray-400">Create unlimited marketing assets for any channel</p>
        </div>
        <button
          onClick={() => setShowWizard(!showWizard)}
          className="px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 transition"
        >
          {showWizard ? 'Cancel' : 'New Campaign'}
        </button>
      </div>

      {showWizard ? (
        <CampaignWizard
          brands={brands}
          selectedBrand={selectedBrand}
          campaignName={campaignName}
          objective={objective}
          channels={channels}
          generating={generating}
          onBrandChange={setSelectedBrand}
          onNameChange={setCampaignName}
          onObjectiveChange={setObjective}
          onChannelsChange={setChannels}
          onGenerate={handleGenerateCampaign}
        />
      ) : campaignAssets ? (
        <CampaignResults
          assets={campaignAssets}
          onDownload={() => handleDownload(campaignAssets)}
          onBack={() => {
            setCampaignAssets(null);
            loadBrandsAndCampaigns();
          }}
        />
      ) : (
        <CampaignsList
          campaigns={campaigns}
          brands={brands}
          loading={loading}
          onDelete={handleDelete}
          onRefresh={loadBrandsAndCampaigns}
        />
      )}
    </div>
  );
}

function CampaignWizard({
  brands,
  selectedBrand,
  campaignName,
  objective,
  channels,
  generating,
  onBrandChange,
  onNameChange,
  onObjectiveChange,
  onChannelsChange,
  onGenerate,
}: any) {
  const channelOptions = ['social', 'email', 'ads', 'content'];

  return (
    <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Select Brand</label>
        <select
          value={selectedBrand}
          onChange={e => onBrandChange(e.target.value)}
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

      <div>
        <label className="block text-sm font-medium mb-2">Campaign Name</label>
        <input
          type="text"
          value={campaignName}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g., Q1 Product Launch"
          className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Campaign Objective</label>
        <textarea
          value={objective}
          onChange={e => onObjectiveChange(e.target.value)}
          placeholder="What should this campaign achieve? (e.g., Increase brand awareness, Drive signups, Announce new feature)"
          className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition h-24"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Select Channels</label>
        <div className="grid grid-cols-2 gap-2">
          {channelOptions.map(ch => (
            <label key={ch} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channels.includes(ch)}
                onChange={e => {
                  if (e.target.checked) {
                    onChannelsChange([...channels, ch]);
                  } else {
                    onChannelsChange(channels.filter((c: string) => c !== ch));
                  }
                }}
                className="w-4 h-4 rounded border-gray-600 text-primary"
              />
              <span className="capitalize text-sm">{ch}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={generating || !selectedBrand || !campaignName || !objective || channels.length === 0}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader className="animate-spin" size={20} />
            Generating Assets...
          </>
        ) : (
          'Generate Campaign Assets'
        )}
      </button>
    </div>
  );
}

function CampaignResults({
  assets,
  onDownload,
  onBack,
}: {
  assets: CampaignAssets;
  onDownload: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-700 hover:border-primary rounded-lg font-medium transition"
        >
          Back
        </button>
        <button
          onClick={onDownload}
          className="px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Download size={18} />
          Download All Assets
        </button>
      </div>

      {/* Social Content */}
      {assets.social.posts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Social Media Posts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {assets.social.posts.map((post, i) => (
              <div key={i} className="bg-surface border border-gray-700 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-secondary uppercase">{post.platform}</p>
                <p className="text-sm">{post.content}</p>
                <p className="text-xs text-gray-400">CTA: {post.callToAction}</p>
                <p className="text-xs text-accent">{post.hashtags.join(' ')}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Email */}
      {assets.email.subject && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Email Campaign</h2>
          <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase">Subject Line</p>
              <p className="font-semibold">{assets.email.subject}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Body</p>
              <p className="text-sm whitespace-pre-wrap">{assets.email.body.slice(0, 500)}...</p>
            </div>
            <div>
              <span className="inline-block px-3 py-1 bg-primary text-sm rounded">
                {assets.email.cta}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Ads */}
      {assets.ads.copy.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Ad Copy</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {assets.ads.copy.map((ad, i) => (
              <div key={i} className="bg-surface border border-gray-700 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">{ad.headline}</h3>
                <p className="text-sm text-gray-300">{ad.body}</p>
                <span className="inline-block px-2 py-1 bg-accent/20 text-accent text-xs rounded">
                  {ad.cta}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content */}
      {assets.content.blogPosts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Content Assets</h2>
          {assets.content.blogPosts.map((post, i) => (
            <div key={i} className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-1">{post.title}</h3>
                <p className="text-sm text-gray-400">{post.subtitle}</p>
              </div>
              <p className="text-sm text-gray-300 line-clamp-4">{post.content}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function CampaignsList({
  campaigns,
  brands,
  loading,
  onDelete,
  onRefresh,
}: {
  campaigns: Campaign[];
  brands: any[];
  loading: boolean;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}) {
  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading campaigns...</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No campaigns yet. Create your first campaign to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {campaigns.map(campaign => {
        const brand = brands.find(b => b.id === campaign.brand_id);
        return (
          <div key={campaign.id} className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-bold text-lg">{campaign.name}</h3>
              <p className="text-sm text-gray-400">{brand?.name}</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                {campaign.type}
              </span>
              <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded">
                {campaign.status}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 border border-gray-700 hover:border-primary rounded text-sm transition flex items-center justify-center gap-1">
                <Share2 size={16} />
                View
              </button>
              <button
                onClick={() => onDelete(campaign.id)}
                className="px-3 py-2 border border-red-500/30 hover:border-red-500 text-red-400 rounded text-sm transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
