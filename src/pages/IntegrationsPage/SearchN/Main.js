import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Tabs, Affix, Button } from 'antd';
import { FieldGroup } from 'react-reactive-form';
import { object, array, func, string, bool } from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import LayoutTab from '../tabs/Layout';
import SearchTab from '../tabs/Search';
import General from '../tabs/General';
import ChoosePlatformTab from '../tabs/ChoosePlatform';
import { container } from '../../ResultsPage/styles';
import Loader from '../../../components/Loader';
import PreviewModal from '../PreviewModal';
import SyncStatus from '../SyncStatus';
import PreferencesFormWrapper from '../PreferencesFormWrapperN';
import SavePreferences from '../SavePreferencesN';
import { getSearchPreferencesN } from '../../../batteries/modules/actions';
import { isValidPlan, features } from '../../../batteries/utils';

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

const Main = ({ tier, featureEcommerce, ...props }) => {
	const preferenceId = props.match.params.id === 'new' ? uuidv4() : props.match.params.id;
	const [isLoading, setIsLoading] = useState(true);

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
							{pipeline ? <SyncStatus form={form} pipeline={pipeline} /> : null}
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
									<TabPane tab="General" key="1">
										<General />
									</TabPane>
									<TabPane tab="E-Commerce Platform" key="2">
										<ChoosePlatformTab pipeline={pipeline} />
									</TabPane>
									<TabPane tab="Layout and Design" key="3">
										<LayoutTab />
									</TabPane>
									<TabPane tab="Search Settings" key="4">
										<SearchTab />
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
										<div className="flex">
											<PreviewModal
												pipeline={pipeline}
												preferences={getPreferences}
											/>
											<FieldGroup
												control={form}
												render={() => (
													<Button
														style={{
															marginLeft: 10,
														}}
														onClick={() => {
															props.history.push(
																`/cluster/search-builder/${preferenceId}/code`,
															);
														}}
														size="large"
													>
														Edit Code
													</Button>
												)}
											/>
										</div>
										<div>
											<SavePreferences
												form={form}
												closeForm={closeForm}
												preferenceId={preferenceId}
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
};

Main.defaultProps = {
	preferences: [],
	featureEcommerce: false,
};

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	featureEcommerce: get(state, '$getAppPlan.results.feature_ecommerce', false),
});

const mapDispatchToProps = (dispatch) => ({
	getPreferencesN: () => dispatch(getSearchPreferencesN()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Main));
