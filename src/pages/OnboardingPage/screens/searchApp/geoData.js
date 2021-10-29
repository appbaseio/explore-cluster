import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import {
	RangeSlider,
	MultiList,
	DataSearch,
	ReactiveBase,
	ReactiveList,
	SelectedFilters,
	RangeInput
} from '@appbaseio/reactivesearch';
import {
	ReactiveGoogleMap,
  } from "@appbaseio/reactivemaps";
  import { notification } from 'antd';
import appbaseHelpers from '../../utils/appbaseHelpers';
import { putSettings, getSettings } from '../../../../batteries/modules/actions';
import { getURL } from '../../../../constants/config';

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
                                start: '0.0 Richter',
                                end: '10.0 Richter',
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
                            dataField="place.keyword"
                            title="Places"
							filterLabel="Places"
                            size={15}
                            sortBy="count"
                            react={{
                                and: ['search', 'year', 'magnitude'],
                            }}
                            showSearch={false}
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
		defaultZoom: 6,
		size: 10,
		react: {
		  and: ['place', 'search']
		},
		onPopoverClick: item => <div>{item.place}</div>,
		showMapStyles: true,
		renderData: (result) => ({
			custom: (
			  <div
				style={{
				  background: "dodgerblue",
				  color: "#fff",
				  paddingLeft: 5,
				  paddingRight: 5,
				  borderRadius: 3,
				  padding: 10
				}}
			  >
				<i className="fas fa-globe-europe" />
				&nbsp;{result.magnitude}
			  </div>
			)
		})
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

class GeoSearchApp extends Component {
	constructor(props) {
		super(props);
		this.appConfig = appbaseHelpers.appConfig();
	}

	componentDidMount() {
		const {settings, fetchSearchSettings, app, fields: fieldsProp} = this.props;
		if (!settings) {
			fetchSearchSettings(app);
		} else {
			const fields = getFields(fieldsProp, ['', '.search']);
			this.updateAppSettings(fields);
		}
	}

	updateAppSettings = async(fields) => {
		const { settings, app, updateSettingsAction } = this.props;
		const dataField = [...fields];
		const fieldWeights = getWeights(fields);
		const newSettings = { ...settings };

		const settingsData = {
			...newSettings,
			search: {
				...newSettings?.search,
				fieldWeights,
				dataField,
			},
			aggregations: {
				...newSettings?.aggregations,
				dataField: {
					"place.keyword":"term",
					"magnitude":"range",
					"year":"range"
				}
			}
		}
		try {
			const savedSettings = await updateSettingsAction(app, settingsData);
			if (savedSettings && savedSettings.error) {
				notification.error({
					message: 'Failed to save Search Settings',
					description: get(savedSettings, 'error.message'),
				});
			}
		} catch (err) {
			notification.error({
				message: 'Failed to save Search Settings',
				description: err.message,
			});
		}
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
				<header>
					<h2>
						The Geo Data{' '}
						<span role="img" aria-label="books">
							🌎
						</span>
					</h2>
					<DataSearch
						componentId="search"
						dataField={fields}
						showIcon={false}
						placeholder="Search for places..."
						autosuggest={false}
						filterLabel="Search"
						fieldWeights={getWeights(fields)}
						highlight
						style={{
							maxWidth: "400px",
							margin: "0 auto"
						}}
					/>
				</header>

				<SelectedFilters style={{ marginTop: 20 }} showClearAll={false}/>

				<div className={facets && facets.length ? 'multi-col' : ''}>
					<div className="left-col">{renderFilters(facets)}</div>
					<div style={{width: facets && facets.length ? '70%' : '100%'}}>{renderCode(ui)}</div>
				</div>
			</ReactiveBase>
		);
	}
}

GeoSearchApp.propTypes = {
	facets: PropTypes.array,
	fields: PropTypes.array,
	ui: PropTypes.string,
	fetchSearchSettings: PropTypes.func.isRequired,
	settings: PropTypes.object,
	credentials: PropTypes.string.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	app: PropTypes.string.isRequired,
};

GeoSearchApp.defaultProps = {
	facets: [],
	fields: [],
	ui: undefined,
	settings: null,
};

const mapStateToProps = (state, props) => {

	const { username, password } = get(state, 'user.data', {});
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const settings = get(state, ['$getAppSettings', 'settings', props.app], defaultSettings);
	return {
		settings,
		fetchingDefaultSettings: get(state.$getAppSettings, `default.loading`),
		credentials: username ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchSearchSettings: (appName) => dispatch(getSettings(appName)),
	updateSettingsAction: (appName, payload) => dispatch(putSettings(appName, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GeoSearchApp);
