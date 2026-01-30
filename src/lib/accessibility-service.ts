/**
 * Feature 8: Accessibility Service
 * WCAG compliance analysis and accessibility recommendations
 */

export interface BrandColor {
  hex: string;
  name: string;
  usage?: string;
}

export interface ContrastResult {
  color1: BrandColor;
  color2: BrandColor;
  ratio: number;
  score: 'AAA' | 'AA' | 'Fail';
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;

  const [lr, lg, lb] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/**
 * Calculate contrast ratio between two colors (WCAG)
 */
function calculateContrast(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Analyze color contrast for WCAG compliance
 */
export function analyzeAccessibility(colors: BrandColor[]): ContrastResult[] {
  if (!colors || !Array.isArray(colors)) {
    return [];
  }

  const results: ContrastResult[] = [];
  
  // Compare every color against every other color
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const c1 = colors[i];
      const c2 = colors[j];
      
      // Validate hex colors
      if (!c1?.hex || !c1.hex.startsWith('#') || !c2?.hex || !c2.hex.startsWith('#')) {
        continue;
      }

      try {
        const ratio = calculateContrast(c1.hex, c2.hex);
        let score: 'AAA' | 'AA' | 'Fail' = 'Fail';
        
        if (ratio >= 7) score = 'AAA';
        else if (ratio >= 4.5) score = 'AA';

        results.push({ color1: c1, color2: c2, ratio, score });
      } catch (e) {
        console.warn('Contrast calculation failed', e);
      }
    }
  }

  return results.sort((a, b) => b.ratio - a.ratio);
}

/**
 * Get WCAG compliance recommendations
 */
export function getA11yRecommendations(colors: BrandColor[]): string[] {
  const recommendations: string[] = [];
  const contrastResults = analyzeAccessibility(colors);

  const hasAA = contrastResults.some(r => r.score === 'AA' || r.score === 'AAA');
  const hasAAA = contrastResults.some(r => r.score === 'AAA');

  if (!hasAA) {
    recommendations.push(
      '⚠️ No color combinations meet WCAG AA standards. Consider using higher contrast colors.'
    );
  }

  if (!hasAAA && hasAA) {
    recommendations.push(
      '💡 No AAA combinations found. For best accessibility, include very high contrast options.'
    );
  }

  if (hasAAA) {
    recommendations.push(
      '✅ Your brand includes AAA-level contrast pairs. Good for accessibility!'
    );
  }

  // Check for too many colors
  if (colors.length > 8) {
    recommendations.push(
      '💡 Consider limiting your palette to 5-7 colors for better usability.'
    );
  }

  // Check color blindness (simplified check)
  const redGreenCount = colors.filter(c => {
    const hex = c.hex.toLowerCase();
    return (hex.includes('ff0000') || hex.includes('00ff00'));
  }).length;

  if (redGreenCount > 0) {
    recommendations.push(
      '🎨 Your palette may not be suitable for color-blind users. Avoid red-green only combinations.'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Your color palette meets accessibility standards!');
  }

  return recommendations;
}

/**
 * Get accessibility score
 */
export function getA11yScore(colors: BrandColor[]): number {
  if (!colors || colors.length === 0) return 0;

  const contrastResults = analyzeAccessibility(colors);
  
  const aaaCount = contrastResults.filter(r => r.score === 'AAA').length;
  const aaCount = contrastResults.filter(r => r.score === 'AA').length;
  const totalPairs = contrastResults.length;

  if (totalPairs === 0) return 0;

  // Score: AAA pairs worth more
  const score = ((aaaCount * 100) + (aaCount * 75)) / (totalPairs * 100);
  return Math.min(100, Math.round(score * 100));
}

/**
 * Detailed accessibility report
 */
export function generateA11yReport(brandData: any): {
  score: number;
  recommendations: string[];
  contrastResults: ContrastResult[];
  wcagLevel: 'AAA' | 'AA' | 'Fail';
} {
  const colors = (brandData.identity?.colors || [])
    .map((c: any) => ({ hex: c.hex, name: c.name, usage: c.usage }))
    .filter((c: any) => c.hex && c.hex.startsWith('#'));

  const contrastResults = analyzeAccessibility(colors);
  const score = getA11yScore(colors);
  const recommendations = getA11yRecommendations(colors);

  let wcagLevel: 'AAA' | 'AA' | 'Fail' = 'Fail';
  if (contrastResults.some(r => r.score === 'AAA')) {
    wcagLevel = 'AAA';
  } else if (contrastResults.some(r => r.score === 'AA')) {
    wcagLevel = 'AA';
  }

  return {
    score,
    recommendations,
    contrastResults,
    wcagLevel,
  };
}

/**
 * Check if colors are accessible for a specific use case
 */
export function isAccessibleFor(foreground: BrandColor, background: BrandColor, wcagLevel: 'AA' | 'AAA' = 'AA'): boolean {
  try {
    const ratio = calculateContrast(foreground.hex, background.hex);
    const minRatio = wcagLevel === 'AAA' ? 7 : 4.5;
    return ratio >= minRatio;
  } catch {
    return false;
  }
}
