import { isEmpty } from '../../../utils';

export const bannerDetails = {
	title: 'Pipelines',
	description:
		'Pipelines let you create pre and post-processing stages for searching and indexing data.',
	buttonText: 'Read Docs',
	icon: 'info-circle',
	href: 'https://docs.appbase.io/docs/search/pipelines/',
};
export const monacoOptions = {
	cursorStyle: 'line',
	fontFamily: 'Monaco, monospace',
	fontSize: 14,
	autoIndent: true,
	scrollBeyondLastLine: false,
	padding: {
		top: 10,
		bottom: 10,
	},
	minimap: {
		enabled: false,
	},
	comments: 'insertSpace',
};

export const TAB_ACTIONS = {
	ADD: 'add',
	REMOVE: 'remove',
};

export const DEFAULT_EXECUTION_CONTEXT_VALUE = {
	request: {
		body: { query: [{ id: 'search', type: 'suggestion', dataField: 'label', value: 'harry' }] },
		headers: {},
	},
	response: {},
	envs: {},
};

export const getConsoleLogsArray = (refObj) => {
	// eslint-disable-next-line camelcase
	const { logs = {}, console_logs = {}, response: { console = {} } = {} } = refObj || {};
	const logsKey =
		(logs instanceof Object && !isEmpty(logs) ? logs : '') ||
		// eslint-disable-next-line camelcase
		(console_logs instanceof Object && !isEmpty(console_logs) ? console_logs : '') ||
		(console instanceof Object && !isEmpty(console) ? console : '');
	if (Array.isArray(logsKey)) {
		return logsKey;
	}
	if (logsKey) {
		let logsArray = [];
		Object.values(logsKey).forEach((valueArr) => {
			logsArray = [...logsArray, ...valueArr];
		});

		return logsArray;
	}

	return [];
};
