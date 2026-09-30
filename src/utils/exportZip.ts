import JSZip from 'jszip';
import { WORKFLOW_SNIPPET } from '../data/portfolioData';

export async function downloadProjectZip() {
  const zip = new JSZip();

  // Add .github/workflows/deploy.yml
  zip.file('.github/workflows/deploy.yml', WORKFLOW_SNIPPET);

  // Read all source files using Vite's glob import with raw content
  const sourceFiles = import.meta.glob(
    [
      '/src/**/*.{ts,tsx,css}',
      '/index.html',
      '/package.json',
      '/vite.config.ts',
      '/tsconfig.json',
      '/.gitignore'
    ],
    { query: '?raw', import: 'default', eager: true }
  ) as Record<string, string>;

  for (const [path, content] of Object.entries(sourceFiles)) {
    // Strip leading slash
    const relativePath = path.replace(/^\//, '');
    zip.file(relativePath, content);
  }

  // Also ensure package.json has scripts and dependencies intact
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-website-source.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
