import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '$lib/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Extractions', value: 12 },
  { name: 'Campaigns', value: 5 },
  { name: 'Websites', value: 3 },
  { name: 'Leads Found', value: 24 },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useStore();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.displayName || user.email}</h1>
        <p className="text-gray-400">Here's your brand activity overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Brand Profiles" value="2" />
        <StatCard label="Campaigns" value="5" />
        <StatCard label="Websites" value="3" />
        <StatCard label="Leads" value="24" />
      </div>

      {/* Chart */}
      <div className="bg-surface rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Activity Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <ActionCard
          title="Extract Brand DNA"
          description="Analyze a new brand"
          onClick={() => navigate('/extract')}
        />
        <ActionCard
          title="Create Campaign"
          description="Generate marketing assets"
          onClick={() => navigate('/campaigns')}
        />
        <ActionCard
          title="Find Leads"
          description="Hunt for potential clients"
          onClick={() => navigate('/leads')}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg border border-gray-700 p-4">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-surface hover:bg-surface/80 border border-gray-700 hover:border-primary rounded-lg p-6 text-left transition space-y-2"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </button>
  );
}
