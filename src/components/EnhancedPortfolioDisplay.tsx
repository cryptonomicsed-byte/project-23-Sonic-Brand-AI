import React from 'react';
import { Zap, TrendingUp, Users, Target, MessageSquare, Palette } from 'lucide-react';

interface EnhancedPortfolioDisplayProps {
  dna: any;
}

export function EnhancedPortfolioDisplay({ dna }: EnhancedPortfolioDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Core Identity Enhanced */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="text-primary" size={20} />
          <h2 className="text-xl font-bold">Brand Core</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <Label>Mission</Label>
            <p className="text-gray-300">{dna.core.mission}</p>
          </Card>
          
          <Card>
            <Label>Vision</Label>
            <p className="text-gray-300">{dna.core.vision}</p>
          </Card>
          
          <Card>
            <Label>Purpose</Label>
            <p className="text-gray-300">{dna.core.purpose}</p>
          </Card>
          
          <Card>
            <Label>Brand Promise</Label>
            <p className="text-gray-300">{dna.core.promise}</p>
          </Card>
          
          <Card>
            <Label>Tagline</Label>
            <p className="text-lg font-semibold text-primary">{dna.core.tagline}</p>
          </Card>
          
          <Card>
            <Label>Core Values</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {dna.core.values?.map((value: string) => (
                <span key={value} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                  {value}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Visual Identity Enhanced */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="text-primary" size={20} />
          <h2 className="text-xl font-bold">Visual Identity</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Colors with Psychology */}
          <Card>
            <Label>Color Palette</Label>
            <div className="space-y-3 mt-2">
              {dna.identity.colors?.map((color: any) => (
                <div key={color.hex} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded border-2 border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-sm">
                    <p className="font-medium">{color.name}</p>
                    <p className="text-gray-400">{color.hex}</p>
                    {color.psychology && (
                      <p className="text-gray-500 text-xs italic mt-1">{color.psychology}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Fonts with Personality */}
          <Card>
            <Label>Typography</Label>
            <div className="space-y-2 mt-2">
              {dna.identity.fonts?.map((font: any) => (
                <div key={font.family} className="text-sm">
                  <p className="font-medium">{font.family}</p>
                  {font.personality && (
                    <p className="text-gray-400">{font.personality}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
          
          <Card>
            <Label>Visual Style</Label>
            <p className="text-gray-300">{dna.identity.visualStyle}</p>
          </Card>
          
          <Card>
            <Label>Design Language</Label>
            <p className="text-gray-300">{dna.identity.designLanguage}</p>
          </Card>
        </div>
      </section>

      {/* Brand Voice Enhanced */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-primary" size={20} />
          <h2 className="text-xl font-bold">Brand Voice</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <Label>Tone & Personality</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {dna.voice.tone?.map((t: string) => (
                <span key={t} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                  {t}
                </span>
              ))}
            </div>
          </Card>
          
          <Card>
            <Label>Brand Archetypes</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {dna.voice.archetypes?.map((arch: string) => (
                <span key={arch} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                  {arch}
                </span>
              ))}
            </div>
          </Card>
          
          <Card>
            <Label>Core Message</Label>
            <p className="text-gray-300 text-sm mt-2">{dna.voice.coreMessage}</p>
          </Card>
          
          <Card>
            <Label>Writing Style</Label>
            <p className="text-gray-300">{dna.voice.writingStyle}</p>
          </Card>
          
          <Card className="md:col-span-2">
            <Label>Key Keywords</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {dna.voice.keywords?.slice(0, 8).map((kw: string) => (
                <span key={kw} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                  {kw}
                </span>
              ))}
            </div>
          </Card>

          {dna.voice.moodBoard && dna.voice.moodBoard.length > 0 && (
            <Card className="md:col-span-2">
              <Label>Emotional Mood Board</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {dna.voice.moodBoard.map((mood: string) => (
                  <span key={mood} className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded">
                    {mood}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Audience Intelligence */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="text-primary" size={20} />
          <h2 className="text-xl font-bold">Target Audience</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <Label>Demographics</Label>
            <p className="text-gray-300">{dna.audience.demographics}</p>
          </Card>
          
          <Card>
            <Label>Psychographics</Label>
            <p className="text-gray-300">{dna.audience.psychographics}</p>
          </Card>
          
          {dna.audience.desires && dna.audience.desires.length > 0 && (
            <Card>
              <Label>Customer Desires</Label>
              <ul className="space-y-1 mt-2">
                {dna.audience.desires.map((desire: string) => (
                  <li key={desire} className="text-gray-300 text-sm flex items-center gap-2">
                    <span>▸</span> {desire}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          
          <Card>
            <Label>Pain Points</Label>
            <ul className="space-y-1 mt-2">
              {dna.audience.painPoints?.map((pain: string) => (
                <li key={pain} className="text-gray-300 text-sm flex items-center gap-2">
                  <span>▸</span> {pain}
                </li>
              ))}
            </ul>
          </Card>
          
          {dna.audience.personas && dna.audience.personas.length > 0 && (
            <Card className="md:col-span-2">
              <Label>User Personas</Label>
              <div className="space-y-3 mt-2">
                {dna.audience.personas.map((persona: any, idx: number) => (
                  <div key={idx} className="p-2 bg-gray-800/50 rounded">
                    <p className="font-medium text-primary">{persona.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{persona.description}</p>
                    {persona.goals && persona.goals.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {persona.goals.map((goal: string) => (
                          <span key={goal} className="text-xs bg-primary/20 text-primary px-1 py-0.5 rounded">
                            {goal}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Market Position Enhanced */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="text-primary" size={20} />
          <h2 className="text-xl font-bold">Market Position</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <Label>Market Positioning</Label>
            <p className="text-gray-300">{dna.market.positioning}</p>
          </Card>
          
          <Card>
            <Label>Competitors</Label>
            <div className="space-y-1 mt-2">
              {dna.market.competitors?.map((comp: string) => (
                <p key={comp} className="text-gray-300 text-sm flex items-center gap-2">
                  <span>▸</span> {comp}
                </p>
              ))}
            </div>
          </Card>
          
          {dna.market.differentiation && dna.market.differentiation.length > 0 && (
            <Card>
              <Label>Key Differentiators</Label>
              <div className="space-y-1 mt-2">
                {dna.market.differentiation.map((diff: string) => (
                  <p key={diff} className="text-gray-300 text-sm flex items-center gap-2">
                    <span className="text-green-500">✓</span> {diff}
                  </p>
                ))}
              </div>
            </Card>
          )}
          
          {dna.market.marketSize && (
            <Card>
              <Label>Market Opportunity</Label>
              <p className="text-gray-300">{dna.market.marketSize}</p>
            </Card>
          )}
          
          {dna.market.opportunities && dna.market.opportunities.length > 0 && (
            <Card className="md:col-span-2">
              <Label>Growth Opportunities</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {dna.market.opportunities.map((opp: string) => (
                  <span key={opp} className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded">
                    {opp}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Content Strategy */}
      {dna.contentStrategy && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} />
            <h2 className="text-xl font-bold">Content Strategy</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <Label>Main Themes</Label>
              <div className="space-y-1 mt-2">
                {dna.contentStrategy.mainThemes?.slice(0, 5).map((theme: string) => (
                  <p key={theme} className="text-gray-300 text-sm">{theme}</p>
                ))}
              </div>
            </Card>
            
            <Card>
              <Label>Content Tone</Label>
              <p className="text-gray-300">{dna.contentStrategy.contentTone}</p>
            </Card>
            
            {dna.contentStrategy.callToActions && dna.contentStrategy.callToActions.length > 0 && (
              <Card className="md:col-span-2">
                <Label>Key Call-to-Actions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dna.contentStrategy.callToActions.map((cta: string) => (
                    <span key={cta} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded">
                      {cta}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Confidence Scores */}
      {dna.confidence && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold">Analysis Confidence</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <ConfidenceBar label="Visual" value={dna.confidence.visual} />
            <ConfidenceBar label="Positioning" value={dna.confidence.positioning} />
            <ConfidenceBar label="Tone" value={dna.confidence.tone} />
            <ConfidenceBar label="Overall" value={dna.confidence.overall} />
          </div>
        </section>
      )}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface border border-gray-700 rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-primary font-semibold text-sm">{children}</p>;
}

function ConfidenceBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface border border-gray-700 rounded-lg p-4">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <div className="flex-1 h-8 bg-gray-800 rounded overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-lg font-bold text-primary min-w-[2rem]">{value}</span>
      </div>
    </div>
  );
}
