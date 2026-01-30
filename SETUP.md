# Sonic Brand AI - Setup Guide

## 1. Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (https://supabase.com)

## 2. Supabase Setup

1. Create a new Supabase project
2. In the SQL Editor, run the migration from `supabase/migrations/001_init.sql`
3. Go to Project Settings > API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon Key → `VITE_SUPABASE_ANON_KEY`

## 3. Local Setup

```bash
# Clone/navigate to project
cd sonic-brand-ai

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add Supabase credentials to .env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key

# Start dev server
npm run dev
```

## 4. Enable Authentication in Supabase

1. Go to Authentication > Providers
2. Enable Email/Password provider
3. (Optional) Enable Google OAuth
4. Copy the redirect URL from your app

## 5. Verify Setup

- Home page loads at http://localhost:1111
- Try signing up with test email
- Dashboard should be accessible after login

## 6. Next: Build Features

See feature checklist for implementation order.
