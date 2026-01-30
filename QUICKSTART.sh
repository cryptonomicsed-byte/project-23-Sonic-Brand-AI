#!/bin/bash

echo "🚀 Sonic Brand AI - Quick Start Setup"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Update .env with your Supabase credentials:"
    echo "   1. Go to https://supabase.com and create a new project"
    echo "   2. Copy your Project URL to VITE_SUPABASE_URL"
    echo "   3. Copy your Anon Key to VITE_SUPABASE_ANON_KEY"
    echo "   4. Update .env file with these values"
else
    echo "✅ .env file already exists"
fi

# Run database migrations (commented out - requires manual setup)
echo ""
echo "🔧 Next Steps:"
echo "  1. Update .env with Supabase credentials"
echo "  2. Run: npm run dev (to start development server)"
echo "  3. Go to http://localhost:1111"
echo "  4. Create account and add API keys in Settings"
echo ""
echo "📚 For full setup guide, see SETUP.md and COMPLETE_GUIDE.md"
echo ""
echo "✨ Happy coding!"
