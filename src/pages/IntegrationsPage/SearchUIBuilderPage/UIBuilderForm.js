/*
	route: /cluster/search-builder/:id
*/

import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import { connect } from 'react-redux';

import {
	AppstoreOutlined,
	DatabaseOutlined,
	LoadingOutlined,
	SettingOutlined,
	UnlockOutlined,
} from '@ant-design/icons';

import { Tabs, Affix, Button } from 'antd';
import { FieldGroup } from 'react-reactive-form';
import { object, array, func } from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import { container } from '../../ResultsPage/styles';
import Loader from '../../../components/Loader';
import PreviewModal from '../PreviewModal';
import SyncStatus from '../SyncStatus';
import PreferencesFormWrapper from '../PreferencesFormWrapperN';
import SavePreferences from '../SavePreferencesN';
import { getSearchPreferencesN } from '../../../batteries/modules/actions';

import EndUserAuthentication from './components/tabs/EndUserAuthentication';
import LayoutTab from './components/tabs/Layout';
import SearchTab from './components/tabs/Search';
import General from '../tabs/General';
import DomainSettingsTab from './components/tabs/DomainSettings';

const { TabPane } = Tabs;

const bannerDetailsPaid = {
	title: 'Search UI Builder',
	description:
		'Build a WYSIWYG storefront search preview that can be installed to your favorite E-Commerce platform.',
	buttonText: 'Read Docs',
	href: 'http://docs.reactivesearch.io/docs/reactivesearch/ui-builder/search/',
};

const Main = ({ getPreferencesN, ...props }) => {
	const [componentKey, setComponentKey] = useState(1);
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
			<Banner {...bannerDetailsPaid} />
			<PreferencesFormWrapper
				key={componentKey}
				closeForm={closeForm}
				preferenceId={preferenceId}
			>
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
												<SettingOutlined style={{ margin: '0.25rem' }} />
												General
											</span>
										}
										key="1"
									>
										<General preferences={getPreferencesPayload()} />
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
												<AppstoreOutlined style={{ margin: '0.25rem' }} />
												UI Components
											</span>
										}
										key="3"
									>
										<SearchTab
											getPreferences={getPreferences}
											getPreferencesPayload={getPreferencesPayload}
											setIsEditorLoading={setIsEditorLoading}
										/>
									</TabPane>
									<TabPane
										tab={
											<span>
												<UnlockOutlined style={{ margin: '0.25rem' }} />
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
												<DatabaseOutlined style={{ margin: '0.25rem' }} />
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
																<LoadingOutlined
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
												remountComponent={() =>
													setComponentKey(componentKey + 1)
												}
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
	getPreferencesN: func.isRequired,
	searchPreferences: array.isRequired,
};

Main.defaultProps = {};

const mapStateToProps = (state) => ({
	searchPreferences: get(state, '$getSearchPreferencesN.results', []),
});

const mapDispatchToProps = (dispatch) => ({
	getPreferencesN: () => dispatch(getSearchPreferencesN()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Main));
