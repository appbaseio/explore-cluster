import React from 'react';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import { container } from '../ResultsPage/styles';
import PopularSuggestions from './PopularSuggestions/index';
import RecentSuggestions from './RecentSuggestions';
import IndexSuggestions from './IndexSuggestions';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { isValidPlan } from '../../batteries/utils';
import get from 'lodash/get';

const { TabPane } = Tabs;

const bannerDetails = {
	title: 'Suggestions',
	description:
		'GUI to manage preferences for Suggestion Settings. Suggestion Settings are stored in the .suggestions index by appbase.io based on the analytics data of what end users are searching for.',
	buttonText: 'Read more',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/search/relevancy/#popular-suggestions',
};

const SuggestionSettings = ({ tier, featureSuggestions }) => {

	if (!isValidPlan(tier, featureSuggestions )) {
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

	return (
		<>
			<Banner {...bannerDetails} />
			{/* <PreferencesFormWrapper>
				{({ form }) => (
					<>
						<SyncStatus form={form} />
						<div
							style={{ backgroundColor: '#fff', padding: '10px 20px' }}
							className={container}
						>
							<Tabs defaultActiveKey="1" style={{ minHeight: 500 }}>
								<TabPane tab="Popular Suggestions" key="1">
									<PopularSuggestions hide />
								</TabPane>
								<TabPane tab="Recent Suggestions" key="2">
									<RecentSuggestions hide />
								</TabPane>
								<TabPane tab="Index Suggestions" key="3">
									<IndexSuggestions hide/>
								</TabPane>
							</Tabs>
						</div>
					</>
				)}
			</PreferencesFormWrapper> */}
			<div
							style={{ backgroundColor: '#fff', padding: '10px 20px' }}
							className={container}
						>
							<Tabs defaultActiveKey="1" style={{ minHeight: 500 }}>
								<TabPane tab="Popular Suggestions" key="1">
									<PopularSuggestions hide />
								</TabPane>
								<TabPane tab="Recent Suggestions" key="2">
									<RecentSuggestions hide />
								</TabPane>
								<TabPane tab="Index Suggestions" key="3">
									<IndexSuggestions hide/>
								</TabPane>
							</Tabs>
						</div>
		</>
	);
};

SuggestionSettings.defaultProps = {
	tier: undefined,
	featureSuggestions: false,
};

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	featureSuggestions: get(state, '$getAppPlan.results.feature_suggestions', false),
});


export default connect(mapStateToProps, null)(SuggestionSettings);
