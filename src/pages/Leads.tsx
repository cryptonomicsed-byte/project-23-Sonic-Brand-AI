import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Download, Filter, Trash2 } from 'lucide-react';
import { supabase } from '$lib/supabase';
import { useStore } from '$lib/store';

export function Leads() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Search criteria
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [location, setLocation] = useState('');
  const [revenue, setRevenue] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSearch = async () => {
    setSearching(true);
    try {
      // This would integrate with Apollo.io, Hunter.io, or similar APIs
      // For now, we'll use a placeholder
      alert('Lead hunting requires API integration with Apollo.io or Hunter.io\nAdd API keys in Settings');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await supabase.from('leads').delete().eq('id', leadId);
      setLeads(leads.filter(l => l.id !== leadId));
    } catch {
      alert('Delete failed');
    }
  };

  const handleDownloadCSV = () => {
    if (leads.length === 0) {
      alert('No leads to download');
      return;
    }

    const headers = ['Company', 'Website', 'Contact', 'Email', 'Industry', 'Size', 'Fit Score'];
    const rows = leads.map(l => [
      l.company_name,
      l.website,
      l.contact_info?.name || '',
      l.contact_info?.email || '',
      l.analysis?.industry || '',
      l.analysis?.size || '',
      l.analysis?.fitScore || '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Lead Hunter</h1>
        <p className="text-gray-400">Find qualified prospects with contact information</p>
      </div>

      {/* Search Form */}
      <div className="bg-surface border border-gray-700 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold">Search Criteria</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="e.g., SaaS, E-commerce, Finance"
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company Size</label>
            <select
              value={companySize}
              onChange={e => setCompanySize(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
            >
              <option value="">Any</option>
              <option value="startup">Startup (1-10)</option>
              <option value="smb">Small (10-50)</option>
              <option value="mid">Mid-market (50-500)</option>
              <option value="enterprise">Enterprise (500+)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g., United States, EU"
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Annual Revenue</label>
            <input
              type="text"
              value={revenue}
              onChange={e => setRevenue(e.target.value)}
              placeholder="e.g., $1M-$10M"
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={searching || (!industry && !companySize && !location)}
          className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {searching ? (
            <>
              <Loader className="animate-spin" size={20} />
              Searching Leads...
            </>
          ) : (
            'Search Leads'
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Note: Requires Apollo.io, Hunter.io, or Clearbit API keys configured in Settings
        </p>
      </div>

      {/* Results */}
      {leads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Found {leads.length} Leads</h2>
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 border border-gray-700 hover:border-primary rounded-lg font-medium transition flex items-center gap-2"
            >
              <Download size={18} />
              Export to CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3 font-medium">Company</th>
                  <th className="text-left p-3 font-medium">Contact</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Industry</th>
                  <th className="text-left p-3 font-medium">Size</th>
                  <th className="text-left p-3 font-medium">Fit Score</th>
                  <th className="text-left p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b border-gray-700 hover:bg-surface/50">
                    <td className="p-3 font-medium">{lead.company_name}</td>
                    <td className="p-3 text-sm">{lead.contact_info?.name}</td>
                    <td className="p-3 text-sm text-primary">{lead.contact_info?.email}</td>
                    <td className="p-3 text-sm">{lead.analysis?.industry}</td>
                    <td className="p-3 text-sm">{lead.analysis?.size}</td>
                    <td className="p-3">
                      <div
                        className="px-2 py-1 rounded text-sm font-medium text-center"
                        style={{
                          backgroundColor: `rgba(99, 102, 241, ${(lead.analysis?.fitScore || 0) / 100})`,
                          color:
                            (lead.analysis?.fitScore || 0) > 60 ? '#fff' : 'inherit',
                        }}
                      >
                        {lead.analysis?.fitScore || 0}%
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-1 hover:bg-red-500/20 rounded text-red-400 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!searching && leads.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No leads found. Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}
