import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ClusterOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Layout, Menu, Tag } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';

import { isEqual } from 'lodash';
// eslint-disable-next-line import/no-cycle
import AppLayout from '../../components/AppLayout';
import {
	getDefaultSettings,
	getSettings,
	putSettings,
	setCurrentApp,
} from '../../batteries/modules/actions';
import Logo from '../../components/Logo';
import { ALLOWED_ACTIONS } from '../../constants';
import { versionCompare } from '../../batteries/utils/helpers';
import { getParam, getParsedRoutes } from '../../utils';
import { setIsSidebarCollapsed } from '../../actions';
import { breakpoints } from '../../utils/media';
import Loader from '../../components/Loader';
import { features, isValidPlan, ALLOWED_ACTIONS_BY_BACKEND, BACKENDS } from '../../batteries/utils';
import SidebarAutocomplete from '../../components/SidebarAutocomplete';
import { allowedTiers } from '../../utils/prop-types';
import searchInputStyle from '../DashboardWrapper/styles';
import WithRedirectTooltip from '../../components/WithRedirectTooltip';
import ReIndexTracker from '../../components/ReIndexTracker';
import { iconMap } from '../../components/iconMap';

const { Sider } = Layout;
const { SubMenu } = Menu;

const getActiveMenu = (props, prevActiveSubMenu = [], routes = {}) => {
	let activeSubMenu = 'App Overview';
	let activeMenuItem = 'App Overview';
	let { route: pathname } = props.match.params; // eslint-disable-line

	if (!pathname) {
		pathname = getParam('view') || '';
	}

	Object.keys(routes).some((route) => {
		if (routes[route].menu) {
			const active = routes[route].menu.find((item) => pathname === item.link);

			if (active) {
				activeSubMenu = route;
				activeMenuItem = active.label;
				return true;
			}
		} else if (pathname === routes[route].link) {
			activeSubMenu = route;
			activeMenuItem = route;
			return true;
		}
		return false;
	});
	if (prevActiveSubMenu.includes(activeSubMenu)) {
		return {
			activeSubMenu: prevActiveSubMenu,
			activeMenuItem: [activeMenuItem],
		};
	}
	return {
		activeSubMenu: [activeSubMenu, ...prevActiveSubMenu],
		activeMenuItem: [activeMenuItem],
	};
};

let url;
class AppWrapper extends Component {
	constructor(props) {
		super(props);

		let showHeader = true;
		try {
			const header = JSON.parse(sessionStorage.getItem('header'));
			if (header !== undefined) {
				showHeader = header;
			}
		} catch (e) {
			console.log(e);
		}

		// const collapsed = window.innerWidth <= breakpoints.medium;
		const getActiveMenuData = getActiveMenu(props, undefined, props.routes);

		const { routes, arcVersion, backend } = props;

		let routesToSet = routes;
		if (versionCompare(arcVersion, '7.54.0') !== -1) {
			// UPDATE UI Builder route
			routesToSet = {
				...routes,
				'UI Builder': {
					icon: 'control',
					action: ALLOWED_ACTIONS.UI_BUILDER,
					menu: [
						{
							label: 'Search',
							link: '/cluster/search-builder',
							hasExactPath: true,
							tag: 'Beta',
						},
						...(backend === BACKENDS.ELASTICSEARCH.name ||
						backend === BACKENDS.OPENSEARCH.name
							? [
									{
										label: 'Recommendations',
										link: '/cluster/recommendations-builder',
										tag: 'Beta',
										hasExactPath: true,
									},
									{
										label: 'Searchbox',
										link: '/cluster/searchboxes',
										tag: 'Beta',
									},
							  ]
							: []),
						{
							label: 'End-user Authentication',
							link: '/cluster/auth-settings',
							hasExactPath: true,
							tag: 'Beta',
						},
					],
					tag: 'Beta',
				},
				...(routes['Access Control']
					? {
							'Access Control': {
								icon: 'key',
								action: 'access-control',
								menu: [
									{
										label: 'API Credentials',
										link: '/cluster/credentials',
									},
									...(backend === BACKENDS.ELASTICSEARCH.name ||
									backend === BACKENDS.OPENSEARCH.name
										? [
												{
													label: 'Role Based Access',
													link: '/cluster/role-based-access',
													tag: 'Beta',
												},
												{
													label: 'Node Sync Preferences',
													link: '/cluster/sync-preferences',
													tag: 'Beta',
												},
										  ]
										: []),
								],
							},
					  }
					: {}),
			};
		}

		this.state = {
			showHeader,
			routes: routesToSet,
			appName: props.match.params.appName, // eslint-disable-line
			value: '',
			...getActiveMenuData,
		};
	}

	static getDerivedStateFromProps(props, state) {
		const { appName } = props.match.params;
		const { currentApp } = props;
		let setActiveMenu = null;
		const { routes } = state;
		if (props.match.url !== url) {
			setActiveMenu = {
				...getActiveMenu(props, state.activeSubMenu, routes),
				url: props.match.url,
			};
		}
		({ url } = props.match);
		if (appName && appName !== state.appName) {
			return { appName, ...setActiveMenu };
		}

		if (!appName && !state.appName && currentApp) {
			// gets last used appName from redux-persist
			return { appName: currentApp, ...setActiveMenu };
		}

		if (state.collapsed) {
			return { value: '' };
		}
		return { ...setActiveMenu };
	}

	componentDidMount() {
		const { appName } = this.state;
		const { history, match, setIsCollapsed, updateCurrentApp } = this.props;

		const view = getParam('view') || '';

		updateCurrentApp(appName);
		this.handleSettings(appName);

		if (!match.params.appName && appName) {
			history.push(`/app/${appName}/${view}`);
		}

		const collapsed = window.innerWidth <= breakpoints.medium;
		setIsCollapsed(collapsed);
	}

	componentDidUpdate(prevProps) {
		const { history, currentApp, match, arcVersion, routes, backend } = this.props;
		const { appName } = this.state;
		if (
			!isEqual(routes, prevProps.routes) ||
			(arcVersion && arcVersion !== prevProps.arcVersion)
		) {
			if (versionCompare(arcVersion, '7.54.0') !== -1) {
				// UPDATE UIBuilder route
				// eslint-disable-next-line
				this.setState({
					routes: {
						...routes,
						'UI Builder': {
							icon: 'control',
							action: ALLOWED_ACTIONS.UI_BUILDER,
							menu: [
								{
									label: 'Search',
									link: '/cluster/search-builder',
									hasExactPath: true,
									tag: 'Beta',
								},
								...(backend === BACKENDS.ELASTICSEARCH.name ||
								backend === BACKENDS.OPENSEARCH.name
									? [
											({
												label: 'Recommendations',
												link: '/cluster/recommendations-builder',
												hasExactPath: true,
												tag: 'Beta',
											},
											{
												label: 'Searchbox',
												link: '/cluster/searchboxes',
												tag: 'Beta',
											}),
									  ]
									: []),
								{
									label: 'End-user Authentication',
									link: '/cluster/auth-settings',
									tag: 'Beta',
									hasExactPath: true,
								},
							],
							tag: 'Beta',
						},
						...(routes['Access Control']
							? {
									'Access Control': {
										icon: 'key',
										action: 'access-control',
										menu: [
											{
												label: 'API Credentials',
												link: '/cluster/credentials',
											},
											...(backend === BACKENDS.ELASTICSEARCH.name ||
											backend === BACKENDS.OPENSEARCH.name
												? [
														{
															label: 'Role Based Access',
															link: '/cluster/role-based-access',
															tag: 'Beta',
														},
														{
															label: 'Node Sync Preferences',
															link: '/cluster/sync-preferences',
															tag: 'Beta',
														},
												  ]
												: []),
										],
									},
							  }
							: {}),
					},
				});
			}
		}
		const route = match.params.route || '';

		if (currentApp && appName !== currentApp) {
			history.push(`/app/${currentApp}/${route}`);
		}
	}

	handleSearchTerm = (e) => {
		this.setState({
			value: e.target.value,
		});
	};

	resetSearch = () => {
		this.setState({
			value: '',
		});
	};

	handleSettings = async (appName) => {
		const {
			settings,
			defaultSettings,
			updateSettingsAction,
			getDefaultSettingsAction,
			getSettingsAction,
			tier,
			featureSearchRelevancy,
		} = this.props;
		// restrict calling API if it's not a valid plan
		if (!isValidPlan(tier, featureSearchRelevancy, features.SEARCH_RELEVANCY)) return;
		if (!settings) {
			this.setState({ loading: true });
			const settingsResponse = await getSettingsAction(appName);
			if (settingsResponse && !settingsResponse.error) {
				this.setState({ loading: false });
				return;
			}
			if (defaultSettings) {
				await updateSettingsAction(appName, defaultSettings);
			} else {
				const res = await getDefaultSettingsAction();
				if (res && res.payload) await updateSettingsAction(appName, res.payload);
			}
			this.setState({ loading: false });
		}
	};

	onCollapse = () => {
		const { setIsCollapsed, collapsed } = this.props;
		setIsCollapsed(!collapsed);
		this.setState({ activeSubMenu: [] });
	};

	render() {
		const { showHeader, appName, activeSubMenu, activeMenuItem, routes, loading, value } =
			this.state;
		const { history, collapsed, currentApp, backendImage, backend } = this.props;
		if (!currentApp) return null;

		const routesFiltered = {};

		Object.keys(routes).forEach((key) => {
			if (ALLOWED_ACTIONS_BY_BACKEND[backend].includes(routes[key].action)) {
				routesFiltered[key] = routes[key];
			}
		});

		return (
			<Layout>
				<Sider
					width={260}
					css={{
						height: '100vh',
						position: 'fixed !important',
						left: 0,
					}}
					collapsible
					collapsed={collapsed}
					onCollapse={this.onCollapse}
				>
					<Menu
						theme="dark"
						openKeys={activeSubMenu}
						selectedKeys={activeMenuItem}
						mode="inline"
						css={{
							overflow: 'auto',
							position: 'absolute',
							width: '100%',
							height: 'calc(100% - 102px)',
						}}
						onOpenChange={(param) => {
							this.setState({
								activeSubMenu: param,
							});
						}}
					>
						<Menu.Item style={{ margin: '15px auto' }}>
							<Link to="/">
								{showHeader ? ( // eslint-disable-line
									collapsed ? (
										<Logo type="small" width={20} />
									) : (
										<Logo type="white" width={160} />
									)
								) : (
									<React.Fragment>
										<ClusterOutlined />
										Cluster Overview
									</React.Fragment>
								)}
							</Link>
						</Menu.Item>

						{collapsed ? null : (
							<div className={searchInputStyle}>
								<Input
									value={value}
									onChange={this.handleSearchTerm}
									placeholder="Search for a menu item"
									suffix={<SearchOutlined />}
								/>
							</div>
						)}

						{value && (
							<SidebarAutocomplete
								history={history}
								routes={getParsedRoutes(routes)}
								value={value}
								resetAutoComplete={this.resetSearch}
							/>
						)}

						{!value &&
							Object.keys(routesFiltered).map((route) => {
								if (routes[route].menu) {
									const Title = (
										<span>
											{iconMap[routes[route].icon]}
											<span>{route}</span>
										</span>
									);
									return (
										<SubMenu key={route} title={Title}>
											{routes[route].menu.map((item) => {
												if (
													item.link.includes(
														'configure-search-engine-backend',
													) &&
													backendImage !== 'sls'
												) {
													return null;
												}
												return (
													<Menu.Item
														key={item.label}
														data-cy={`path-sub-${item.label
															.split(' ')
															.join('')}`}
													>
														<WithRedirectTooltip
															showTooltip={item.hasExactPath}
														>
															<Link
																replace
																to={
																	item.hasExactPath
																		? item.link
																		: `/app/${appName}/${item.link}`
																}
															>
																{item.label}
																{item.tag ? (
																	<Tag
																		style={{
																			fontSize: 10,
																			marginLeft: 8,
																		}}
																		color="#001529"
																	>
																		{item.tag}
																	</Tag>
																) : null}
															</Link>
														</WithRedirectTooltip>
													</Menu.Item>
												);
											})}
										</SubMenu>
									);
								}
								if (routes[route].hasExactPath) {
									return (
										<Menu.Item key={route}>
											<Link replace to={routes[route].link}>
												{iconMap[routes[route].icon]}
												<span>
													{route}
													{routes[route].tag ? (
														<Tag
															style={{
																fontSize: 10,
																marginLeft: 8,
																...(Array.isArray(activeMenuItem) &&
																activeMenuItem.includes(route) ===
																	false
																	? { border: '1px solid white' }
																	: {}),
															}}
															color="#001529"
														>
															{routes[route].tag}
														</Tag>
													) : null}
												</span>
											</Link>
										</Menu.Item>
									);
								}
								return (
									<Menu.Item key={route}>
										<Link replace to={`/app/${appName}/${routes[route].link}`}>
											{iconMap[routes[route].icon]}
											<span>{route}</span>
										</Link>
									</Menu.Item>
								);
							})}
					</Menu>
				</Sider>
				{loading ? (
					<Loader />
				) : (
					<>
						<ReIndexTracker />
						<AppLayout
							showHeader={showHeader}
							collapsed={collapsed}
							{...this.props}
							onToggle={this.onCollapse}
						/>
					</>
				)}
			</Layout>
		);
	}
}

AppWrapper.propTypes = {
	currentApp: PropTypes.string,
	history: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired,
	settings: PropTypes.object,
	defaultSettings: PropTypes.object,
	updateSettingsAction: PropTypes.func.isRequired,
	getDefaultSettingsAction: PropTypes.func.isRequired,
	getSettingsAction: PropTypes.func.isRequired,
	tier: allowedTiers,
	featureSearchRelevancy: PropTypes.bool,
	setIsCollapsed: PropTypes.func.isRequired,
	collapsed: PropTypes.bool.isRequired,
	routes: PropTypes.object.isRequired,
	arcVersion: PropTypes.string,
	updateCurrentApp: PropTypes.func.isRequired,
	backendImage: PropTypes.string,
	backend: PropTypes.string,
};

AppWrapper.defaultProps = {
	settings: null,
	tier: undefined,
	featureSearchRelevancy: false,
	arcVersion: null,
	defaultSettings: null,
	currentApp: null,
	backendImage: '',
	backend: BACKENDS.ELASTICSEARCH.name,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	return {
		currentApp: appName,
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		settings: get(state, ['$getAppSettings', 'settings', appName]),
		tier: get(state, '$getAppPlan.results.tier'),
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
		collapsed: get(state, 'sideBarCollapsed'),
		routes: get(state, 'appRoutes'),
		arcVersion: get(state, '$getAppPlan.results.version'),
		backendImage: get(state, '$getAppPlan.results.image_type'),
		backend: get(state, '$getAppPlan.results.backend'),
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateCurrentApp: (appName, appId) => dispatch(setCurrentApp(appName, appId)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	setIsCollapsed: (collapsed) => dispatch(setIsSidebarCollapsed(collapsed)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppWrapper);
