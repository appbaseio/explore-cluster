/*
	route: /cluster/recommendations-builder/:id
*/

import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Tabs, Affix } from 'antd';
import { string, object, bool } from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import SettingsTab from '../shared/tabs/Settings';
import General from '../shared/tabs/General';
import RecommendationsTab from '../shared/tabs/Recommendations';
import { container } from '../../ResultsPage/styles';
import PreviewModal from '../shared/PreviewModal';
import SyncStatus from '../shared/SyncStatus';
import PreferencesFormWrapper from '../shared/PreferencesFormWrapper';
import SavePreferences from '../shared/SavePreferences';

const { TabPane } = Tabs;

const bannerDetailsPaid = {
	title: 'Recommendations UI Builder',
	description:
		'Build a WYSIWYG recommendations UI that can be installed to any E-Commerce platform or to your own site.',
	buttonText: 'Read Docs',
	href: 'http://docs.reactivesearch.io/docs/reactivesearch/ui-builder/recommendations/',
};

const RecommendationsUIForm = ({ tier, featureEcommerce, ...props }) => {
	const [activeTab, handleTabChange] = useState('1');
	const [widgetInfo, handleWidgetInfo] = useState(false);
	const isSettingsTabActive = activeTab === '3';
	const isRecommendationsTabActive = activeTab === '2';
	const preferenceId = props.match.params.id === 'new' ? uuidv4() : props.match.params.id;

	const closeForm = () => {
		props.history.push('/cluster/recommendations-builder');
	};

	return (
		<div>
			<Banner {...bannerDetailsPaid} />
			<PreferencesFormWrapper
				closeForm={closeForm}
				preferenceId={preferenceId}
				isRecommendation
			>
				{({ getPreferences, getPreferencesPayload, form }) => {
					const pipeline = form.get('pipeline') ? form.get('pipeline').value : null;
					return (
						<>
							{pipeline ? (
								<SyncStatus form={form} pipeline={pipeline} isRecommendation />
							) : null}
							<div
								style={{ backgroundColor: '#fff', padding: '10px 20px' }}
								className={container}
							>
								<Tabs
									onChange={handleTabChange}
									defaultActiveKey="1"
									style={{ minHeight: 500 }}
									destroyInactiveTabPane
								>
									<TabPane tab="General" key="1">
										<General isRecommendation />
									</TabPane>

									<TabPane tab="Recommendations UI" key="2">
										<RecommendationsTab
											pipeline={pipeline}
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
		</div>
	);
};

RecommendationsUIForm.defaultProps = {
	preferenceId: null,
	featureEcommerce: false,
};

RecommendationsUIForm.propTypes = {
	preferenceId: string,
	history: object.isRequired,
	match: object.isRequired,
	tier: string.isRequired,
	featureEcommerce: bool,
};

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	featureEcommerce: get(state, '$getAppPlan.results.feature_ecommerce', false),
});

export default connect(mapStateToProps, null)(withRouter(RecommendationsUIForm));
