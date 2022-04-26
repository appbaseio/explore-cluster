import { isEmpty } from '../../../utils';

export const bannerDetails = {
	title: 'ReactiveSearch Pipelines',
	description: `Pipelines are a set of declarative stages that allow
        creating pre-processing or post-processing flows for
        searching or indexing data.`,
	buttonText: 'Read Docs',
	icon: 'info-circle',
	href: 'https://docs.appbase.io/docs/search/pipelines/concepts/',
};

export const pipelinesBannerDetails = {
	allPipelines: {
		title: 'Pipelines',
		description:
			'Pipelines let you create pre and post-processing stages for searching and indexing data.',
		buttonText: 'Read Docs',
		icon: 'info-circle',
		href: 'https://docs.appbase.io/docs/search/pipelines/',
	},
	globalVars: {
		title: 'Global Variables for Pipelines',
		description:
			'Global variables are KEY/VALUE pairs that can be re-used across multiple pipelines. They can represent backend connection configurations.',
		buttonText: 'Read More',
		icon: 'info-circle',
		href: 'https://docs.appbase.io/docs/pipelines/#global-vars',
	},
};

export const monacoOptions = {
	cursorStyle: 'line',
	fontFamily: 'Monaco, monospace',
	fontSize: 12,
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
	automaticLayout: true,
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

// deletes the keys recursively
// and returns back the post-deletion object along with the object
// containing the deleted keys and their values
export const deleteRecursive = (inputProp, keysToDelete) => {
	if (!(inputProp instanceof Object)) {
		return null;
	}
	let input;

	if (Array.isArray(inputProp)) {
		input = [...inputProp];
		input.forEach((arrElement, index) => {
			if (typeof arrElement === 'object') {
				input[index] = deleteRecursive(arrElement, keysToDelete);
			}
		});
	} else {
		input = { ...inputProp };
		// eslint-disable-next-line consistent-return
		Object.keys(input).forEach((key) => {
			if (keysToDelete.includes(key)) {
				delete input[key];
			}
			if (typeof input[key] === 'object') {
				input[key] = deleteRecursive(input[key], keysToDelete);
			}
		});
	}
	return input;
};

export const trimExtension = (string, extension = '.js') => {
	return string?.replace(new RegExp(`${extension}+$`), '') ?? '';
};

// currently this util  method supports injection of conditional schema
// fot 'inputs' property based on selected stage (under schema.definitions.PreBuiltStage.additionalProperties.stages)
export const modifySchema = (schema) => {
	const processedSchema = { ...schema };
	const prebuiltStages =
		processedSchema?.definitions?.PreBuiltStage?.additionalProperties?.stages;

	const schemaObject = {
		allOf: [],
	};
	Object.keys(prebuiltStages).forEach((stage) => {
		if (prebuiltStages[stage].inputs) {
			const { $schema, ...rest } = prebuiltStages[stage].inputs;
			// refer to: https://json-schema.org/understanding-json-schema/reference/conditionals.html#if-then-else
			schemaObject.allOf.push(
				...[
					{
						if: {
							properties: { id: { const: stage } },
							required: ['id'],
						},
						then: {
							properties: { inputs: rest },
						},
					},
					{
						if: {
							properties: { use: { const: stage } },
							required: ['use'],
						},
						then: {
							properties: { inputs: rest },
						},
					},
				],
			);
		}
	});

	if (processedSchema?.properties?.stages?.items?.properties) {
		processedSchema.properties.stages.items = {
			...processedSchema.properties.stages.items,
			...schemaObject,
		};
	}
	return processedSchema;
};
