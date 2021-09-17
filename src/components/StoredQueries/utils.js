export const getValue = (value) => {
	try {
		return JSON.parse(value);
	} catch (err) {
		return value;
	}
};

// Custom JSON validator
export const jsonValidator = (control) => {
	try {
		JSON.parse(control.value);
		return null;
	} catch (e) {
		return {
			invalidJSON: true,
		};
	}
};

export const getString = (value) => {
	const processed = getValue(value);
	if (typeof processed === 'string') {
		return processed;
	}
	return JSON.stringify(processed, 0, 2);
};

export const extractParams = (value = '') =>
	(value.match(/{{\s*[\w.]+\s*}}/g) || []).map((x) => x.match(/[\w.]+/)[0]);

export const errorMessageTemplate = (property, action) => {
	if (property === 'invalid json') {
		return `Please enter a valid JSON query to ${action}.`;
	}
	return `Invalid query, The ${property} property is required to ${action} the query.`;
};
