import get from 'lodash/get';

// eslint-disable-next-line import/prefer-default-export
export const hasKeyword = (fieldMappings) => {
	if (get(fieldMappings, 'type') === 'keyword') {
		return true;
	}
	if (get(fieldMappings, 'fields.keyword.type', '') === 'keyword') {
		return true;
	}

	return false;
};
