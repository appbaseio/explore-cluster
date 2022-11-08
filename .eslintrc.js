module.exports = {
	env: {
		browser: true,
		es6: true,
	},
	extends: [
		'airbnb',
		'prettier',
		'plugin:prettier/recommended',
		'prettier/react',
		'prettier/standard',
		'plugin:jest/recommended',
	],
	env: {
		browser: true,
	},
	parser: 'babel-eslint',
	rules: {
		indent: 0,
		'no-tabs': 0,
		'no-underscore-dangle': 0,
		'react/jsx-indent': 0,
		'react/jsx-indent-props': 0,
		'react/jsx-filename-extension': 0,
		'react/jsx-one-expression-per-line': 0,
		'react/forbid-prop-types': 0,
		'no-use-before-define': 0,
		'jsx-a11y/click-events-have-key-events': 0,
		'jsx-a11y/no-static-element-interactions': 0,
		'import/prefer-default-export': 0,
		'react/no-unknown-property': ['error', { ignore: ['css'] }],
	},
};
