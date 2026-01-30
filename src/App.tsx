import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '$lib/supabase';
import { store } from '$lib/store';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Extract } from './pages/Extract';
import { Campaigns } from './pages/Campaigns';
import { Websites } from './pages/Websites';
import { Leads } from './pages/Leads';
import { Settings } from './pages/Settings';
import { Pricing } from './pages/Pricing';
import { VoiceAssistant } from './pages/VoiceAssistant';
import { Automations } from './pages/Automations';
import { AgentForge } from './pages/AgentForge';

function App() {
  useEffect(() => {
    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        store.setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.display_name,
          createdAt: session.user.created_at,
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        store.setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.display_name,
          createdAt: session.user.created_at,
        });
      } else {
        store.setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/extract" element={<Extract />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/websites" element={<Websites />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/voice" element={<VoiceAssistant />} />
          <Route path="/automations" element={<Automations />} />
          <Route path="/agents" element={<AgentForge />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
