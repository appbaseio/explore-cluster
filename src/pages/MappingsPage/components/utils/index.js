import get from 'lodash/get';

export const updateObjectNestedProperty = ({ obj, value, fields, currentIndex = 0 }) => {
	if (currentIndex + 1 === fields.length) {
		return {
			...obj,
			[fields[currentIndex]]: value,
		};
	}

	return {
		...obj,
		[fields[currentIndex]]: {
			...get(obj, `${fields[currentIndex]}`),
			...updateObjectNestedProperty({
				obj: get(obj, `${fields[currentIndex]}`),
				value,
				fields,
				currentIndex: currentIndex + 1,
			}),
		},
	};
};

export const flatObject = (originalObject, path = '') => {
	const clonedObject = JSON.parse(JSON.stringify(originalObject));

	return Object.keys(clonedObject).reduce((agg, key) => {
		const parsedKey =
			typeof clonedObject[key] === 'object'
				? flatObject(clonedObject[key], `${path}${key}.`)
				: { [`${path}${key}`]: clonedObject[key] };
		return {
			...agg,
			...parsedKey,
		};
	}, {});
};

export const capitalizeFirstLetter = (word) => {
	if (!word) {
		return '';
	}
	return word.charAt(0).toUpperCase() + word.slice(1);
};
