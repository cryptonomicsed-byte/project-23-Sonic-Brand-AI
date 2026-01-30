export interface BrandDNA {
  core: {
    mission: string;
    vision: string;
    values: string[];
    tagline: string;
  };
  identity: {
    colors: string[];
    fonts: string[];
    logoUrl?: string;
    visualStyle: string;
  };
  voice: {
    tone: string[];
    keywords: string[];
    writingStyle: string;
  };
  audience: {
    demographics: string;
    psychographics: string;
    painPoints: string[];
  };
  market: {
    positioning: string;
    competitors: string[];
  };
}

export interface BrandProfile {
  id: string;
  userId: string;
  name: string;
  url?: string;
  brandDNA: BrandDNA;
  isPublic: boolean;
  publicSlug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  brandId: string;
  name: string;
  type: 'social' | 'email' | 'ads' | 'content';
  status: 'draft' | 'scheduled' | 'published';
  assets: Record<string, any>;
  scheduledFor?: string;
  createdAt: string;
}

export interface Website {
  id: string;
  brandId: string;
  userId: string;
  url?: string;
  htmlContent: string;
  deploymentStatus?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  userId: string;
  company: string;
  website: string;
  contacts: {
    name: string;
    email: string;
    role: string;
    linkedin?: string;
  }[];
  analysis: {
    industry: string;
    size: string;
    fitScore: number;
    painPoints: string[];
  };
  tags: string[];
  source: string;
  createdAt: string;
}

export interface Automation {
  id: string;
  userId: string;
  name: string;
  provider: 'n8n' | 'zapier';
  workflowConfig: Record<string, any>;
  isActive: boolean;
  createdAt: string;
}
