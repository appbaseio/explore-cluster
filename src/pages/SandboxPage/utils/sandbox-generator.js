import React from 'react';
import { getParameters } from 'codesandbox/lib/api/define';
import reactElementToJSXString from 'react-element-to-jsx-string';
import get from 'lodash/get';
import { transformQuery } from './index';

const dependencies = {
	react: '16.8.0',
	'react-dom': '16.8.0',
	'@appbaseio/reactivesearch': 'latest',
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
	DynamicRangeSlider,
	DataSearch,
	SelectedFilters,
} from '@appbaseio/reactivesearch';
import './styles.css';
import Expand from './Expand';
import Tooltip from './Tooltip';

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

const styles = (hasFilters) => `body {
  margin: 0;
}

.app {
  display: grid;
  grid-template-columns: ${hasFilters ? '0.3fr 1fr' : '1fr'};
  overflow: hidden;
  grid-gap: 15px;
  padding: 10px;
}

.filter {
  min-width: 250px;
  margin-top: 10px;
}

.item {
  padding: 10px;
  width: 100%;
  margin: 10px 0 0;
  background: #eaeaea;
  position: relative;
  transition: all ease 0.2s;
}

.item-key {
  display: flex;
  justify-content: space-between;
  padding: 4px;
}

.item-key .value {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

pre {
  background: black;
  max-width: 300px;
  overflow: scroll;
}

/******* EXPAND-COLLAPSE STYLES *******/
.collapse {
  overflow: hidden;
  max-height: 200px;
}

.expand-button-container button {
  margin: 10px;
  color: #1890ff;
  border: 0;
  background: inherit;
  cursor: pointer;
}

.expand-button-container {
  width: 100%;
  background: linear-gradient(180deg, #eaeaea, rgba(255, 255, 255, 0.8));
}

/******* TOOLTIP STYLES *******/

/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  background-color: black;
  color: #fff;
  border-radius: 6px;

  position: absolute;
  z-index: 1;
  top: -5px;
  right: 105%;
  max-width: 450px;
  min-width: fit-content;
  padding: 10px;
  overflow-x: scroll;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}

@media (max-width: 768px) {
  .app {
    grid-template-columns: auto;
  }
}
`;

const Tooltip = `import React from "react"; const Tooltip = ({ title, children, code }) => {
  return (
    <div class="tooltip">
      {children}
      <span
        class="tooltiptext"
        dangerouslySetInnerHTML={{
          __html: code ? \`<pre>\${title}</pre>\` : title
        }}
      />
    </div>
  );
};

export default Tooltip;`;

const Expand = `import React from "react";

class Expand extends React.Component {
  state = { collapsed: false, hasOverflow: false };
  currentRef = React.createRef();

  componentDidMount() {
    if (this.currentRef && this.currentRef.current) {
      const currentHeight = this.currentRef.current.getBoundingClientRect()
        .height;

      if (currentHeight > 200) {
        this.setState({
          hasOverflow: true,
          collapsed: true
        });
      }
    }
  }

  toggleCollapse = () => {
    this.setState(state => ({
      collapsed: !state.collapsed
    }));
  };

  render() {
    const { className, children } = this.props;
    const { hasOverflow, collapsed } = this.state;
    return (
      <React.Fragment>
        <div
          ref={this.currentRef}
          className={\`\${className} \${
            hasOverflow && collapsed ? "collapse" : ""
          }\`}
        >
          {children}
        </div>
        {hasOverflow ? (
          <div className="expand-button-container">
            <button onClick={this.toggleCollapse}>
              {collapsed ? "Show more..." : "Collapse"}
            </button>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

export default Expand;

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
		const { _promoted, _click_id, _index, highlight, _type, index, ...rest } = item;

		// Change to update the UI
		return (
			<Expand className="item" key={rest._id}>
				{Object.keys(rest).map(key => (
				<div className="item-key">
					<span>{key}</span>
					<Tooltip
					code={typeof rest[key] === "object"}
					title={JSON.stringify(rest[key], null, 2) || "N/A"}
					>
					<div
						className="value"
						dangerouslySetInnerHTML={{
						__html:
							typeof rest[key] === "object"
							? "{...}"
							: JSON.stringify(rest[key]) || "N/A"
						}}
					/>
					</Tooltip>
				</div>
				))}
			</Expand>
		);
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

const sentenceCase = (text) => {
	if (text) {
		const result = text.replace(/([A-Z])/g, ' $1');
		return result.charAt(0).toUpperCase() + result.slice(1);
	}
	return text;
};

const generateFiltersCode = (filtersWithProps) => {
	if (filtersWithProps.length === 0) {
		return '';
	}

	return filtersWithProps.reduce((agg, { id, value, type, dataField, ...filter }) => {
		let listCode = '';
		if (type === 'term') {
			listCode = reactElementToJSXString(
				<div
					{...filter}
					defaultValue={value || []}
					dataField={get(dataField, '[0]', '')}
					className="filter"
					title={sentenceCase(get(dataField, '[0]', '').replace('.keyword', ''))}
					filterLabel={sentenceCase(get(dataField, '[0]', '').replace('.keyword', ''))}
					componentId={id}
				/>,
				{
					showFunctions: false,
				},
			).replace('div', 'MultiList');
		} else {
			listCode = reactElementToJSXString(
				<div
					dataField={get(dataField, '[0]', '')}
					className="filter"
					title={sentenceCase(get(dataField, '[0]', '').replace('.keyword', ''))}
					componentId={id}
					filterLabel={sentenceCase(get(dataField, '[0]', '').replace('.keyword', ''))}
				/>,
				{
					showFunctions: false,
				},
			).replace('div', 'DynamicRangeSlider');
		}

		if (agg) {
			return `${agg}\n${listCode}`;
		}
		return `${listCode}`;
	}, '');
};

const generateSandboxURL = ({ settings, app, credentials, url }) => {
	const newSettings = transformQuery(settings);
	const searchSettings = newSettings.find((setting) => setting.id === 'search');
	const resultSettings = newSettings.find((setting) => setting.id === 'result');
	const filtersWithProps = newSettings.filter(
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
		'src/Expand.js': { content: Expand },
		'src/Tooltip.js': { content: Tooltip },
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
		'src/styles.css': { content: styles(filtersWithProps.length) },
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
				content: unFormattedFiles[item].content,
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
