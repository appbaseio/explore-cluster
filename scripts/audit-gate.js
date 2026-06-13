const { execSync } = require('child_process');

const FAIL_SEVERITIES = new Set(['critical', 'high']);

function parseAuditOutput(output) {
	const counts = {
		critical: 0,
		high: 0,
		moderate: 0,
		low: 0,
		info: 0,
	};

	for (const line of output.split('\n')) {
		if (!line.trim()) {
			continue;
		}

		try {
			const entry = JSON.parse(line);

			if (entry.type === 'auditSummary' && entry.data?.vulnerabilities) {
				return { ...counts, ...entry.data.vulnerabilities };
			}

			if (entry.type === 'auditAdvisory' && entry.data?.advisory?.severity) {
				const { severity } = entry.data.advisory;
				if (severity in counts) {
					counts[severity] += 1;
				}
			}
		} catch (error) {
			// Ignore non-JSON lines from yarn audit output.
		}
	}

	return counts;
}

function printSummary(counts) {
	console.log('Yarn audit vulnerability summary (dependencies only):');
	console.log(`  critical: ${counts.critical}`);
	console.log(`  high:     ${counts.high}`);
	console.log(`  moderate: ${counts.moderate}`);
	console.log(`  low:      ${counts.low}`);
	console.log(`  info:     ${counts.info}`);
}

function main() {
	let output = '';

	try {
		output = execSync('yarn audit --groups dependencies --json', {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe'],
			maxBuffer: 50 * 1024 * 1024,
		});
	} catch (error) {
		output = `${error.stdout || ''}${error.stderr || ''}`;
	}

	const counts = parseAuditOutput(output);
	printSummary(counts);

	const hasBlockingVulnerabilities = [...FAIL_SEVERITIES].some(
		(severity) => counts[severity] > 0,
	);

	if (hasBlockingVulnerabilities) {
		console.error(
			'\nAudit gate failed: critical or high severity vulnerabilities must be resolved.',
		);
		process.exit(1);
	}

	console.log('\nAudit gate passed: no critical or high severity vulnerabilities.');
	process.exit(0);
}

main();
