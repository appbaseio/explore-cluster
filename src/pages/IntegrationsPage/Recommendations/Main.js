import React, { useState } from 'react';
import { Tabs, Affix } from 'antd';
import SettingsTab from '../tabs/Settings';
import RecommendationsTab from '../tabs/Recommendations';
import ChoosePlatformTab from '../tabs/ChoosePlatform';
import { container } from '../../ResultsPage/styles';
import PreviewModal from '../PreviewModal';
import SyncStatus from '../SyncStatus';
import PreferencesFormWrapper from '../PreferencesFormWraper';
import SavePreferences from '../SavePreferences';
import ResetPreferences from '../ResetPreferences';

const { TabPane } = Tabs;

const Main = () => {
	const [activeTab, handleTabChange] = useState('1');
	const [widgetInfo, handleWidgetInfo] = useState(false);
	const isSettingsTabActive = activeTab === '3';
	const isRecommendationsTabActive = activeTab === '2';
	return (
		<PreferencesFormWrapper isRecommendation>
			{({ getPreferences, getPreferencesPayload, form }) => (
				<>
					<SyncStatus form={form} />
					<div
						style={{ backgroundColor: '#fff', padding: '10px 20px' }}
						className={container}
					>
						<Tabs
							onChange={handleTabChange}
							defaultActiveKey="1"
							style={{ minHeight: 500 }}
						>
							<TabPane tab="E-Commerce Platform" key="1">
								<ChoosePlatformTab />
							</TabPane>
							<TabPane tab="Recommendations UI" key="2">
								<RecommendationsTab
									onChangeEdit={handleWidgetInfo}
									getPreferences={getPreferences}
								/>
							</TabPane>
							<TabPane tab="Settings" key="3">
								<SettingsTab />
							</TabPane>
						</Tabs>
						<Affix
							offsetBottom={0}
							style={{
								backgroundColor: '#fff',
								padding: '15px 10px',
								width: 'calc(100% - 50px)',
							}}
						>
							<div className="flex space-between card-footer">
								<div>
									{((isRecommendationsTabActive && widgetInfo) ||
										isSettingsTabActive) && (
										<PreviewModal
											isRecommendation
											preferences={getPreferences}
											label="Settings Preview"
											{...widgetInfo}
										/>
									)}
								</div>
								<div>
									<ResetPreferences isRecommendation />
									<SavePreferences
										isRecommendation
										getPreferencesPayload={getPreferencesPayload}
									/>
								</div>
							</div>
						</Affix>
					</div>
				</>
			)}
		</PreferencesFormWrapper>
	);
};

export default Main;
