import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Brain, Globe } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Brand DNA Extraction
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock your brand's core identity, generate unlimited marketing assets, and build AI-powered websites in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/extract"
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Start Extracting <ArrowRight size={20} />
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-3 border border-surface hover:border-primary rounded-lg font-medium transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 gap-8">
        <FeatureCard
          icon={<Brain size={24} />}
          title="Brand DNA Extraction"
          description="AI-powered analysis of your brand's mission, vision, values, voice, and visual identity."
        />
        <FeatureCard
          icon={<Sparkles size={24} />}
          title="Campaign Generation"
          description="Create unlimited marketing assets for social media, email, ads, and content."
        />
        <FeatureCard
          icon={<Globe size={24} />}
          title="Website Builder"
          description="Generate and deploy beautiful websites instantly with AI."
        />
        <FeatureCard
          icon={<Zap size={24} />}
          title="Voice Commands"
          description="Control everything with natural language voice commands."
        />
      </section>

      {/* CTA */}
      <section className="py-16 text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-surface">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Brand?</h2>
        <p className="text-gray-300 mb-6">Start with a free extraction and discover your brand's DNA.</p>
        <Link
          to="/signup"
          className="inline-block px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 transition"
        >
          Get Started Free
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-surface hover:border-primary/50 bg-surface/50 hover:bg-surface/80 transition space-y-3">
      <div className="text-primary">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
