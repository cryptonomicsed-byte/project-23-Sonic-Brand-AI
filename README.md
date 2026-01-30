# Sonic Brand AI

A comprehensive SaaS platform for brand analysis, marketing automation, and AI-powered content generation.

## Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your Supabase credentials

# Start dev server
npm run dev
```

The app will open at http://localhost:1111

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth)
- **Styling:** Tailwind CSS + dark theme
- **Charts:** Recharts
- **HTTP:** Axios
- **Forms:** React Hook Form + Zod

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (routed)
├── lib/           # Utilities (API, store, constants)
├── types/         # TypeScript interfaces
├── App.tsx        # Router setup
└── main.tsx       # Entry point
```

## Features

### Free Tier
- Basic brand DNA extraction (3/month)
- Dashboard

### Pro Tier ($49/month)
- Unlimited extractions
- Campaign generation
- Website builder
- Lead hunter
- Scheduler

### Hunter Tier ($149/month)
- All Pro features
- Voice AI commands
- Automation workflows
- Agent Forge
- Live sessions

### Agency Tier (Custom)
- All Hunter features
- White label
- Team seats
- Priority support

## Environment Variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Build for Production

```bash
npm run build
npm run preview
```

Output is in `dist/`

## Next Steps

1. Set up Supabase project and get API credentials
2. Implement brand DNA extraction feature
3. Add LLM provider integration
4. Build campaign generation
5. Create website builder

See `FEATURE_CHECKLIST.md` for detailed implementation roadmap.
