import React from 'react';
import reactElementToJSXString from 'react-element-to-jsx-string';
import { getParameters } from 'codesandbox/lib/api/define';
import get from 'lodash/get';
import { transformQuery } from './index';
import { facetMappings } from './constants';

const dependencies = {
	react: '16.8.0',
	'react-dom': '16.8.0',
	'@appbaseio/reactivesearch': 'latest',
	'@appbaseio/reactivemaps': 'latest',
	antd: '4.17.0',
	'@ant-design/icons': 'latest',
	'@ant-design/icons-svg': 'latest',
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

const geoHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta name="theme-color" content="#000000" />

    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico" />
    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"
      integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf"
      crossorigin="anonymous"
    />
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/leaflet.css"
      rel="stylesheet"
    />
    <script
      type="text/javascript"
      src="https://maps.googleapis.com/maps/api/js?libraries=places&key=REDACTED_GOOGLE_API_KEY"
    ></script>
    <title>React App</title>
  </head>

  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
  </body>
</html>

`;

const index = `import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
`;

const renderHeading = (app) => {
	if (app === 'movies') {
		return `<h2 className="header-heading">
            The Movies Store{' '}
            <span role="img" aria-label="books">
                🎥
            </span>
        </h2>`;
	}
	if (app === 'products') {
		return `<h2 className="header-heading">
            The Products Store{' '}
            <span role="img" aria-label="books">
                💻
            </span>
        </h2>
    `;
	}
	if (app === 'geo') {
		return `<h2 className="header-heading">
            The Geo Data{' '}
            <span role="img" aria-label="books">
                🌎
            </span>
        </h2>
        `;
	}
	return '';
};

const generateAppCode = ({
	searchCode,
	filtersCode,
	resultCode,
	app,
	credentials,
	url,
	selectedDataset = '',
}) => `
import React from 'react';
import {
  DataSearch,
  DynamicRangeSlider,
  RangeSlider,
  MultiList,
	ReactiveBase,
	ReactiveList,
	ResultList,
	SelectedFilters,
	RangeInput,
} from '@appbaseio/reactivesearch';
import { ReactiveOpenStreetMap } from '@appbaseio/reactivemaps';
import './styles.css';
import { Tag } from 'antd';
import { StarTwoTone } from "@ant-design/icons";
import "antd/dist/antd.css";
import Expand from './Expand';
import Tooltip from './Tooltip';

const App = () => {
	return (
		<ReactiveBase
			app="${app}"
			credentials="${credentials}"
			enableAppbase
			url="${url}"
			className="search-app"
			mapKey="REDACTED_GOOGLE_API_KEY"
			theme={{
				colors: {
					primaryColor: '#FF307A',
				},
			}}
			style={{
				backgroundColor: '#fff',
				padding: '40px',
				borderRadius: '2px',
				textAlign: 'left',
			}}
			>
			<header className="header-container">
				${renderHeading(selectedDataset)}
				${searchCode}
			</header>
			<SelectedFilters style={{ marginTop: 20 }} showClearAll={false} />
			<div className="multi-col">
				<div className="left-col" style={{width: '240px'}}>
				${filtersCode}
				</div>
				<div style={{width: 'calc(100% - 260px)'}}>
				${resultCode}
				</div>
			</div>
		</ReactiveBase>
	)
};

export default App;
	`;

const styles = (hasFilters) => `body {
		margin: 0;
	  }

	  header {
		  h2 {
			  margin: 0 0 6px 0;
			  font-weight: 700;
			  letter-spacing: -1px;
			  line-height: 42px;
		  }
		  p {
			  margin: 15px 0;
			  font-size: 18px;
			  line-height: 28px;
			  max-width: 550px;
		  }
		  img {
			  width: 70px;
		  }
	  }

	  .header-container {
		  width: 100%;
		  margin: 0;
		  padding: 3rem 6rem;
		  background-image: linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%);
	  }

	  .header-heading {
		  color: #424242;
		  text-align: center;
		  letter-spacing: 0.06rem;
		  margin-bottom: 12px;
	  }

	  .heading-input {
		  border: 0;
		  height: 60px;
		  padding: 0 28px;
		  font-size: 18px;
		  border-radius: 999em;
		  box-shadow: 0 20px 30px 0 rgba(16, 36, 94, 0.2),
			  inset 0 -8px 0 0 rgba(103, 117, 161, 0.08);
	  }

	  .list-item {
		  padding: 20px 0;
		  border-bottom: 1px solid #eee;
	  }
	  .result-stats {
		  max-width: none;
		  margin: 20px 0 0;
		  font-size: 16px;
		  margin-bottom: 5px;
		  line-height: 16px;
		  text-align: right;
	  }
	  .multi-col {
		  display: flex;
		  flex-direction: row;
		  justify-content: space-between;
		  .left-col {
			  width: 240px;
			  h2 {
				  margin: 40px 0 12px;
			  }
			  label {
				  font-weight: normal;
			  }
		  }
		  .right-col {
			  width: calc(100% - 260px);
		  }
	  }

	  .stat-styles {
		  max-width: none;
		  margin: 30px 0 0;
		  font-size: 16px;
		  margin-bottom: 10px;
		  line-height: 16px;
		  text-align: right;
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

const generateResultCode = (facetFields, app = '') => {
	if (app) {
		const reactArr = JSON.stringify(['search', ...facetFields]);
		if (app === 'movies') {
			return moviesLayout(reactArr);
		}
		if (app === 'products') {
			return ecommLayout(reactArr);
		}
		if (app === 'geo') {
			return geoLayout(reactArr);
		}
	}
	return appLayout(facetFields);
};

const appLayout = ({ id: resultId, dataField, ...resultProps }) => {
	return reactElementToJSXString(
		<div
			{...resultProps}
			/* eslint-disable react/no-unknown-property */
			componentId={resultId}
			dataField={(dataField && dataField[0]) || '_score'}
			renderItem
			/* eslint-enable react/no-unknown-property */
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

const moviesLayout = (reactArr) => `
					<ReactiveList
						componentId="results"
						dataField="_score"
						size={5}
						pagination
						URLParams
						react={{
							and: ${reactArr}
						}}
						render={({ data }) => (
							<ReactiveList.ResultListWrapper>
							{data.map((item) => (
								<div
									style={{
										display: "flex",
										padding: 10,
										borderBottom: "1px solid rgb(239, 239, 239)"
									}}
								>
									<img
										style={{
										height: 160,
										width: 160,
										objectFit: "contain"
										}}
										src={item.poster_path}
										alt={item.poster_path}
										onError={(event) => {
										event.target.src =
											"https://banksiafdn.com/wp-content/uploads/2019/10/placeholde-image.jpg"; // eslint-disable-line no-param-reassign
										}}
									/>
									<ResultList key={item._id} id={item._id}>
										<ResultList.Content>
											<ResultList.Title
												dangerouslySetInnerHTML={{
												__html: item.original_title
												}}
											/>
											<ResultList.Description>
												<div>
												<div style={{ display: "flex", color: "#424242" }}>
													<p style={{ fontWeight: "600", marginRight: 5 }}>
													Release Year{" "}
													</p>
													<p> {item.release_year}</p>
													<p>
													<StarTwoTone
														style={{ marginLeft: 40, marginRight: 3 }}
													/>{" "}
													{item.vote_average}/10
													</p>
												</div>
												<p
													style={{
													color: "#888",
													margin: "8px 0",
													fontSize: "13px",
													lineHeight: "18px"
													}}
													dangerouslySetInnerHTML={{
													__html: item.overview
													}}
												/>
												<div>
												{item.genres.map((genre, index) => (
													<Tag>{genre}</Tag>
												))}
												</div>
												</div>
											</ResultList.Description>
										</ResultList.Content>
									</ResultList>
								</div>
							))}
							</ReactiveList.ResultListWrapper>
						)}
					/>
`;

const geoLayout = (reactArr) => {
	//eslint-disable-line
	return `
          <ReactiveOpenStreetMap
            componentId="googleMap"
            dataField="location"
            defaultMapStyle='Light Monochrome'
            title='Reactive Maps'
            defaultZoom={6}
            size={10}
            style={{ zIndex: 0 }}
            react={{
                and: ${reactArr}
            }}
            onPopoverClick={(item) => <div>{item.place}</div>}
            showMapStyles
            renderData={(result) => ({
              custom: (
                <div
                  style={{
                    background: 'dodgerblue',
                    color: '#fff',
                    paddingLeft: 5,
                    paddingRight: 5,
                    borderRadius: 3,
                    padding: 10,
                  }}
                >
                  <i className="fas fa-globe-europe" />
                  &nbsp;{result.magnitude}
                </div>
              ),
            })}
            renderAllData={(
              hits,
              loadMore,
              renderMap,
              renderPagination,
              triggerClickAnalytics,
              meta,
            ) => {
              return (
                <div style={{ width: '100%', height: '100%' }}>
                  <div className="stat-styles">
                    {meta.resultStats.numberOfResults} results found in{' '}
                    {meta.resultStats.time}ms
                  </div>
                  {renderMap()}
                </div>
              );
            }}
          />
    `;
};

const ecommLayout = (reactArr) => `
					<ReactiveList
						componentId="results"
						dataField="_score"
						size={5}
						pagination
						stream
						URLParams
						react={{
							and: ${reactArr}
						}}
						innerClass={{
							listItem: 'list-item',
							resultStats: 'result-stats',
						}}
						render={({ data }) => (
							<ReactiveList.ResultListWrapper>
							{data.map((item) => (
								<div
								style={{
									display: "flex",
									padding: 10,
									borderBottom: "1px solid rgb(239, 239, 239)"
								}}
								>
								<img
									style={{
									height: 160,
									width: 160,
									objectFit: "contain"
									}}
									src={item.image[0]}
									alt={item.image[0]}
									onError={(event) => {
									event.target.src =
										"https://banksiafdn.com/wp-content/uploads/2019/10/placeholde-image.jpg"; // eslint-disable-line no-param-reassign
									}}
								/>
								<ResultList key={item._id} id={item._id}>
									<ResultList.Content>
									<ResultList.Title
										dangerouslySetInnerHTML={{
										__html: item.product_name
										}}
									/>
									<ResultList.Description>
										<div>
										<div style={{ display: "flex", color: "#424242" }}>
											<p style={{ fontWeight: "600", marginRight: 5 }}>
											Retail Price:{' '}
											</p>
											<p> Rs.{item.retail_price}</p>
											{item.brand && (
											<p>
												<p
												style={{
													marginLeft: 40,
													fontWeight: '600',
													marginRight: 5,
												}}
												>
												Brand:{' '}
												</p>
												<p>{item.brand}</p>
											</p>
											)}
										</div>
										<p
											style={{
											color: "#888",
											margin: "8px 0",
											fontSize: "13px",
											lineHeight: "18px"
											}}
											dangerouslySetInnerHTML={{
											__html: item.description
											}}
										/>
										<div>
											{Array.isArray(item.categories) ? (
												item.categories.map((category) => (
												<Tag>{category}</Tag>
												))
											) : (
												<Tag>
												<p
													dangerouslySetInnerHTML={{
														__html: item.categories,
													}}
												/>
												</Tag>
											)}
										</div>
										</div>
									</ResultList.Description>
									</ResultList.Content>
								</ResultList>
								</div>
							))}
							</ReactiveList.ResultListWrapper>
						)}
					/>
	`;

const generateSearchCode = ({ id: searchId, value, ...searchProps }) => {
	return `<SearchBox
          autosuggest={false}
          componentId="search"
          dataField={${JSON.stringify(searchProps.dataField)}}
          filterLabel="Search"
          highlight={true}
          placeholder="Search ..."
          showIcon={false}
		  debounce={500}
        />`;
};

const sentenceCase = (text) => {
	if (text) {
		return text.replace(/(?:_| |\b)(\w)/g, ($1) => {
			return $1.toUpperCase().replace('_', ' ');
		});
	}
	return text;
};

const generateFiltersCode = (filtersWithProps, facetFields = []) => {
	const listArr = ['search'];
	if (facetFields.length === 0 && filtersWithProps.length) {
		// render Search Preview filters based on type
		filtersWithProps.forEach((filter) => {
			if (filter.type === 'term') {
				listArr.push(filter.id);
			}
		});

		// eslint-disable-next-line
		return filtersWithProps.reduce((agg, { id, value, type, dataField, ...filter }) => {
			let listCode = '';
			if (type === 'term') {
				listCode = `
					<MultiList
						componentId="${id}"
						dataField="${get(dataField, '[0]', '')}"
						className="filter"
						title="${sentenceCase(get(dataField, '[0]', '').replace('.keyword', ''))}"
						filterLabel="${sentenceCase(get(dataField, '[0]', '').replace('.keyword', ''))}"
						size={10}
						sortBy="count"
						react={{ and: ${JSON.stringify(listArr.filter((i) => i !== id))}}}
					/>`;
			} else {
				listCode = `
					<DynamicRangeSlider
						componentId="${id}"
						dataField="${get(dataField, '[0]', '')}"
						title="${sentenceCase(get(dataField, '[0]', ''))}"
						filterLabel="${sentenceCase(get(dataField, '[0]', ''))}"
					/>`;
			}

			if (agg) {
				return `${agg}\n${listCode}`;
			}
			return `${listCode}`;
		}, '');
	}
	if (facetFields.length) {
		// render tutorial filters
		facetFields.forEach((filter) => {
			if (facetMappings[filter] === 'term') {
				listArr.push(filter);
			}
		});

		return facetFields.reduce((agg, field) => {
			let listCode = '';
			if (facetMappings[field] === 'term') {
				listCode = `
					<MultiList
						componentId="${field}"
						dataField="${field}.keyword"
						className="filter"
						title="${sentenceCase(field)}"
						filterLabel="${sentenceCase(field)}"
						size={10}
						sortBy="count"
						react={{ and: ${JSON.stringify(listArr.filter((i) => i !== field))}}}
					/>`;
			} else if (field === 'retail_price') {
				listCode = `
					<RangeInput
						componentId="${field}"
						dataField="${field}"
						key="${field}"
						title="Retail Price (Rupees)"
						filterLabel="Retail Price"
						showHistogram
						range={{
						start: 10,
						end: 10000,
						}}
					/>`;
			} else if (field === 'magnitude') {
				listCode = `
					<RangeSlider
						componentId="${field}"
						dataField="${field}"
						key="${field}"
						title="Magnitude (Richter)"
						filterLabel="Magnitude"
						showHistogram
						rangeLabels={{
						start: '0.0',
						end: '10.0',
						}}
					/>`;
			} else if (field === 'year') {
				listCode = `
					<RangeInput
						componentId="${field}"
						dataField="${field}"
						key="${field}"
						filterLabel="Year"
						showHistogram
						range={{
						start: 1970,
						end: 2017,
						}}
					/>`;
			} else if (field === 'release_year') {
				listCode = `
					<RangeInput
						componentId="${field}"
						dataField="${field}"
						key="${field}"
						title="Release Year"
						filterLabel="Release Year"
						showHistogram
						range={{
						start: 1950,
						end: 2021,
						}}
					/>`;
			} else {
				listCode = `
					<DynamicRangeSlider
						componentId="${field}"
						dataField="${field}"
						title="${sentenceCase(field)}"
						filterLabel="${sentenceCase(field)}"
					/>`;
			}

			if (agg) {
				return `${agg}\n${listCode}`;
			}
			return listCode;
		}, '');
	}
	return '';
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
				filtersCode,
				resultCode,
				app,
				credentials,
				url,
			}),
		},
		'src/styles.css': { content: styles(filtersWithProps.length) },
		'package.json': {
			content: {
				name: 'ReactiveSearch Starter App',
				description:
					'Reactivesearch starter app generated from Search preview in reactivesearch.io dashboard',
				version: '0.0.1',
				keywords: ['react', 'reactivesearch'],
				main: 'src/index.js',
				browserslist: ['>0.2%', 'not dead', 'not ie <= 11', 'not op_mini all'],
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

	return parameters;
};

export const generateTutorialSandboxURL = ({
	settings,
	app,
	credentials,
	url,
	facetFields,
	selectedDataset,
}) => {
	const newSettings = transformQuery(settings);
	const searchSettings = newSettings.find((setting) => setting.id === 'search');
	// const resultSettings = newSettings.find((setting) => setting.id === 'result');
	const filtersWithProps = newSettings.filter(
		(setting) => setting.id !== 'search' && setting.id !== 'result',
	);

	const searchCode = generateSearchCode(searchSettings);

	const resultCode = generateResultCode(facetFields, selectedDataset);

	const filtersCode = generateFiltersCode(filtersWithProps, facetFields);

	const unFormattedFiles = {
		'public/index.html': { content: selectedDataset === 'geo' ? geoHtml : html },
		'src/index.js': {
			content: index,
		},
		'src/Expand.js': { content: Expand },
		'src/Tooltip.js': { content: Tooltip },
		'src/App.js': {
			content: generateAppCode({
				searchCode,
				filtersCode,
				resultCode,
				app,
				credentials,
				url,
				selectedDataset,
			}),
		},
		'src/styles.css': { content: styles(filtersWithProps.length) },
		'package.json': {
			content: {
				name: 'ReactiveSearch Starter App',
				description:
					'Reactivesearch starter app generated from Search preview in reactivesearch.io dashboard',
				version: '0.0.1',
				keywords: ['react', 'reactivesearch'],
				main: 'src/index.js',
				browserslist: ['>0.2%', 'not dead', 'not ie <= 11', 'not op_mini all'],
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
