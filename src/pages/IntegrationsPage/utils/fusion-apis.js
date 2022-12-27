export const transformGeneralMappingsToFusionArrayFormat = ({ mappings } = { mappings: {} }) => {
	const transformedArray = [];
	if (mappings.properties instanceof Object && Object.keys(mappings.properties).length) {
		const propertiesKeys = Object.keys(mappings.properties);
		propertiesKeys.forEach((propertyKey) => {
			transformedArray.push({
				name: propertyKey,
				docCount: mappings.properties[propertyKey].doc_count,
			});
		});
	}

	return transformedArray;
};
