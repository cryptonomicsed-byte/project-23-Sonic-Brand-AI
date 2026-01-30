import { useState, useCallback } from 'react';
import { User, UserSettings, APIKeys, Tier } from '$types';

// Global state management (using React hooks)
let globalUser: User | null = null;
let globalSettings: UserSettings | null = null;
let globalApiKeys: APIKeys | null = null;

const listeners = new Set<() => void>();

const notify = () => listeners.forEach(fn => fn());

export const store = {
  getUser: () => globalUser,
  setUser: (user: User | null) => {
    globalUser = user;
    notify();
  },
  
  getSettings: () => globalSettings,
  setSettings: (settings: UserSettings | null) => {
    globalSettings = settings;
    if (settings) {
      // Persist settings to localStorage
      localStorage.setItem('user_settings', JSON.stringify(settings));
    } else {
      localStorage.removeItem('user_settings');
    }
    notify();
  },
  
  loadSettingsFromStorage: () => {
    const stored = localStorage.getItem('user_settings');
    if (stored) {
      try {
        globalSettings = JSON.parse(stored);
        return globalSettings;
      } catch {
        return null;
      }
    }
    return null;
  },
  
  getApiKeys: () => globalApiKeys,
  setApiKeys: (keys: APIKeys | null) => {
    globalApiKeys = keys;
    if (keys) {
      // Encrypt and store in localStorage
      const encrypted = btoa(JSON.stringify(keys));
      localStorage.setItem('api_keys', encrypted);
    } else {
      localStorage.removeItem('api_keys');
    }
    notify();
  },
  
  loadApiKeysFromStorage: () => {
    const encrypted = localStorage.getItem('api_keys');
    if (encrypted) {
      try {
        globalApiKeys = JSON.parse(atob(encrypted));
        return globalApiKeys;
      } catch {
        return null;
      }
    }
    return null;
  },
  
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useStore() {
  const [, setUpdate] = useState({});
  
  useCallback(() => {
    const unsubscribe = store.subscribe(() => setUpdate({}));
    return unsubscribe;
  }, []);

  return {
    user: store.getUser(),
    settings: store.getSettings(),
    apiKeys: store.getApiKeys(),
    setUser: store.setUser,
    setSettings: store.setSettings,
    setApiKeys: store.setApiKeys,
    loadApiKeys: store.loadApiKeysFromStorage,
    loadSettings: store.loadSettingsFromStorage,
  };
}
