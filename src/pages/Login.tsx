import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '$lib/supabase';
import { store } from '$lib/store';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;

  const handleDevLogin = () => {
    // Dev mode: bypass auth
    store.setUser({
      id: 'dev-user-' + Date.now(),
      email: 'dev@sonic.ai',
      displayName: 'Dev User',
      createdAt: new Date().toISOString(),
    });
    navigate('/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        store.setUser({
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.user_metadata?.display_name,
          createdAt: data.user.created_at,
        });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your Sonic Brand AI account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {isDev && (
            <button
              onClick={handleDevLogin}
              className="w-full px-4 py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Dev Mode: Skip Auth
            </button>
          )}

          <div className="text-center text-sm">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <a href="/signup" className="text-primary hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
