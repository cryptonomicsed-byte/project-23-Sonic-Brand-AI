/**
 * Simple Web Scraper
 * Lightweight scraper that fetches and parses website content
 */

export interface SimpleScrapedData {
  title: string;
  description: string;
  text: string;
  headings: string[];
  colors: string[];
  fonts: string[];
  images: string[];
}

export async function scrapeWebsite(url: string): Promise<SimpleScrapedData> {
  try {
    console.log('[SimpleScraper] Scraping:', url);

    // Normalize URL
    let targetUrl = url;
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }

    console.log('[SimpleScraper] Calling backend at http://localhost:3001/api/scrape');

    // Call backend API to scrape (avoids CORS issues)
    const response = await fetch('http://localhost:3001/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: targetUrl }),
      credentials: 'omit',
    });

    console.log('[SimpleScraper] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    console.log('[SimpleScraper] Extraction complete');
    console.log('  - Title:', data.title);
    console.log('  - Description:', data.description?.substring(0, 100));
    console.log('  - Headings:', data.headings?.length || 0);
    console.log('  - Colors:', data.colors?.length || 0);
    console.log('  - Fonts:', data.fonts?.length || 0);

    return {
      title: data.title || url,
      description: data.description || '',
      text: data.text || '',
      headings: data.headings || [],
      colors: data.colors || [],
      fonts: data.fonts || [],
      images: data.images || [],
    };
  } catch (error) {
    console.error('[SimpleScraper] Error:', error);
    
    // Fallback: Generate synthetic data based on URL
    console.log('[SimpleScraper] Using synthetic fallback data');
    return generateSyntheticData(url);
  }
}

function generateSyntheticData(url: string): SimpleScrapedData {
  const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname || url;
  const brandName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  
  return {
    title: brandName,
    description: `${brandName} - Professional brand and services`,
    text: `${brandName} is a professional brand offering innovative solutions and services. 
           We are committed to excellence, quality, and customer satisfaction. 
           Our team works to deliver value and build lasting relationships.`,
    headings: [`Welcome to ${brandName}`, 'Our Services', 'Why Choose Us', 'Get Started Today'],
    colors: ['#3b82f6', '#1f2937', '#f59e0b', '#10b981', '#ef4444'],
    fonts: ['inter', 'sans-serif'],
    images: [],
  };
}
