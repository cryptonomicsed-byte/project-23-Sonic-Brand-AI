/**
 * Feature 7: PDF Export Service
 * Export brand profiles and campaign assets as PDF documents
 */

export interface PDFExportOptions {
  title: string;
  includeColors: boolean;
  includeFonts: boolean;
  includeMessaging: boolean;
  pageSize: 'a4' | 'letter';
}

/**
 * Create HTML version of brand profile for printing/PDF
 */
export function createBrandProfileHTML(brandData: any, options: PDFExportOptions = {
  title: 'Brand Profile',
  includeColors: true,
  includeFonts: true,
  includeMessaging: true,
  pageSize: 'a4',
}): string {
  const colors = brandData.identity?.colors || [];
  const fonts = brandData.identity?.fonts || [];
  const messaging = brandData.voice?.keywords || [];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${options.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .page { page-break-after: always; padding: 40px; }
    h1 { font-size: 2.5em; margin-bottom: 10px; color: ${colors[0]?.hex || '#000'}; }
    h2 { font-size: 1.8em; margin-top: 30px; margin-bottom: 15px; color: ${colors[0]?.hex || '#000'}; }
    h3 { font-size: 1.2em; margin-top: 20px; margin-bottom: 10px; }
    .tagline { font-size: 1.1em; color: #666; margin-bottom: 30px; }
    .section { margin-bottom: 30px; }
    .color-palette {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .color-box {
      height: 80px;
      border-radius: 8px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      color: white;
      font-size: 0.85em;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      padding: 5px;
    }
    .font-sample {
      margin: 15px 0;
      padding: 15px;
      border-left: 3px solid ${colors[0]?.hex || '#ccc'};
      background: #f9f9f9;
    }
    .messaging-list {
      list-style: none;
      margin-top: 15px;
    }
    .messaging-list li {
      padding: 8px 0;
      padding-left: 20px;
      position: relative;
    }
    .messaging-list li:before {
      content: "▸";
      position: absolute;
      left: 0;
      color: ${colors[0]?.hex || '#666'};
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background: ${colors[0]?.hex || '#f0f0f0'};
      color: white;
    }
  </style>
</head>
<body>
  <!-- Page 1: Title -->
  <div class="page">
    <h1>${brandData.core?.mission || brandData.name || 'Brand Profile'}</h1>
    <p class="tagline">${brandData.core?.tagline || ''}</p>
    <p>${brandData.core?.vision || ''}</p>
  </div>

  <!-- Page 2: Core Brand -->
  <div class="page">
    <h2>Brand Core</h2>
    
    <div class="section">
      <h3>Mission</h3>
      <p>${brandData.core?.mission || 'Mission statement not provided'}</p>
    </div>

    <div class="section">
      <h3>Values</h3>
      <ul class="messaging-list">
        ${(brandData.core?.values || []).map((v: string) => `<li>${v}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h3>Target Audience</h3>
      <p>${brandData.audience?.demographics || 'Audience not specified'}</p>
    </div>
  </div>

  ${options.includeColors ? `
  <!-- Page 3: Colors -->
  <div class="page">
    <h2>Visual Identity - Colors</h2>
    <p>Primary color palette extracted from the brand:</p>
    
    <div class="color-palette">
      ${colors.map((c: any) => `
        <div>
          <div class="color-box" style="background-color: ${c.hex}; border: 1px solid #ddd;">
            ${c.hex}
          </div>
          <p style="text-align: center; font-size: 0.9em; margin-top: 8px;">${c.name}</p>
        </div>
      `).join('')}
    </div>

    <h3 style="margin-top: 40px;">Color Usage</h3>
    <table>
      <tr>
        <th>Color</th>
        <th>Hex</th>
        <th>Usage</th>
      </tr>
      ${colors.map((c: any) => `
        <tr>
          <td><div style="width: 30px; height: 30px; background: ${c.hex}; border: 1px solid #ddd;"></div></td>
          <td>${c.hex}</td>
          <td>${c.usage || c.context || 'Primary'}</td>
        </tr>
      `).join('')}
    </table>
  </div>
  ` : ''}

  ${options.includeFonts ? `
  <!-- Page 4: Typography -->
  <div class="page">
    <h2>Visual Identity - Typography</h2>
    
    ${fonts.map((f: any, idx: number) => `
      <div class="font-sample" style="font-family: ${f.family}, sans-serif;">
        <h3>${f.family}</h3>
        <p style="margin-bottom: 5px; color: #666;">Usage: ${f.usage}</p>
        <p style="font-size: 1.2em; font-weight: 500;">The quick brown fox jumps over the lazy dog.</p>
        <p style="font-size: 0.95em;">1234567890 !@#$%^&*()</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${options.includeMessaging ? `
  <!-- Page 5: Messaging -->
  <div class="page">
    <h2>Brand Voice & Messaging</h2>
    
    <div class="section">
      <h3>Tone of Voice</h3>
      <ul class="messaging-list">
        ${(brandData.voice?.tone || []).map((t: string) => `<li>${t}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h3>Key Messaging</h3>
      <ul class="messaging-list">
        ${messaging.map((m: string) => `<li>${m}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h3>Writing Style</h3>
      <p>${brandData.voice?.writingStyle || 'Professional and clear'}</p>
    </div>
  </div>
  ` : ''}

  <!-- Last Page: Summary -->
  <div class="page">
    <h2>Summary</h2>
    
    <div class="section">
      <h3>Market Positioning</h3>
      <p>${brandData.market?.positioning || 'Market positioning statement'}</p>
    </div>

    <div class="section">
      <h3>Key Differentiators</h3>
      <ul class="messaging-list">
        ${(brandData.core?.values || []).map((v: string) => `<li>${v}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <p style="margin-top: 60px; color: #999; font-size: 0.9em;">
        Brand Profile exported from Sonic Brand AI<br>
        Generated: ${new Date().toLocaleString()}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return html;
}

/**
 * Download HTML as PDF (simplified - use html2pdf or similar in production)
 */
export function exportToPDF(brandData: any, filename: string, options?: PDFExportOptions): void {
  try {
    const html = createBrandProfileHTML(brandData, options);
    
    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('PDF export initiated:', filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error(`Failed to export PDF: ${error}`);
  }
}

/**
 * Generate printable version
 */
export function generatePrintView(brandData: any): string {
  return createBrandProfileHTML(brandData);
}
