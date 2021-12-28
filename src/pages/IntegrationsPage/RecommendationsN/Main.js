import React, { useState } from 'react';
import { Tabs, Affix } from 'antd';
import { func, string } from 'prop-types';
import SettingsTab from '../tabs/Settings';
import General from '../tabs/General';
import RecommendationsTab from '../tabs/Recommendations';
import ChoosePlatformTab from '../tabs/ChoosePlatform';
import { container } from '../../ResultsPage/styles';
import PreviewModal from '../PreviewModal';
import SyncStatus from '../SyncStatus';
import PreferencesFormWrapper from '../PreferencesFormWrapperN';
import SavePreferences from '../SavePreferencesN';

const { TabPane } = Tabs;

const Main = ({ closeForm, preferenceId }) => {
	const [activeTab, handleTabChange] = useState('1');
	const [widgetInfo, handleWidgetInfo] = useState(false);
	const isSettingsTabActive = activeTab === '3';
	const isRecommendationsTabActive = activeTab === '2';
	return (
		<PreferencesFormWrapper closeForm={closeForm} preferenceId={preferenceId} isRecommendation>
			{({ getPreferences, getPreferencesPayload, form }) => {
				const pipeline = form.get('pipeline') ? form.get('pipeline').value : null;
				return (
					<>
						{pipeline ? <SyncStatus form={form} pipeline={pipeline} /> : null}
						<div
							style={{ backgroundColor: '#fff', padding: '10px 20px' }}
							className={container}
						>
							<Tabs
								onChange={handleTabChange}
								defaultActiveKey="1"
								style={{ minHeight: 500 }}
							>
								<TabPane tab="General" key="1">
									<General />
								</TabPane>
								<TabPane tab="E-Commerce Platform" key="2">
									<ChoosePlatformTab pipeline={pipeline} />
								</TabPane>
								<TabPane tab="Recommendations UI" key="3">
									<RecommendationsTab
										pipeline={pipeline}
										onChangeEdit={handleWidgetInfo}
										getPreferences={getPreferences}
									/>
								</TabPane>
								<TabPane tab="Settings" key="4">
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
												pipeline={pipeline}
												preferences={getPreferences}
												label="Settings Preview"
												{...widgetInfo}
											/>
										)}
									</div>
									<div>
										<SavePreferences
											closeForm={closeForm}
											preferenceId={preferenceId}
											isRecommendation
											form={form}
											getPreferencesPayload={getPreferencesPayload}
										/>
									</div>
								</div>
							</Affix>
						</div>
					</>
				);
			}}
		</PreferencesFormWrapper>
	);
};

Main.defaultProps = {
	preferenceId: null,
};

Main.propTypes = {
	closeForm: func.isRequired,
	preferenceId: string,
};

export default Main;
