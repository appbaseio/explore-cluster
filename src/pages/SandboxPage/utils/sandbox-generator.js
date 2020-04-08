import React from 'react';
import { getParameters } from 'codesandbox/lib/api/define';
import reactElementToJSXString from 'react-element-to-jsx-string';

const dependencies = {
	react: '16.8.0',
	'react-dom': '16.8.0',
	'@appbaseio/reactivesearch': '3.7.2',
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

const sandboxCodeFormat = code => {
	return code.split('\n').join('\n\t\t\t\t');
};

const generateAppCode = ({ searchCode, filtersCode, resultCode, app, url, credentials }) => {
	return `
import React from 'react';
import {
	ReactiveBase,
	ReactiveList,
	MultiList,
	DataSearch
} from '@appbaseio/reactivesearch';
import './styles.css';

const App = () => {
	return (
		<ReactiveBase app="${app}" credentials="${credentials}" enableAppbase url="${url}">
			<div className="app">
				<div>
					${sandboxCodeFormat(filtersCode)}
				</div>
				<div>
					${sandboxCodeFormat(searchCode)}
					${sandboxCodeFormat(resultCode)}
				</div>
			</div>
		</ReactiveBase>
	)
};

export default App;
	`;
};

const styles = `
body {
  margin: 0;
}

.app {
  display: grid;
  grid-template-columns: 0.5fr 1fr;
  overflow: hidden;
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

const generateResultCode = ({ id: resultId, ...resultProps }) => {
	return reactElementToJSXString(<div {...resultProps} componentId={resultId} renderItem />)
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

const generateSearchCode = ({ id: searchId, ...searchProps }) => {
	return reactElementToJSXString(<div componentId={searchId} {...searchProps} />, {
		showFunctions: false,
	}).replace('div', 'DataSearch');
};

const generateFiltersCode = filtersWithProps => {
	return filtersWithProps.reduce((agg, { id, ...filter }) => {
		const listCode = reactElementToJSXString(<div {...filter} componentId={id} />, {
			showFunctions: false,
		}).replace('div', 'MultiList');

		if (agg) {
			return `${agg}\n${listCode}`;
		}
		return `${listCode}`;
	}, '');
};

const generateSandboxURL = ({ settings, app, credentials, url }) => {
	const searchSettings = settings.find(setting => setting.id === 'search');
	const resultSettings = settings.find(setting => setting.id === 'result');
	const filtersWithProps = settings.filter(
		setting => setting.id !== 'search' && setting.id !== 'result',
	);

	const searchCode = generateSearchCode(searchSettings);

	const resultCode = generateResultCode(resultSettings);

	const filtersCode = generateFiltersCode(filtersWithProps);

	const parameters = getParameters({
		files: {
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
					dependencies,
				},
			},
		},
	});

	return `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`;
};

export default generateSandboxURL;
