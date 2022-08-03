import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Tabs, Affix, Button, Icon } from 'antd';
import { FieldGroup } from 'react-reactive-form';
import { object, array, func, string, bool } from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import LayoutTab from '../tabs/Layout';
import SearchTab from '../tabs/Search';
import General from '../tabs/General';
import DomainSettingsTab from '../tabs/DomainSettings';
import { container } from '../../ResultsPage/styles';
import Loader from '../../../components/Loader';
import PreviewModal from '../PreviewModal';
import SyncStatus from '../SyncStatus';
import PreferencesFormWrapper from '../PreferencesFormWrapperN';
import SavePreferences from '../SavePreferencesN';
import PageRoutes from '../PageRoutes';
import { getSearchPreferencesN } from '../../../batteries/modules/actions';
import { isValidPlan, features } from '../../../batteries/utils';
import EndUserAuthentication from '../tabs/EndUserAuthentication';

const { TabPane } = Tabs;

const bannerDetails = {
	title: 'Search UI Builder',
	description:
		'Build a WYSIWYG storefront search preview that can be installed to your favorite E-Commerce platform.',
	icon: 'info-circle',
};

const bannerDetailsPaid = {
	title: 'Search UI Builder',
	description:
		'Build a WYSIWYG storefront search preview that can be installed to your favorite E-Commerce platform.',
	buttonText: 'Read Docs',
	href: 'http://docs.appbase.io/docs/reactivesearch/ui-builder/search/',
};

const Main = ({ tier, featureEcommerce, getPreferencesN, ...props }) => {
	useEffect(() => {
		getPreferencesN();
	}, []);

	const preferenceId = props.match.params.id === 'new' ? uuidv4() : props.match.params.id;
	const [isLoading, setIsLoading] = useState(true);
	const [isEditorLoading, setIsEditorLoading] = useState(false);

	const closeForm = () => {
		props.history.push('/cluster/search-builder');
	};

	return (
		<div>
			{!isValidPlan(tier, featureEcommerce, features.UI_BUILDER) ? (
				<Banner {...bannerDetails} />
			) : (
				<Banner {...bannerDetailsPaid} />
			)}
			<PreferencesFormWrapper closeForm={closeForm} preferenceId={preferenceId}>
				{({ getPreferences, getPreferencesPayload, form }) => {
					const pipeline = form.get('pipeline') ? form.get('pipeline').value : null;
					setIsLoading(false);

					if (isLoading) {
						return <Loader />;
					}
					return (
						<>
							<SyncStatus
								form={form}
								pipeline={pipeline}
								preferenceId={preferenceId}
							/>
							<div
								style={{
									backgroundColor: '#fff',
									padding: '10px 20px',
								}}
								className={container}
							>
								<Tabs
									defaultActiveKey="1"
									style={{ minHeight: 500 }}
									destroyInactiveTabPane
								>
									<TabPane
										tab={
											<span>
												<Icon type="setting" />
												General
											</span>
										}
										key="1"
									>
										<General />
									</TabPane>
									<TabPane
										tab={
											<span>
												<img
													alt="theme-icon"
													width={15}
													src="/static/images/theme-icon.svg"
													style={{ marginRight: 8 }}
												/>
												Theme
											</span>
										}
										key="2"
									>
										<LayoutTab />
									</TabPane>
									<TabPane
										tab={
											<span>
												<Icon type="appstore" />
												UI Components
											</span>
										}
										key="3"
									>
										<SearchTab getPreferencesPayload={getPreferencesPayload} />
									</TabPane>
									<TabPane
										tab={
											<span>
												<Icon type="unlock" />
												End-user Authentication
											</span>
										}
										key="4"
									>
										<EndUserAuthentication />
									</TabPane>
									<TabPane
										tab={
											<span>
												<Icon type="database" />
												Domain
											</span>
										}
										key="5"
									>
										<DomainSettingsTab preferenceId={preferenceId} />
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
										<div className="flex" style={{ gap: 10 }}>
											<FieldGroup
												control={form}
												strict={false}
												render={() => (
													<PageRoutes
														getPreferencesPayload={
															getPreferencesPayload
														}
														preferences={getPreferences()}
														form={form}
														setIsEditorLoading={setIsEditorLoading}
													/>
												)}
											/>

											<PreviewModal
												pipeline={pipeline}
												preferences={getPreferences}
												preferenceId={preferenceId}
												form={form}
												getPreferencesPayload={getPreferencesPayload}
												isEditorLoading={isEditorLoading}
												setIsEditorLoading={setIsEditorLoading}
											/>
											<FieldGroup
												control={form}
												strict={false}
												render={() => (
													<Button
														onClick={() => {
															props.history.push(
																`/cluster/search-builder/${preferenceId}/code`,
															);
														}}
														disabled={isEditorLoading}
														size="large"
													>
														<div className="button-label">
															{isEditorLoading ? (
																<Icon
																	type="loading"
																	style={{ marginRight: 5 }}
																/>
															) : (
																<img
																	alt="code-icon"
																	width={15}
																	src="/static/images/code-icon.svg"
																/>
															)}
															Code Editor
														</div>
													</Button>
												)}
											/>
										</div>
										<div>
											<SavePreferences
												form={form}
												closeForm={closeForm}
												preferenceId={preferenceId}
												getPreferences={getPreferences}
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

Main.propTypes = {
	history: object.isRequired,
	match: object.isRequired,
	preferences: array,
	getPreferencesN: func.isRequired,
	tier: string.isRequired,
	featureEcommerce: bool,
	searchPreferences: array.isRequired,
};

Main.defaultProps = {
	preferences: [],
	featureEcommerce: false,
};

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	searchPreferences: get(state, '$getSearchPreferencesN.results', []),
	featureEcommerce: get(state, '$getAppPlan.results.feature_ecommerce', false),
});

const mapDispatchToProps = (dispatch) => ({
	getPreferencesN: () => dispatch(getSearchPreferencesN()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Main));
