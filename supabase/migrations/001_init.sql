-- Brand Profiles
CREATE TABLE brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  brand_dna JSONB,
  is_public BOOLEAN DEFAULT false,
  public_slug TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brand_profiles NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT, -- 'social', 'email', 'ads', 'content'
  status TEXT DEFAULT 'draft',
  assets JSONB,
  scheduled_for TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Websites
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brand_profiles NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  url TEXT,
  html_content TEXT,
  deployment_status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT,
  website TEXT,
  contact_info JSONB,
  analysis JSONB,
  source TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Automations
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  provider TEXT, -- 'n8n', 'zapier', etc.
  workflow_config JSONB,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Settings
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  tier TEXT DEFAULT 'free', -- 'free', 'pro', 'hunter', 'agency'
  extractions_used INT DEFAULT 0,
  extractions_limit INT DEFAULT 3,
  preferences JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Affiliates
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  referral_code TEXT UNIQUE,
  conversions INT DEFAULT 0,
  earnings DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_websites_brand_id ON websites(brand_id);
CREATE INDEX idx_websites_user_id ON websites(user_id);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_automations_user_id ON automations(user_id);
CREATE INDEX idx_brand_profiles_public_slug ON brand_profiles(public_slug) WHERE is_public = true;

-- Row Level Security
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_profiles
CREATE POLICY "Users can view own brand profiles" ON brand_profiles
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own brand profiles" ON brand_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand profiles" ON brand_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand profiles" ON brand_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for websites
CREATE POLICY "Users can view own websites" ON websites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own websites" ON websites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own websites" ON websites
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own websites" ON websites
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for leads
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON leads
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON leads
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for automations
CREATE POLICY "Users can view own automations" ON automations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own automations" ON automations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own automations" ON automations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own automations" ON automations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for affiliates
CREATE POLICY "Users can view own affiliates" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own affiliates" ON affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own affiliates" ON affiliates
  FOR UPDATE USING (auth.uid() = user_id);
