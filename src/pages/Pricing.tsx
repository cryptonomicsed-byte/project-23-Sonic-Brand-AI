import React from 'react';
import { Check } from 'lucide-react';
import { TIER_NAMES, TIER_PRICES, TIER_DESCRIPTIONS, TIER_BADGES, TIER_LIMITS } from '$lib/tiers';
import { useNavigate } from 'react-router-dom';

export function Pricing() {
  const navigate = useNavigate();

  const tiers = ['free', 'pro', 'hunter', 'agency'] as const;

  const plans = tiers.map(tier => {
    const name = TIER_NAMES[tier];
    const price = TIER_PRICES[tier];
    const description = TIER_DESCRIPTIONS[tier];
    const badge = TIER_BADGES[tier];
    const limits = TIER_LIMITS[tier];

    const featureList = [
      limits.extractionsPerMonth === 'unlimited' ? 'Unlimited extractions' : `${limits.extractionsPerMonth} extractions/month`,
      limits.campaignGeneration && 'Campaign generation',
      limits.websiteBuilder && 'Website builder',
      limits.voiceCommands && 'Voice commands (Sonic Co-Pilot)',
      limits.automation && 'Workflow automation',
      limits.videoGeneration && 'AI video generation',
      limits.pdfExport && 'PDF export',
      `${typeof limits.teamMembers === 'number' ? limits.teamMembers : '∞'} team members`,
      `${limits.support} support`,
      limits.whiteLabel && 'White label'
    ].filter(Boolean) as string[];

    return {
      name,
      description,
      price,
      period: tier === 'free' ? 'forever' : tier === 'agency' ? 'custom' : 'month',
      features: featureList,
      cta: tier === 'free' ? 'Get Started' : tier === 'agency' ? 'Contact Sales' : `Upgrade to ${name}`,
      ctaVariant: tier === 'pro' || tier === 'hunter' ? 'primary' : 'secondary',
      popular: tier === 'pro',
      badge,
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Start free, upgrade when you need powerful features. No hidden fees.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={`relative rounded-lg border p-6 flex flex-col ${
              plan.popular
                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                : 'border-gray-700 bg-surface/50'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
              </div>

              <div className="space-y-1">
                {plan.price !== null ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      {plan.period !== 'forever' && (
                        <span className="text-gray-400">/{plan.period}</span>
                      )}
                    </div>
                    {plan.period === 'forever' && (
                      <p className="text-sm text-gray-400">No credit card required</p>
                    )}
                  </>
                ) : (
                  <p className="text-2xl font-bold text-primary">Custom pricing</p>
                )}
              </div>

              <div className="space-y-3">
                {plan.features.map(feature => (
                  <div key={feature} className="flex gap-2 items-start">
                    <Check size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (plan.name === 'Free') {
                  navigate('/signup');
                } else if (plan.name === 'Agency') {
                  window.location.href = 'mailto:sales@sonicbrandai.com';
                } else {
                  navigate('/signup');
                }
              }}
              className={`mt-6 w-full py-2 px-4 rounded-lg font-medium transition ${
                plan.ctaVariant === 'primary'
                  ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                  : 'border border-gray-700 hover:border-primary'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              q: 'Can I upgrade or downgrade anytime?',
              a: 'Yes, you can change your plan at any time. Changes take effect immediately.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards, PayPal, and ACH transfers for enterprise plans.',
            },
            {
              q: 'Is there a free trial for paid plans?',
              a: 'Start with our free tier and upgrade whenever you\'re ready. No trial period needed.',
            },
            {
              q: 'Do you offer discounts for annual billing?',
              a: 'Yes, save 20% when you choose annual billing on Pro and Hunter plans.',
            },
            {
              q: 'What if I need custom features?',
              a: 'Contact our sales team for custom enterprise solutions tailored to your needs.',
            },
            {
              q: 'Is there a money-back guarantee?',
              a: '30-day money-back guarantee on Pro and Hunter plans. No questions asked.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-surface border border-gray-700 rounded-lg p-6 space-y-2">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="text-sm text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-12 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl space-y-4">
        <h2 className="text-3xl font-bold">Ready to transform your brand?</h2>
        <p className="text-gray-400">Start with free brand DNA extraction today.</p>
        <button
          onClick={() => navigate('/signup')}
          className="inline-block px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-medium hover:opacity-90 transition"
        >
          Get Started Free
        </button>
      </div>
    </div>
  );
}
