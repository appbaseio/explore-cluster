import get from 'lodash/get';

export const hasKeyword = (fieldMappings) => {
	if (get(fieldMappings, 'fields.keyword.type', '') === 'keyword') {
		return true;
	}

	return false;
};

export const getDiffKeys = ({ saved, current, defaultValue }) => {
	const allKeys = [...Object.keys(saved || {}), ...Object.keys(current || {})];
	return allKeys
		.filter((key) => current[key] !== saved[key])
		.reduce(
			(agg, field) => ({
				...agg,
				old: {
					...agg.old,
					[field]: get(saved, field, defaultValue),
				},
				new: {
					...agg.new,
					[field]: get(current, field, defaultValue),
				},
			}),
			{
				old: {},
				new: {},
			},
		);
};
