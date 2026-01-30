/**
 * Simple Express server for handling scraping requests
 * Runs alongside Vite dev server
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/**
 * POST /api/scrape
 * Body: { url: string }
 * Returns: { title, description, text, headings, colors, fonts, images }
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('[Server] Scraping:', url);

    // Add https if missing
    let targetUrl = url;
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }

    console.log('[Server] Target URL:', targetUrl);

    let html;
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      html = await response.text();
    } catch (fetchErr) {
      console.error('[Server] Fetch error:', fetchErr.message);
      // Fallback: return basic structure
      return res.json({
        title: url,
        description: 'Unable to fetch website content',
        text: '',
        headings: [],
        colors: ['#3b82f6', '#1f2937'],
        fonts: ['sans-serif'],
        images: [],
      });
    }

    console.log('[Server] Received', html.length, 'bytes');

    // Parse using regex (simple fallback when DOMParser not available)
    const title = extractTitle(html);
    const description = extractDescription(html);
    const text = extractText(html);
    const headings = extractHeadings(html);
    const colors = extractColors(html);
    const fonts = extractFonts(html);
    const images = extractImages(html);

    console.log('[Server] Extraction complete');

    res.json({
      title,
      description,
      text,
      headings,
      colors,
      fonts,
      images,
    });
  } catch (error) {
    console.error('[Server] Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to scrape website',
    });
  }
});

function extractTitle(html) {
  const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/);
  if (ogTitle) return ogTitle[1];

  const title = html.match(/<title>([^<]+)<\/title>/);
  if (title) return title[1];

  return 'Website';
}

function extractDescription(html) {
  const ogDesc = html.match(/<meta property="og:description" content="([^"]+)"/);
  if (ogDesc) return ogDesc[1];

  const metaDesc = html.match(/<meta name="description" content="([^"]+)"/);
  if (metaDesc) return metaDesc[1];

  return '';
}

function extractText(html) {
  // Remove script and style tags
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text.substring(0, 10000);
}

function extractHeadings(html) {
  const headings = [];
  const headingRegex = /<h[1-4][^>]*>([^<]+)<\/h[1-4]>/gi;

  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 0 && headings.length < 10) {
      headings.push(text);
    }
  }

  return headings;
}

function extractColors(html) {
  const colors = new Set();

  // Hex colors
  const hexRegex = /#[0-9a-fA-F]{6}\b/g;
  const hexMatches = html.match(hexRegex) || [];
  hexMatches.forEach(color => colors.add(color.toLowerCase()));

  // RGB colors
  const rgbRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
  let match;
  while ((match = rgbRegex.exec(html)) !== null) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    colors.add(`#${r}${g}${b}`.toLowerCase());
  }

  return Array.from(colors)
    .filter(c => c !== '#000000' && c !== '#ffffff')
    .slice(0, 8);
}

function extractFonts(html) {
  const fonts = new Set();

  // font-family declarations
  const fontRegex = /font-family\s*:\s*([^;}]+)/gi;
  let match;
  while ((match = fontRegex.exec(html)) !== null) {
    const fontList = match[1].split(',');
    fontList.forEach(font => {
      const clean = font
        .trim()
        .replace(/['"]/g, '')
        .split(/\s+/)[0];
      if (clean && clean.length > 0 && clean !== 'sans-serif' && clean !== 'serif') {
        fonts.add(clean);
      }
    });
  }

  return Array.from(fonts).slice(0, 5);
}

function extractImages(html) {
  const images = [];
  const imgRegex = /<img[^>]+src="([^"]+)"/gi;

  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src && images.length < 10) {
      images.push(src);
    }
  }

  return images;
}

app.listen(PORT, () => {
  console.log(`[Server] Scraping API running on http://localhost:${PORT}`);
  console.log(`[Server] POST /api/scrape to extract website data`);
});
