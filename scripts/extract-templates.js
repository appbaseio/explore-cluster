const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const sources = require(path.join(ROOT_DIR, 'template-sources.json'));

function resolveRef(data) {
	const { organization, repository, version, commit, branch } = data;

	if (version) {
		return {
			url: `https://codeload.github.com/${organization}/${repository}/legacy.zip/refs/tags/${version}`,
			fileName: `${repository}@${version}`,
		};
	}

	if (commit) {
		return {
			url: `https://codeload.github.com/${organization}/${repository}/legacy.zip/${commit}`,
			fileName: `${repository}@${commit}`,
		};
	}

	if (branch) {
		return {
			url: `https://codeload.github.com/${organization}/${repository}/legacy.zip/refs/heads/${branch}`,
			fileName: `${repository}@${branch}`,
		};
	}

	return {
		url: `https://api.github.com/repos/${organization}/${repository}/zipball/`,
		fileName: repository,
	};
}

function download(url, headers = {}) {
	return new Promise((resolve, reject) => {
		const client = url.startsWith('https') ? https : http;

		client
			.get(url, { headers }, (response) => {
				if (
					response.statusCode >= 300 &&
					response.statusCode < 400 &&
					response.headers.location
				) {
					download(response.headers.location, headers).then(resolve, reject);
					return;
				}

				if (response.statusCode !== 200) {
					reject(new Error(`Download failed (${response.statusCode}): ${url}`));
					return;
				}

				const chunks = [];
				response.on('data', (chunk) => chunks.push(chunk));
				response.on('end', () => resolve(Buffer.concat(chunks)));
				response.on('error', reject);
			})
			.on('error', reject);
	});
}

async function main() {
	fs.rmSync(TEMPLATES_DIR, { recursive: true, force: true });
	fs.mkdirSync(TEMPLATES_DIR, { recursive: true });

	for (const source of sources) {
		const { url, fileName } = resolveRef(source);

		if (source.repositoryType === 'private' && !GITHUB_TOKEN) {
			console.warn(
				`Skipping private repository ${source.organization}/${source.repository} (missing GITHUB_TOKEN)`,
			);
			continue;
		}

		const targetDir = path.join(TEMPLATES_DIR, fileName);
		fs.mkdirSync(targetDir, { recursive: true });

		const headers =
			source.repositoryType === 'private'
				? {
						Accept: 'application/vnd.github+json',
						Authorization: `token ${GITHUB_TOKEN}`,
				  }
				: {};

		console.log(`Downloading ${source.organization}/${source.repository}...`);
		const zipData = await download(url, headers);
		const zipPath = path.join(targetDir, 'file.zip');
		fs.writeFileSync(zipPath, zipData);
		execSync('unzip -oq file.zip', { cwd: targetDir, stdio: 'inherit' });
		fs.unlinkSync(zipPath);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
