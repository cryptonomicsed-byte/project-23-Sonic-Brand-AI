import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '$lib/supabase';
import { store } from '$lib/store';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        // Create user settings
        await supabase.from('user_settings').insert({
          user_id: data.user.id,
          tier: 'free',
          extractions_used: 0,
          extractions_limit: 3,
        });

        store.setUser({
          id: data.user.id,
          email: data.user.email || '',
          displayName: displayName,
          createdAt: data.user.created_at,
        });

        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Join Sonic Brand AI</h1>
            <p className="text-gray-400">Create your account to get started</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center text-sm">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
