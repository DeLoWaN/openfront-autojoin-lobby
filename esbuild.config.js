import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Userscript metadata header
const userscriptHeader = `// ==UserScript==
// @name         OpenFront.io Bundle: Player List + Auto-Join
// @namespace    https://openfront.io/
// @version      2.2.1.v0.29.0
// @description  Merges "Lobby Player List" and "Auto-Join Lobby" into one efficient script. Shared API calls to prevent 429 errors. Compatible with OpenFront.io v0.29.0+
// @author       DeLoVaN + SyntaxMenace + DeepSeek + Claude
// @match        https://openfront.io/
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @license      UNLICENSED
// ==/UserScript==
`;

const isProduction = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: [resolve(__dirname, 'src/main.ts')],
  bundle: true,
  outfile: resolve(__dirname, 'dist/bundle.js'),
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  banner: {
    js: userscriptHeader,
  },
  minify: isProduction,
  sourcemap: isProduction ? false : 'inline',
  logLevel: 'info',
  // Path alias resolution
  alias: {
    '@': resolve(__dirname, 'src'),
  },
};

if (isWatch) {
  console.log('👀 Watching for changes...\n');
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
} else {
  console.log(`🔨 Building ${isProduction ? 'production' : 'development'} bundle...\n`);
  await esbuild.build(buildOptions);
  console.log('✅ Build complete!\n');
}
