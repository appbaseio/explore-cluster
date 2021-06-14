export default {
	text: ['keyword', 'integer', 'long', 'float', 'double', 'date', 'boolean', 'rank_feature'],
	keyword: ['text', 'integer', 'long', 'float', 'double', 'date', 'boolean', 'rank_feature'],
	object: [],

	integer: ['text', 'keyword', 'float', 'long', 'rank_feature'],
	long: ['text', 'keyword', 'integer', 'float', 'rank_feature'],
	float: ['text', 'keyword', 'integer', 'double', 'rank_feature'],
	double: ['text', 'keyword', 'integer', 'float', 'rank_feature'],

	date: ['text', 'keyword'],
	geo_point: ['text', 'keyword'],
	geo_shape: ['text', 'keyword'],
	boolean: ['text', 'keyword'],

	rank_feature: ['text', 'keyword', 'integer', 'long', 'float', 'double'],
	rank_features: [],
};
