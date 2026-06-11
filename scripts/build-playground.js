/**
 * Builds @appbaseio/reactivesearch-playground when installed from GitHub.
 * The public repo ships source only; tsdx build runs in postinstall so CI
 * and local installs work without GitHub Packages auth.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const playgroundPath = path.join(
	__dirname,
	'..',
	'node_modules',
	'@appbaseio',
	'reactivesearch-playground',
);
const distIndex = path.join(playgroundPath, 'dist', 'index.js');

if (!fs.existsSync(playgroundPath)) {
	console.log(
		'[build-playground] @appbaseio/reactivesearch-playground not installed, skipping',
	);
	process.exit(0);
}

if (fs.existsSync(distIndex)) {
	console.log('[build-playground] dist already present, skipping');
	process.exit(0);
}

/**
 * tsdx emits .d.ts with declaration: true. Nested yarn install inside the
 * playground package duplicates redux/styled-components types, which triggers
 * TS2742 when naming inferred exports. explore-cluster only consumes JS.
 */
function patchPlaygroundTsconfig() {
	const tsconfigPath = path.join(playgroundPath, 'tsconfig.json');
	let source = fs.readFileSync(tsconfigPath, 'utf8');
	if (source.includes('"declaration": false')) {
		return;
	}
	source = source.replace('"declaration": true', '"declaration": false');
	fs.writeFileSync(tsconfigPath, source);
}

console.log(
	'[build-playground] building @appbaseio/reactivesearch-playground from source...',
);
patchPlaygroundTsconfig();
execSync('yarn install --production=false --ignore-scripts && yarn build', {
	cwd: playgroundPath,
	stdio: 'inherit',
});
console.log('[build-playground] build complete');
