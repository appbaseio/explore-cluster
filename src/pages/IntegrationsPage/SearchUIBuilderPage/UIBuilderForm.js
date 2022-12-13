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
	SettingOutlined,
	UnlockOutlined,
} from '@ant-design/icons';
import { Tabs } from 'antd';
import { object, array, func } from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import { container } from './styles';
import Loader from '../../../components/Loader';
import SyncStatus from '../shared/SyncStatus';
import PreferencesFormWrapper from '../shared/PreferencesFormWrapper';
import { getSearchPreferences } from '../../../batteries/modules/actions';
import EndUserAuthentication from './components/tabs/EndUserAuthentication';
import LayoutTab from './components/tabs/Layout';
import UIComponents from './components/tabs/UIComponents';
import General from '../shared/tabs/General';
import DomainSettingsTab from './components/tabs/DomainSettings';
import Footer from './components/Footer';
import { getTemplate } from '../utils/index';
import UpgradeVersion from './components/UpgradeVersion';

const { TabPane } = Tabs;

const bannerDetailsPaid = {
	title: 'Search UI Builder',
	description:
		'Build a WYSIWYG storefront search preview that can be installed to your favorite E-Commerce platform.',
	buttonText: 'Read Docs',
	href: 'http://docs.reactivesearch.io/docs/reactivesearch/ui-builder/search/',
};

const Main = ({ getPreferencesN, ...props }) => {
	const [showTemplateUpdateBanner, setShowTemplateUpdateBanner] = useState(false);
	const [showNotification, setShowNotification] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditorLoading, setIsEditorLoading] = useState(false);
	const preferenceId = props.match.params.id === 'new' ? uuidv4() : props.match.params.id;

	useEffect(() => {
		getPreferencesN();
	}, []);

	const closeForm = () => {
		props.history.push('/cluster/search-builder');
	};

	const handleTemplateVersionIdChanges = (latestTemplateVersion, val) => {
		if (val !== latestTemplateVersion) setShowTemplateUpdateBanner(true);
		else setShowTemplateUpdateBanner(false);
	};

	return (
		<div>
			<Banner {...bannerDetailsPaid} />
			<PreferencesFormWrapper closeForm={closeForm} preferenceId={preferenceId}>
				{({ getPreferences, getPreferencesPayload, form }) => {
					const pipeline = form.get('pipeline') ? form.get('pipeline').value : null;
					const themeType = form.get('themeType') ? form.get('themeType').value : '';
					const templateObj = getTemplate(themeType);
					const templateVersionIdControl = form.get('templateVersionId');
					templateVersionIdControl.valueChanges.subscribe((val) => {
						if (pipeline) handleTemplateVersionIdChanges(templateObj.version, val);
					});
					const templateVersionId = templateVersionIdControl
						? templateVersionIdControl.value
						: '';
					setIsLoading(false);

					if (isLoading) {
						return <Loader />;
					}

					return (
						<>
							{templateObj.version !== templateVersionId &&
							showTemplateUpdateBanner ? (
								<UpgradeVersion
									getPreferencesPayload={getPreferencesPayload}
									preferenceId={preferenceId}
									form={form}
									templateVersionId={templateObj.version}
									setShowTemplateUpdateBanner={setShowTemplateUpdateBanner}
									setShowNotification={setShowNotification}
								/>
							) : null}
							<SyncStatus
								form={form}
								pipeline={pipeline}
								preferenceId={preferenceId}
								showTemplateUpdateBanner={showTemplateUpdateBanner}
								setShowNotification={setShowNotification}
								showNotification={showNotification}
								setShowTemplateUpdateBanner={setShowTemplateUpdateBanner}
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
										<UIComponents
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

								<Footer
									isEditorLoading={isEditorLoading}
									setIsEditorLoading={setIsEditorLoading}
									pipeline={pipeline}
									getPreferences={getPreferences}
									preferenceId={preferenceId}
									getPreferencesPayload={getPreferencesPayload}
									closeForm={closeForm}
									history={props.history}
								/>
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
	searchPreferences: get(state, '$getSearchPreferences.results', []),
});

const mapDispatchToProps = (dispatch) => ({
	getPreferencesN: () => dispatch(getSearchPreferences()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Main));
