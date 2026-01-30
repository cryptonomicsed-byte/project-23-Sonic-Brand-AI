import { BrandDNA } from '$types';
import { callLLM, getWebsitePrompt } from './llm-sdk';

export async function generateWebsite(brandDNA: BrandDNA, llmModel: string): Promise<string> {
  const prompt = getWebsitePrompt(brandDNA);

  const response = await callLLM({
    model: llmModel,
    prompt,
    temperature: 0.7,
    maxTokens: 4000,
  });

  // Extract HTML from response (handle markdown code blocks)
  let html = response.content;
  
  // Remove markdown code fence if present
  html = html.replace(/^```html\n?/, '').replace(/\n?```$/, '');
  html = html.replace(/^```\n?/, '').replace(/\n?```$/, '');

  // Ensure it starts with <!DOCTYPE
  if (!html.trim().toLowerCase().startsWith('<!doctype')) {
    html = `<!DOCTYPE html>\n${html}`;
  }

  return html;
}

// Website deployment (Netlify)
export async function deployToNetlify(htmlContent: string, siteName: string): Promise<string> {
  try {
    const netlifyToken = localStorage.getItem('netlify_token');
    if (!netlifyToken) {
      throw new Error('Netlify token not configured. Please add it in settings.');
    }

    // Create a zip of the HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });

    // Upload to Netlify
    const formData = new FormData();
    formData.append('file', blob, 'index.html');

    const response = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Deployment failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    throw new Error(
      `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Website templates (fallback if LLM fails)
const WEBSITE_TEMPLATE = (brandDNA: BrandDNA) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${brandDNA.core.mission}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #333;
      line-height: 1.6;
    }
    
    header {
      background: linear-gradient(135deg, ${brandDNA.identity.colors[0] || '#6366f1'}, ${brandDNA.identity.colors[1] || '#ec4899'});
      color: white;
      padding: 2rem 1rem;
      text-align: center;
    }
    
    header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    
    header p {
      font-size: 1.2rem;
      opacity: 0.9;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    section {
      margin: 3rem 0;
    }
    
    section h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: ${brandDNA.identity.colors[0] || '#6366f1'};
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }
    
    .feature-card {
      border: 1px solid #ddd;
      padding: 1.5rem;
      border-radius: 8px;
      transition: transform 0.3s;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    .feature-card h3 {
      margin-bottom: 0.5rem;
      color: ${brandDNA.identity.colors[0] || '#6366f1'};
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, ${brandDNA.identity.colors[0] || '#6366f1'}, ${brandDNA.identity.colors[1] || '#ec4899'});
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 1rem;
      transition: opacity 0.3s;
    }
    
    .cta-button:hover {
      opacity: 0.9;
    }
    
    footer {
      background: #f5f5f5;
      padding: 2rem 1rem;
      text-align: center;
      margin-top: 3rem;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <header>
    <h1>${brandDNA.core.mission}</h1>
    <p>${brandDNA.core.tagline}</p>
  </header>
  
  <div class="container">
    <section>
      <h2>About Us</h2>
      <p>${brandDNA.core.vision}</p>
    </section>
    
    <section>
      <h2>Our Values</h2>
      <div class="features">
        ${brandDNA.core.values.map(v => `<div class="feature-card"><h3>${v}</h3></div>`).join('')}
      </div>
    </section>
    
    <section>
      <h2>Our Positioning</h2>
      <p>${brandDNA.market.positioning}</p>
      <a href="#contact" class="cta-button">Get Started</a>
    </section>
    
    <section>
      <h2>Contact Us</h2>
      <p>Ready to work together? Let's talk!</p>
      <a href="mailto:hello@example.com" class="cta-button">Email Us</a>
    </section>
  </div>
  
  <footer>
    <p>&copy; 2024. All rights reserved.</p>
  </footer>
</body>
</html>`;

export function getWebsiteTemplate(brandDNA: BrandDNA): string {
  return WEBSITE_TEMPLATE(brandDNA);
}
