import React from 'react';
import { Tabs } from 'antd';
import { container } from '../ResultsPage/styles';
import PreferencesFormWrapper from '../IntegrationsPage/PreferencesFormWraper';
import SyncStatus from '../IntegrationsPage/SyncStatus';
import PopularSuggestions from './PopularSuggestions/index';
import RecentSuggestions from './RecentSuggestions';
import IndexSuggestions from './IndexSuggestions';

const { TabPane } = Tabs;

const SuggestionSettings = () => {
	return (
		<PreferencesFormWrapper>
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
								<RecentSuggestions />
							</TabPane>
							<TabPane tab="Index Suggestions" key="3">
								<IndexSuggestions />
							</TabPane>
						</Tabs>
					</div>
				</>
			)}
		</PreferencesFormWrapper>
	);
};

export default SuggestionSettings;
