export default {
	text: ['integer', 'long', 'float', 'double', 'date', 'boolean'],
	object: [],

	integer: ['float', 'long', 'text'],
	long: ['integer', 'text', 'float'],
	float: ['integer', 'double', 'text'],
	double: ['integer', 'float', 'text'],

	keyword: ['text', 'integer', 'long', 'float', 'double', 'date', 'boolean'],

	date: ['text'],
	geo_point: ['text'],
	geo_shape: ['text'],
	boolean: ['text'],

	rank_feature: ['text', 'integer', 'long', 'float', 'double'],
	rank_features: ['object'],
};
