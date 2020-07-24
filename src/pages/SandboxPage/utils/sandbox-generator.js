import React from 'react';
import { getParameters } from 'codesandbox/lib/api/define';
import reactElementToJSXString from 'react-element-to-jsx-string';
import prettier from 'prettier/standalone';
import babylon from 'prettier/parser-babel';
import get from 'lodash/get';

const dependencies = {
	react: '16.8.0',
	'react-dom': '16.8.0',
	'@appbaseio/reactivesearch': '3.8.1',
};

const sandboxCodeFormat = (code) => {
	return prettier.format(code, {
		parser: 'babel',
		plugins: [babylon],
		tabWidth: 4,
		useTabs: true,
		semi: true,
		singleQuote: true,
		printWidth: 100,
	});
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<meta name="theme-color" content="#000000">
	<link rel="manifest" href="%PUBLIC_URL%/manifest.json">
	<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">

	<title>React App</title>
</head>

<body>
	<noscript>
		You need to enable JavaScript to run this app.
	</noscript>
	<div id="root"></div>
</body>

</html>`;

const index = `import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
`;

const generateAppCode = ({ searchCode, filtersCode, resultCode, app, url, credentials }) => {
	return `
import React from 'react';
import {
	ReactiveBase,
	ReactiveList,
	MultiList,
	DataSearch,
	SelectedFilters,
} from '@appbaseio/reactivesearch';
import './styles.css';

const App = () => {
	return (
		<ReactiveBase app="${app}" credentials="${credentials}" enableAppbase url="${url}">
			<div className="app">
				<div>
					${filtersCode}
				</div>
				<div>
					${searchCode}
					<SelectedFilters />
					${resultCode}
				</div>
			</div>
		</ReactiveBase>
	)
};

export default App;
	`;
};

const styles = `body {
  margin: 0;
}

.app {
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  grid-gap: 15px;
  padding: 10px;
}

.filter {
	min-width: 250px;
	margin-top: 10px;
}

pre {
  background: #f0f0f0;
  padding: 10px;
  width: 100%;
}

@media (max-width: 768px) {
  .app {
    grid-template-columns: auto;
  }
}
`;

const generateResultCode = ({ id: resultId, dataField, ...resultProps }) => {
	return reactElementToJSXString(
		<div
			{...resultProps}
			componentId={resultId}
			dataField={(dataField && dataField[0]) || '_score'}
			renderItem
		/>,
	)
		.replace('div', 'ReactiveList')
		.replace(
			'renderItem',
			`
	renderItem={item => {
		// Change to update the UI
		return <pre key={item._id}>{JSON.stringify(item, null, 4)}</pre>
	}}`,
		);
};

const generateSearchCode = ({ id: searchId, value, ...searchProps }) => {
	return reactElementToJSXString(
		<div {...searchProps} componentId={searchId} defaultValue={value || ''} />,
		{
			showFunctions: false,
		},
	).replace('div', 'DataSearch');
};

const generateFiltersCode = (filtersWithProps) => {
	return filtersWithProps.reduce((agg, { id, value, type, dataField, ...filter }) => {
		const listCode = reactElementToJSXString(
			<div
				{...filter}
				defaultValue={value || []}
				dataField={get(dataField, '[0]', '')}
				className="filter"
				title={get(dataField, '[0]', '').replace('.keyword', '')}
				componentId={id}
			/>,
			{
				showFunctions: false,
			},
		).replace('div', 'MultiList');

		if (agg) {
			return `${agg}\n${listCode}`;
		}
		return `${listCode}`;
	}, '');
};

const generateSandboxURL = ({ settings, app, credentials, url }) => {
	const searchSettings = settings.find((setting) => setting.id === 'search');
	const resultSettings = settings.find((setting) => setting.id === 'result');
	const filtersWithProps = settings.filter(
		(setting) => setting.id !== 'search' && setting.id !== 'result',
	);

	const searchCode = generateSearchCode(searchSettings);

	const resultCode = generateResultCode(resultSettings);

	const filtersCode = generateFiltersCode(filtersWithProps);

	const unFormattedFiles = {
		'public/index.html': { content: html },
		'src/index.js': {
			content: index,
		},
		'src/App.js': {
			content: generateAppCode({
				searchCode,
				resultCode,
				filtersCode,
				app,
				credentials,
				url,
			}),
		},
		'src/styles.css': { content: styles },
		'package.json': {
			content: {
				name: 'ReactiveSearch Starter',
				description:
					'Reactivesearch Starter generated from Search Preview feature of Appbase.io',
				version: '0.0.1',
				keywords: ['react', 'reactivesearch'],
				main: 'src/index.js',
				browserslist: ['>0.2%', 'not dead', 'not ie <= 11', 'not op_mini all'],
				author: 'jyash97@gmail.com',
				dependencies,
			},
		},
	};

	const files = Object.keys(unFormattedFiles).reduce(
		(agg, item) => ({
			...agg,
			[item]: {
				content: item.endsWith('.js')
					? sandboxCodeFormat(unFormattedFiles[item].content)
					: unFormattedFiles[item].content,
			},
		}),
		{},
	);

	const parameters = getParameters({
		files,
	});

	return `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`;
};

export default generateSandboxURL;
