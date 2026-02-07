import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const version = packageJson.version;

// Userscript metadata header
const userscriptHeader = `// ==UserScript==
// @name         OpenFront.io Lobby Intel + Discovery
// @namespace    https://openfront.io/
// @version      ${version}
// @description  Live lobby player list and notify-only lobby discovery with Team criteria filters, shared API calls, and optional alerts.
// @homepageURL  https://github.com/DeLoWaN/openfront-autojoin-lobby
// @downloadURL  https://raw.githubusercontent.com/DeLoWaN/openfront-autojoin-lobby/main/dist/bundle.user.js
// @updateURL    https://raw.githubusercontent.com/DeLoWaN/openfront-autojoin-lobby/main/dist/bundle.user.js
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
  outfile: resolve(__dirname, 'dist/bundle.user.js'),
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
