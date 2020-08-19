import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Skeleton, Card, Divider } from 'antd';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import {
	getDefaultSettings,
	getSettings,
	putSettings,
	deleteSettings,
} from '../../batteries/modules/actions';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { isValidPlan } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import { container } from '../ResultsPage/styles';
import FieldsType from './components/FieldsType';

const bannerDetails = {
	title: 'Aggregation Settings',
	description:
		'Aggregation Settings allows you to set the fields that should be used for aggregations (aka search facets).',
	buttonText: 'Read More',
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
		} = this.props;

		if (settings) {
			this.init(settings);
		} else {
			getSettingsAction(appName);
		}

		if (!defaultSettings) {
			getDefaultSettingsAction();
		}
	}

	init = (settings) => {

	}

	render() {
		const { isLoading, tier, featureSearchRelevancy } = this.props;

		if (isLoading) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<div className={container}>
						<Card>
							<Skeleton />
						</Card>
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
		return (
			<React.Fragment>
				<Banner {...bannerDetails} />
				<div className={container}>
					<Card>
						<FieldsType />
						<Divider />
					</Card>
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => {
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;
	const { username, password } = get(state, 'user.data', {});
	const appName = get(state, '$getCurrentApp.name');
	return {
		appName,
		credentials: username ? `${username}:${password}` : null,
		defaultSettings,
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
		isLoading: get(state, '$getAppSettings.isFetching'),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		resetState: get(state, '$getAppSettings.default', {}),
		settings: get(state, ['$getAppSettings', 'settings', appName], defaultSearchSettings),
		tier: get(state, '$getAppPlan.results.tier'),
	};
};

const mapDispatchToProps = (dispatch) => ({
	deleteSettingsAction: (name) => dispatch(deleteSettings(name)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(AggsPage));
