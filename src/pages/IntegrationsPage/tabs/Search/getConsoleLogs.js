import { isValidJSONFormat } from '../../../../batteries/components/analytics/utils';

/* eslint-disable */
function overrideConsoleLog() {
	console.stdlog = console.log.bind(console);
	console.logs = [];
	console.log = function () {
		console.logs.push(Array.from(arguments));
		console.stdlog.apply(console, arguments);
	};
}

function resetConsoleOverride() {
	console.log = console.stdlog.bind(console);
}
/* eslint-enable */

// Executes a function in an environment to get console.log as an array of logs
// When executionContext is an array, arguments are passed positionally in the order in which it appears in the array
export default function getConsoleLogs({ func, executionContext }) {
	let consoleArray = [];
	try {
		overrideConsoleLog();

		if (Array.isArray(executionContext)) {
			func(...executionContext);
		} else {
			func(executionContext);
		}

		// eslint-disable-next-line no-console
		const logsArray = console.logs;
		if (Array.isArray(logsArray) && logsArray.length) {
			consoleArray = logsArray.flat().map((item) => {
				if (typeof item === 'string') return item;

				if (isValidJSONFormat(item)) {
					return JSON.stringify(item);
				}
				return String(item);
			});
		}

		resetConsoleOverride();
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
	}

	return consoleArray;
}
