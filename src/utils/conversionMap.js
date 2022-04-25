import { isUsingOpenSearch } from '../constants/config';

export const DenseVector = isUsingOpenSearch() ? 'knn_vector' : 'dense_vector';
export default {
	text: [
		'keyword',
		'integer',
		'long',
		'float',
		'double',
		'date',
		'boolean',
		'rank_feature',
		'geo_point',
		DenseVector,
	],
	keyword: [
		'text',
		'integer',
		'long',
		'float',
		'double',
		'date',
		'boolean',
		'rank_feature',
		DenseVector,
	],
	object: ['nested', 'geo_point'],
	nested: ['object'],

	integer: ['text', 'keyword', 'float', 'long', 'rank_feature', DenseVector],
	long: ['text', 'keyword', 'integer', 'float', 'rank_feature', DenseVector],
	float: ['text', 'keyword', 'integer', 'double', 'rank_feature', DenseVector],
	double: ['text', 'keyword', 'integer', 'float', 'rank_feature', DenseVector],

	date: ['text', 'keyword'],
	geo_point: ['text', 'keyword'],
	geo_shape: ['text', 'keyword'],
	boolean: ['text', 'keyword'],

	rank_feature: ['text', 'keyword', 'integer', 'long', 'float', 'double'],
	rank_features: [],
	dense_vector: ['text', 'keyword', 'integer', 'long', 'float', 'double', 'rank_feature'],
	knn_vector: ['text', 'keyword', 'integer', 'long', 'float', 'double', 'rank_feature'],
};

export const conversionMapLabels = {
	text: 'Text',
	keyword: 'Keyword',
	object: 'Object',
	nested: 'Nested',
	integer: 'Integer',
	long: 'Long',
	float: 'Float',
	double: 'Double',
	date: 'Date',
	geo_point: 'Geo_point',
	geo_shape: 'Geo_shape',
	boolean: 'Boolean',
	rank_feature: 'Rank_feature',
	rank_features: 'Rank_features',
	dense_vector: 'Dense Vector (knn)',
	knn_vector: 'Dense Vector (knn)',
};
