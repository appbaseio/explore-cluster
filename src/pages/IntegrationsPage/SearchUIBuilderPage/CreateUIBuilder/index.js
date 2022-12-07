/*
	route: /cluster/search-builder/new
*/
import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FieldGroup } from 'react-reactive-form';
import { object } from 'prop-types';
import Container from '../../../../components/Container';
import PreferencesFormWrapperN from '../../PreferencesFormWrapperN';
import SearchTemplate from './SearchTemplate';
import ConfigureConnection from './ConfigureConnection';
import SearchUI from './SearchUI/Index';
import Footer from './Footer';

const { TabPane } = Tabs;

const Wizard = ({ history, match }) => {
	const [activeKey, setActiveKey] = useState('1');
	const [tabsValidated, setTabsValidated] = useState({
		tab1: false,
		tab2: false,
		tab3: false,
	});

	const isNew = () => {
		if (match.params.id === 'new' || match.path.split('/').pop() === 'new') return true;
		return false;
	};

	const closeForm = () => {
		history.push('/cluster/search-builder');
	};

	const preferenceId = isNew() ? uuidv4() : match.params.id;
	return (
		<Container>
			<Card style={{ minHeight: '100vh' }}>
				<PreferencesFormWrapperN closeForm={closeForm} preferenceId={preferenceId} isWizard>
					{/* eslint-disable-next-line */}
					{({ getPreferences, getPreferencesPayload, form }) => {
						const pipeline = form.get('pipeline') ? form.get('pipeline').value : null;

						return (
							<>
								<Tabs
									defaultActiveKey="1"
									style={{ minHeight: '100%' }}
									onChange={(key) => setActiveKey(key)}
									activeKey={activeKey}
								>
									<TabPane tab="Pick a search template" key="1">
										<FieldGroup
											control={form}
											strict={false}
											render={() => (
												<SearchTemplate
													tabsValidated={tabsValidated}
													setTabsValidated={setTabsValidated}
												/>
											)}
										/>
									</TabPane>
									<TabPane
										tab="Configure connection"
										key="2"
										disabled={!tabsValidated.tab1}
									>
										<FieldGroup
											control={form}
											strict={false}
											render={({ value }) => (
												<ConfigureConnection
													tabsValidated={tabsValidated}
													setTabsValidated={setTabsValidated}
													control={form}
													formValue={value}
												/>
											)}
										/>
									</TabPane>
									<TabPane tab="Search UI" key="3" disabled={!tabsValidated.tab2}>
										<FieldGroup
											control={form}
											strict={false}
											render={() => (
												<SearchUI
													pipeline={pipeline}
													tabsValidated={tabsValidated}
													setTabsValidated={setTabsValidated}
													preferences={getPreferencesPayload()}
													form={form}
												/>
											)}
										/>
									</TabPane>
								</Tabs>
								<Footer
									form={form}
									pipeline={pipeline}
									activeKey={activeKey}
									tabsValidated={tabsValidated}
									setActiveKey={setActiveKey}
									preferenceId={preferenceId}
									getPreferences={getPreferences}
									getPreferencesPayload={getPreferencesPayload}
								/>
							</>
						);
					}}
				</PreferencesFormWrapperN>
			</Card>
		</Container>
	);
};

Wizard.propTypes = {
	history: object.isRequired,
	match: object.isRequired,
};

export default withRouter(Wizard);
