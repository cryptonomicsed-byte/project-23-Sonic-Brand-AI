import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '$lib/store';
import { supabase } from '$lib/supabase';

export function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background text-white">
      {/* Header */}
      <header className="border-b border-surface sticky top-0 z-50 bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Sonic Brand AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <Link to="/dashboard" className="text-sm hover:text-primary transition">
                  Dashboard
                </Link>
                <Link to="/extract" className="text-sm hover:text-primary transition">
                  Extract
                </Link>
                <Link to="/campaigns" className="text-sm hover:text-primary transition">
                  Campaigns
                </Link>
                <Link to="/websites" className="text-sm hover:text-primary transition">
                  Websites
                </Link>
                <Link to="/leads" className="text-sm hover:text-primary transition">
                  Leads
                </Link>
                <Link to="/voice" className="text-sm hover:text-primary transition">
                  Voice
                </Link>
                <Link to="/automations" className="text-sm hover:text-primary transition">
                  Automations
                </Link>
                <Link to="/agents" className="text-sm hover:text-primary transition">
                  Agents
                </Link>
                <Link to="/settings" className="text-sm hover:text-primary transition">
                  Settings
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-400">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-surface rounded-lg transition"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm hover:text-primary transition">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-surface rounded-lg transition"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && user && (
          <nav className="md:hidden border-t border-surface px-4 py-4 flex flex-col gap-4">
            <Link to="/dashboard" className="text-sm hover:text-primary transition">
              Dashboard
            </Link>
            <Link to="/extract" className="text-sm hover:text-primary transition">
              Extract
            </Link>
            <Link to="/campaigns" className="text-sm hover:text-primary transition">
              Campaigns
            </Link>
            <Link to="/websites" className="text-sm hover:text-primary transition">
              Websites
            </Link>
            <Link to="/leads" className="text-sm hover:text-primary transition">
              Leads
            </Link>
            <Link to="/voice" className="text-sm hover:text-primary transition">
              Voice
            </Link>
            <Link to="/automations" className="text-sm hover:text-primary transition">
              Automations
            </Link>
            <Link to="/agents" className="text-sm hover:text-primary transition">
              Agents
            </Link>
            <Link to="/settings" className="text-sm hover:text-primary transition">
              Settings
            </Link>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface mt-16 py-8 text-center text-sm text-gray-500">
        <p>&copy; 2024 Sonic Brand AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
