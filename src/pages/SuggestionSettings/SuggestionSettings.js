import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { container } from '../ResultsPage/styles';
import PopularSuggestions from './PopularSuggestions/index';
import RecentSuggestions from './RecentSuggestions';
import IndexSuggestions from './IndexSuggestions';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import Loader from '../../components/Loader';
import { isValidPlan } from '../../batteries/utils';
import { saveRecentRoute } from '../../actions';
import NoIndex from '../NoIndexPage/NoIndex';
import { clearSearchState } from '../../batteries/modules/actions';

const { TabPane } = Tabs;

const bannerDetails = {
	title: 'Suggestions',
	description:
		'GUI to manage preferences for Suggestion Settings. Configure the defaults for your autosuggestions (popular, recent, and index based).',
	buttonText: 'Read Docs',
	icon: 'info-circle',
	href: 'https://docs.appbase.io/docs/search/relevancy/#suggestions',
};

const SuggestionSettings = ({
	tier,
	featureSuggestions,
	isFetching,
	isCreating,
	updateRecentRoute,
	history,
	apps,
	appName,
	hasJSON,
	clearState,
}) => {
	const [creating, setCreating] = useState(isCreating);

	useEffect(() => {
		return () => {
			clearState();
		};
	}, []);

	useEffect(() => {
		if (!isCreating && creating) {
			updateRecentRoute(window.location.pathname);
			history.push('/');

			if (hasJSON === 'sample') {
				history.push(`app/${appName}/import?load-data=true`);
			} else if (hasJSON) {
				history.push(`app/${appName}/import`);
			} else {
				history.push(`app/${appName}`);
			}
		} else {
			setCreating(isCreating);
		}
	}, [isCreating]);

	if (!isValidPlan(tier, featureSuggestions)) {
		return (
			<React.Fragment>
				<Banner {...bannerDetails} />
				<Overlay
					style={{
						maxWidth: '70%',
					}}
					src="https://i.imgur.com/c6P8eN8.png"
					alt="analytics"
				/>
			</React.Fragment>
		);
	}
	if (
		apps &&
		Object.keys(apps)?.filter((i) => !i.startsWith('.') && !i.startsWith('metricbeat'))
			?.length &&
		!isFetching
	) {
		return (
			<>
				<Banner {...bannerDetails} />
				<div
					className={container}
					style={{ backgroundColor: '#fff', padding: '10px 20px', marginBottom: 100 }}
				>
					<Tabs defaultActiveKey="1" style={{ minHeight: 500 }}>
						<TabPane
							tab="Popular Suggestions"
							key="1"
							data-cy="popular-suggestions-tab"
						>
							<PopularSuggestions />
						</TabPane>
						<TabPane tab="Recent Suggestions" key="2" data-cy="recent-suggestions-tab">
							<RecentSuggestions hide />
						</TabPane>
						<TabPane tab="Index Suggestions" key="3" data-cy="index-suggestions-tab">
							<IndexSuggestions hide />
						</TabPane>
					</Tabs>
				</div>
			</>
		);
	}
	if (!isFetching) {
		return <NoIndex view="Suggestion Settings" />;
	}
	return <Loader />;
};

SuggestionSettings.propTypes = {
	tier: PropTypes.string,
	featureSuggestions: PropTypes.bool,
	apps: PropTypes.object,
	isFetching: PropTypes.bool,
	isCreating: PropTypes.bool.isRequired,
	updateRecentRoute: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
	appName: PropTypes.string,
	hasJSON: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
	clearState: PropTypes.func,
};

SuggestionSettings.defaultProps = {
	tier: undefined,
	featureSuggestions: false,
	apps: {},
	isFetching: false,
	appName: '',
	clearState: () => {},
};

const mapStateToProps = (state) => ({
	apps: get(state, 'apps.data', {}),
	isFetching: get(state, 'apps.isFetching', false),
	tier: get(state, '$getAppPlan.results.tier'),
	featureSuggestions: get(state, '$getAppPlan.results.feature_suggestions', false),
	isCreating: get(state, 'createdApp.isLoading', false),
	appName: get(state, 'createdApp.data.appName'),
	hasJSON: get(state, 'createdApp.data.hasJSON'),
});

const mapDispatchToProps = (dispatch) => ({
	updateRecentRoute: (routeName) => dispatch(saveRecentRoute(routeName)),
	clearState: () => dispatch(clearSearchState()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SuggestionSettings));
