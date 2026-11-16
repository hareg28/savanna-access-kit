import fs from 'node:fs';
import path from 'node:path';

let esbuild;
try {
  esbuild = (await import('esbuild')).default;
} catch {
  const pnpmPaths = [
    './node_modules/.pnpm/esbuild@0.28.2/node_modules/esbuild/lib/main.js',
    './node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js'
  ];
  for (const p of pnpmPaths) {
    if (fs.existsSync(p)) {
      esbuild = (await import(p)).default;
      break;
    }
  }
}

if (!esbuild) {
  throw new Error('Could not find esbuild.');
}

// 1. Build unified bundle dist/savanna-access.v1.js
await esbuild.build({
  entryPoints: ['module/src/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/savanna-access.v1.js',
  target: 'es2022',
  minify: false,
  sourcemap: true,
});
console.log('✅ Unified bundle built: dist/savanna-access.v1.js');

// 2. Copy to savanna/module/ for Savanna starter host pages
fs.mkdirSync('savanna/module', { recursive: true });
fs.copyFileSync('dist/savanna-access.v1.js', 'savanna/module/savanna-access.v1.js');
if (fs.existsSync('dist/savanna-access.v1.js.map')) {
  fs.copyFileSync('dist/savanna-access.v1.js.map', 'savanna/module/savanna-access.v1.js.map');
}
console.log('✅ Copied to savanna/module/savanna-access.v1.js');

// 3. Build modular standalone components in module/dist/
await esbuild.build({
  entryPoints: {
    'sign-window': 'module/src/sign-window/sign-window.ts',
    'audio-description': 'module/src/audio-description/audio-description.ts',
    'offline': 'module/src/offline/offline.ts',
    'player': 'module/src/player/savanna-player.ts',
    'job-card': 'module/src/job-card/job-card.ts',
    'credential': 'module/src/credential/credential.ts',
    'access-label': 'module/src/access-label/access-label.ts',
    'profiles': 'module/src/profiles/profiles.ts',
    'share': 'module/src/share/share-button.ts'
  },
  bundle: true,
  format: 'esm',
  outdir: 'module/dist',
  target: 'es2022',
  minify: false,
  sourcemap: true
});
console.log('✅ Modular components built to module/dist/');
