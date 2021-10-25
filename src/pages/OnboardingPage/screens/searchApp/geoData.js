import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	DataSearch,
	RangeSlider,
	MultiList,
	ReactiveBase,
	ReactiveList,
	ResultList,
	SelectedFilters,
	RangeInput
} from '@appbaseio/reactivesearch';
import {
	ReactiveGoogleMap,
  } from "@appbaseio/reactivemaps";
import { Tag, Icon } from 'antd';
import appbaseHelpers from '../../utils/appbaseHelpers';
import { getURL } from '../../../../constants/config';

const { ResultListWrapper } = ReactiveList;

const renderFilters = (fields) => {
	if (fields && fields.length) {
		return fields.map((field) => {
			switch (field) {
                case 'magnitude': {
                    return (
                        <RangeSlider
                            componentId={field}
                            dataField={field}
                            key={field}
                            title="Magnitude"
                            filterLabel="Magnitude"
                            showHistogram={true}
                            rangeLabels={{
                                start: '0',
                                end: '10',
                            }}
                        />
                    );
                }
                case 'year': {
                    return (
                        <RangeInput
                            componentId={field}
                            dataField={field}
                            key={field}
                            title="Year"
                            filterLabel="Year"
                            showHistogram={true}
                            range={{
                                start: 1950,
                                end: 2021,
                            }}
                        />
                    );
                }
                case 'place': {
                    return (
                        <MultiList
                            key={field}
                            componentId={field}
                            dataField={field}
                            title="Place"
                            size={15}
                            sortBy="count"
                            react={{
                                and: ['search', 'year', 'magnitude'],
                            }}
                            showSearch={false}
                            filterLabel="Place"
                        />
                    );
                }
				default:
					return null;
			}
		});
	}
	return null;
};

const getFields = (fields, suffix) => {
	let newFields = [];
	fields.forEach((item) => {
		suffix.forEach((str) => {
			newFields = [...newFields, `${item}${str}`];
		});
	});
	return newFields;
};

const getWeights = (fields) => {
	const weights = {
		place: 10,
		'place.raw': 10,
		'place.search': 2,
	};

	return fields.map((item) => weights[item]);
};

const renderResultList = () => {
	const mapProps = {
		dataField: "location",
		defaultMapStyle: "Light Monochrome",
		title: "Reactive Maps",
		defaultZoom: 13,
		react: {
		  and: "places"
		},
		onPopoverClick: item => <div>{item.place}</div>,
		showMapStyles: true,
		renderData: result => {
		  console.log(result);
		  return {
			label: <div>{result.magnitude}</div>
		  };
		}
	};
	return (
	<div style={{margin: 10}}>
		<ReactiveGoogleMap componentId="googleMap" {...mapProps} />
	</div>
	);
};

const renderJSONList = () => (
	<ReactiveList
		componentId="results"
		dataField="name"
		react={{
			and: ['search', 'magnitude', 'year', 'place'],
		}}
		size={4}
		renderItem={(res) => (
			<pre
				key={res._id}
				style={{
					background: 'rgba(239,239,239,.4)',
					padding: '15px 20px',
					color: '#424242',
					borderRadius: '5px',
				}}
			>
				{JSON.stringify(res, null, 2)}
			</pre>
		)}
		className="right-col"
		innerClass={{
			listItem: 'list-item',
			resultStats: 'result-stats',
		}}
		pagination
		stream
	/>
);

const renderCode = (lib) => {
	switch (lib) {
		case 'react':
			return renderResultList();
		case 'raw_json':
			return renderJSONList();
		default:
			return renderResultList();
	}
};

export default class GeoSearchApp extends Component {
	constructor(props) {
		super(props);

		this.appConfig = appbaseHelpers.appConfig();
	}

	render() {
		const { facets, fields: fieldsProp, ui } = this.props;
		const fields = getFields(fieldsProp, ['', '.search']);
		const SCALR_API = getURL();
		return (
			<ReactiveBase
				{...this.appConfig}
				url={SCALR_API}
				enableAppbase
				className="search-app"
				mapKey="AIzaSyCqWUHFYNXCMlt13StFZzim5y06Yr99vRY"
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
				<header>
					<h2>
						The Geo Data{' '}
						<span role="img" aria-label="books">
							🌎
						</span>
					</h2>
				</header>

				{/* <SelectedFilters style={{ marginTop: 20 }} /> */}

				<div className={facets && facets.length ? 'multi-col' : ''}>
					<div className="left-col">{renderFilters(facets)}</div>
					{renderCode(ui)}
				</div>
			</ReactiveBase>
		);
	}
}

GeoSearchApp.propTypes = {
	facets: PropTypes.array,
	fields: PropTypes.array,
	ui: PropTypes.string,
};

GeoSearchApp.defaultProps = {
	facets: [],
	fields: [],
	ui: undefined,
};
