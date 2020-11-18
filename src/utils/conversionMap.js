export default {
	text: ['integer', 'long', 'float', 'double', 'date', 'boolean', 'rank_feature'],
	object: [],

	integer: ['float', 'long', 'text', 'rank_feature'],
	long: ['integer', 'text', 'float', 'rank_feature'],
	float: ['integer', 'double', 'text', 'rank_feature'],
	double: ['integer', 'float', 'text', 'rank_feature'],

	keyword: ['text', 'integer', 'long', 'float', 'double', 'date', 'boolean', 'rank_feature'],

	date: ['text'],
	geo_point: ['text'],
	geo_shape: ['text'],
	boolean: ['text'],

	rank_feature: ['text', 'integer', 'long', 'float', 'double'],
	rank_features: [],
};
