import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Card, Divider, Skeleton } from 'antd';
import {
	getDefaultSettings,
	putSettings,
	deleteSettings,
	getSettings,
	setLocalRelevancyState,
} from '../../batteries/modules/actions';
import { allowedTiers } from '../../utils/prop-types';
import { isValidPlan } from '../../batteries/utils';
import { container } from '../ResultsPage/styles';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';

import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import SettingsOptions from './components/SettingsOptions';
import FieldsType from './components/FieldsType';
import SettingsFooter from '../../components/SettingsFooter';

const bannerDetails = {
	title: 'Aggregation Settings',
	description:
		'Aggregation Settings allows you to set the fields that should be used for aggregations (aka search facets).',
	buttonText: 'Read More',
	videoLink: 'https://youtu.be/bNhju-9mDR0',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/search/relevancy/#aggregation-settings',
};

class AggsPage extends React.Component {
	componentDidMount() {
		const {
			appName,
			getSettingsAction,
			settings,
			getDefaultSettingsAction,
			defaultSettings,
			localRelevancy,
		} = this.props;

		if (settings && !localRelevancy) {
			this.init({ ...settings });
		} else {
			getSettingsAction(appName);
		}

		if (!defaultSettings) {
			getDefaultSettingsAction();
		}
	}

	componentDidUpdate(prevProps) {
		const { settings, isLoading } = this.props;

		if (!isLoading && JSON.stringify(settings) !== JSON.stringify(prevProps.settings)) {
			this.init({ ...settings });
		}
	}

	init = (settings) => {
		const { appName, updateLocalRelevancy, localRelevancy } = this.props;
		if (!localRelevancy) {
			updateLocalRelevancy(appName, {
				...settings,
			});
		}
	};

	handleChange = (name, value) => {
		const { localRelevancy, updateLocalRelevancy, appName } = this.props;
		updateLocalRelevancy(appName, {
			...localRelevancy,
			aggregations: {
				...get(localRelevancy, `aggregations`, {}),
				[name]: value,
			},
		});
	};

	handleFieldType = ({ path, type, flattenType }) => {
		const { localRelevancy } = this.props;
		const { dataField } = get(localRelevancy, `aggregations`);
		const pathVal = get(flattenType, path) === 'text' ? `${path}.keyword` : path;

		this.handleChange('dataField', { ...dataField, [pathVal]: type });
	};

	updateToAggsField = ({ path, flattenType }) => {
		const { localRelevancy } = this.props;
		const { dataField } = get(localRelevancy, `aggregations`);
		const pathVal = get(flattenType, path) === 'text' ? `${path}.keyword` : path;

		const aggType = 'term';
		this.handleChange('dataField', { ...dataField, [pathVal]: aggType });
	};

	handleRemoveFromAggs = ({ path, flattenType }) => {
		const { localRelevancy } = this.props;
		const { dataField } = get(localRelevancy, `aggregations`);
		const pathVal = get(flattenType, path) === 'text' ? `${path}.keyword` : path;

		const clone = {
			...dataField,
		};

		delete clone[pathVal];
		this.handleChange('dataField', clone);
	};

	render() {
		const { isLoading, tier, featureSearchRelevancy, localRelevancy } = this.props;

		if (isLoading || !localRelevancy || !get(localRelevancy, `aggregations`, null)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<div className={container}>
						<Skeleton />
					</div>
				</React.Fragment>
			);
		}

		if (!isValidPlan(tier, featureSearchRelevancy)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/8ENnHVv.png"
						alt="Search Settings"
					/>
				</React.Fragment>
			);
		}
		const { sortBy, includeNullValues, size, queryFormat, dataField } = get(
			localRelevancy,
			`aggregations`,
		);

		return (
			<>
				<Banner {...bannerDetails} />
				<div className={container}>
					<Card>
						<FieldsType
							fieldTypes={dataField}
							handleDelete={this.handleRemoveFromAggs}
							handleFieldType={this.handleFieldType}
							updateToAggsField={this.updateToAggsField}
						/>
						<Divider />
						<SettingsOptions
							handleChange={this.handleChange}
							sortBy={sortBy}
							includeNullValues={includeNullValues}
							size={size}
							queryFormat={queryFormat}
						/>
					</Card>
					<SettingsFooter />
				</div>
			</>
		);
	}
}

AggsPage.propTypes = {
	appName: PropTypes.string.isRequired,
	defaultSettings: PropTypes.object,
	isLoading: PropTypes.bool,
	isUpdating: PropTypes.bool,
	resetState: PropTypes.object,
	settings: PropTypes.object,
	tier: allowedTiers,

	featureSearchRelevancy: PropTypes.bool,
	getDefaultSettingsAction: PropTypes.func.isRequired,
	getSettingsAction: PropTypes.func.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	updateLocalRelevancy: PropTypes.func.isRequired,
	localRelevancy: PropTypes.object,
};

AggsPage.defaultProps = {
	localRelevancy: null,
	isUpdating: false,
	settings: null,
	resetState: {},
	defaultSettings: null,
	isLoading: false,
	tier: undefined,
	featureSearchRelevancy: false,
};

const mapStateToProps = (state) => {
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy.${appName}`, null);
	return {
		appName,
		defaultSettings,
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
		isLoading: get(state, '$getAppSettings.isFetching'),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		resetState: get(state, '$getAppSettings.default', {}),
		settings: get(state, ['$getAppSettings', 'settings', appName], defaultSearchSettings),
		tier: get(state, '$getAppPlan.results.tier'),
		localRelevancy,
	};
};

const mapDispatchToProps = (dispatch) => ({
	deleteSettingsAction: (name) => dispatch(deleteSettings(name)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(AggsPage));
