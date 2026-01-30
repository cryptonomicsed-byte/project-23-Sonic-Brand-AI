/**
 * Deep Crawler Service
 * Multi-page crawling with content extraction for comprehensive brand DNA analysis
 */

export interface CrawledPage {
  url: string;
  cleanText: string;
  title: string;
  cleanedHtml?: string;
}

export interface DeepCrawlResult {
  pages: CrawledPage[];
  totalPages: number;
  errors: string[];
}

class DeepCrawler {
  private maxPages = 10;
  private delayMs = 500;
  private timeoutMs = 10000;
  private minTextLength = 300;

  /**
   * Priority keywords for link filtering
   */
  private priorityKeywords = [
    'about', 'team', 'mission', 'values', 'vision',
    'story', 'blog', 'products', 'services', 'features',
    'why', 'who', 'what', 'culture', 'press'
  ];

  /**
   * Main crawl method
   */
  async crawl(url: string): Promise<DeepCrawlResult> {
    const errors: string[] = [];
    const pages: CrawledPage[] = [];
    const visited = new Set<string>();
    const queue: string[] = [];

    try {
      // Normalize and validate URL
      const rootUrl = this.normalizeUrl(url);
      if (!rootUrl) {
        throw new Error('Invalid URL provided');
      }

      queue.push(rootUrl);
      visited.add(rootUrl);

      // Crawl pages sequentially
      while (queue.length > 0 && pages.length < this.maxPages) {
        const currentUrl = queue.shift()!;
        
        try {
          const page = await this.fetchAndProcessPage(currentUrl);
          if (page) {
            pages.push(page);
          }

          // Extract and queue new links
          const newLinks = await this.extractLinksFromUrl(currentUrl, rootUrl);
          for (const link of newLinks) {
            if (!visited.has(link) && pages.length < this.maxPages) {
              visited.add(link);
              queue.push(link);
            }
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          errors.push(`Error crawling ${currentUrl}: ${errorMsg}`);
        }

        // Be polite: delay between requests
        if (queue.length > 0) {
          await this.delay(this.delayMs);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Crawl initialization error: ${errorMsg}`);
    }

    return {
      pages,
      totalPages: pages.length,
      errors,
    };
  }

  /**
   * Fetch and process a single page
   */
  private async fetchAndProcessPage(url: string): Promise<CrawledPage | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Brand Scanner)',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const cleanedText = this.cleanAndExtractText(html);
      const title = this.extractTitle(html) || new URL(url).pathname;

      // Skip pages with minimal content
      if (cleanedText.length < this.minTextLength) {
        return null;
      }

      return {
        url,
        cleanText: cleanedText,
        title,
        cleanedHtml: html,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Extract links from a page
   */
  private async extractLinksFromUrl(pageUrl: string, rootUrl: string): Promise<string[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(pageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Brand Scanner)',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links: string[] = [];

      // Extract all anchor tags
      const anchors = doc.querySelectorAll('a[href]');
      for (const anchor of anchors) {
        const href = anchor.getAttribute('href');
        if (!href) continue;

        try {
          // Resolve relative URLs
          const absoluteUrl = new URL(href, pageUrl).href;
          const linkOrigin = new URL(absoluteUrl).origin;
          const rootOrigin = new URL(rootUrl).origin;

          // Only same-domain links
          if (linkOrigin !== rootOrigin) continue;

          // Exclude fragments and query params for simplicity
          const cleanUrl = absoluteUrl.split('#')[0];

          // Check for priority keywords
          const isPriority = this.priorityKeywords.some(
            keyword => cleanUrl.toLowerCase().includes(keyword)
          );

          if (isPriority) {
            links.push(cleanUrl);
          }
        } catch {
          // Skip invalid URLs
        }
      }

      return [...new Set(links)].slice(0, 5); // Return top 5 unique prioritized links
    } catch (err) {
      return [];
    }
  }

  /**
   * Clean HTML and extract visible text
   */
  private cleanAndExtractText(html: string): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Remove script, style, nav, footer, header elements
      const selectorsToRemove = [
        'script',
        'style',
        'noscript',
        '[id*="nav"]',
        '[class*="nav"]',
        '[id*="footer"]',
        '[class*="footer"]',
        '[id*="header"]',
        '[class*="header"]',
        '[id*="sidebar"]',
        '[class*="sidebar"]',
        '[aria-label*="navigation"]',
      ];

      for (const selector of selectorsToRemove) {
        doc.querySelectorAll(selector).forEach(el => el.remove());
      }

      // Extract text
      const text = doc.body?.innerText || '';

      // Collapse whitespace and trim
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
        .trim();
    } catch (err) {
      return '';
    }
  }

  /**
   * Extract page title
   */
  private extractTitle(html: string): string | null {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Try og:title first
      const ogTitle = doc.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        return ogTitle.getAttribute('content') || null;
      }

      // Fall back to title tag
      const titleTag = doc.querySelector('title');
      if (titleTag) {
        return titleTag.textContent || null;
      }

      // Fall back to h1
      const h1 = doc.querySelector('h1');
      if (h1) {
        return h1.textContent || null;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Normalize URL
   */
  private normalizeUrl(url: string): string | null {
    try {
      let normalized = url.trim();
      if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = `https://${normalized}`;
      }

      const urlObj = new URL(normalized);
      // Return origin + pathname (exclude query/fragment)
      return `${urlObj.origin}${urlObj.pathname}`.replace(/\/$/, '') || urlObj.origin;
    } catch {
      return null;
    }
  }

  /**
   * Sleep helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const deepCrawler = new DeepCrawler();
