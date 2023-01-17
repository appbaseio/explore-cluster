import React, { Component } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Layout, Menu, Tag } from 'antd';
import { Link, Route, Switch, Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import get from 'lodash/get';
import keys from 'lodash/keys';
import { bool, func, object, string } from 'prop-types';
import { isEqual } from 'lodash';
import { css } from 'emotion';
import { ALLOWED_ACTIONS } from '../../constants';
import Loader from '../../components/Loader';
// eslint-disable-next-line
import AppHeader from '../../components/AppHeader';
import Logo from '../../components/Logo';
import { breakpoints } from '../../utils/media';
import { versionCompare } from '../../batteries/utils/helpers';
import { getAppPlan } from '../../batteries/modules/actions';
import { getParam, getAuthorizedRoutes, getParsedRoutes } from '../../utils';
import LabelTag from '../../components/LabelTag';
import IndexSwitcher from '../../components/IndexSwitcher';
import { loadApps, setIsSidebarCollapsed } from '../../actions';
import SidebarAutocomplete from '../../components/SidebarAutocomplete';
import searchInputStyle from './styles';
import UnauthorizedPage from '../UnauthorizedPage';
import { ALLOWED_ACTIONS_BY_BACKEND, BACKENDS } from '../../batteries/utils';
import { iconMap } from '../../components/iconMap';

const NoMatch = Loadable({
	loader: () => import(/* webpackChunkName: "NoMatchPage" */ '../../NoMatch'),
	loading: () => <div />,
});

const HomePage = Loadable({
	loader: () => import(/* webpackChunkName: "HomePage" */ '../HomePage'),
	loading: Loader,
});

const ClusterLayout = Loadable({
	loader: () =>
		// eslint-disable-next-line
		import(/* webpackChunkName: "ClusterLayout" */ '../../components/AppLayout/ClusterLayout'),
	loading: Loader,
});

const { Sider } = Layout;
const { SubMenu } = Menu;

const accountRoute = {
	Account: {
		icon: 'setting',
		menu: [
			{ label: 'Profile', link: '/cluster/profile' },
			{ label: 'Billing', link: '/cluster/billing' },
		],
	},
};

const sidebarStyles = css`
	height: 100vh;
	position: fixed !important;
	left: 0;
	& .ant-layout-sider-children .ant-menu.ant-menu-inline-collapsed {
		width: 100%;
	}
`;

const getActiveMenu = (props, prevActiveSubMenu = [], routes = {}) => {
	let activeSubMenu = 'App Overview';
	let activeMenuItem = 'App Overview';
	let pathname = props.location.pathname; // eslint-disable-line
	if (!pathname) {
		pathname = getParam('view') || '';
	}
	Object.keys(routes).some((route) => {
		if (routes[route].menu) {
			const active = routes[route].menu.find((item) => pathname.startsWith(item.link));

			if (active) {
				activeSubMenu = route;
				activeMenuItem = active.label;
				return true;
			}
		} else if (pathname === routes[route].link) {
			activeSubMenu = route;
			activeMenuItem = route;
			return true;
		} else if (route === 'Pipelines') {
			// a patchy condition to make menu item without submenu active if related routes are navigated
			if (pathname.includes('pipelines')) {
				activeSubMenu = route;
				activeMenuItem = route;
				return true;
			}
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

class DashboardWrapper extends Component {
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
		const getActiveMenuData = getActiveMenu(props, undefined, props.routes);
		const { routes, arcVersion, backend, user } = props;
		let routesToSet = routes;
		const allowedActions = get(user, 'data.allowedActions', []).filter((action) => {
			return ALLOWED_ACTIONS_BY_BACKEND[backend].includes(action);
		});

		if (arcVersion && versionCompare(arcVersion, '7.54.0') !== -1) {
			routesToSet = {
				...routes,
				...(allowedActions.includes(ALLOWED_ACTIONS.UI_BUILDER)
					? {
							'UI Builder': {
								icon: 'control',
								action: ALLOWED_ACTIONS.UI_BUILDER,
								menu: [
									...(backend === BACKENDS.ELASTICSEARCH.name ||
									backend === BACKENDS.OPENSEARCH.name ||
									backend === BACKENDS.SYSTEM.name
										? [
												{
													label: 'Searchbox',
													link: '/cluster/searchboxes',
													tag: 'Beta',
												},
										  ]
										: []),
									{
										label: 'Search UI',
										link: '/cluster/search-builder',
										tag: 'Beta',
									},
									...(backend === BACKENDS.ELASTICSEARCH.name ||
									backend === BACKENDS.OPENSEARCH.name ||
									backend === BACKENDS.SYSTEM.name
										? [
												{
													label: 'Recommendations',
													link: '/cluster/recommendations-builder',
													tag: 'Beta',
												},
										  ]
										: []),
									{
										label: 'End-user Authentication',
										link: '/cluster/auth-settings',
										tag: 'Beta',
									},
								],
								tag: 'Beta',
							},
					  }
					: {}),
				...(routes['API Credentials']
					? {
							'API Credentials': {
								icon: 'key',
								action: 'access-control',
								menu: [
									{
										label: 'User Management',
										link: '/cluster/user-management',
									},
									{
										label: 'API Credentials',
										link: '/cluster/credentials',
									},
									...(backend === BACKENDS.ELASTICSEARCH.name ||
									backend === BACKENDS.OPENSEARCH.name ||
									backend === BACKENDS.SYSTEM.name
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
			appName: props.match.params.appName, // eslint-disable-line
			showHeader,
			routes: routesToSet,
			value: '',
			...getActiveMenuData,
		};
	}

	static getDerivedStateFromProps(props, state) {
		const { appName } = props.match.params;
		const { currentApp } = props;
		const { routes } = state;
		let setActiveMenu = null;
		if (props.location.pathname !== url) {
			setActiveMenu = {
				...getActiveMenu(props, state.activeSubMenu, routes),
				url: props.location.pathname,
			};
		}
		url = props.location.pathname;
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
		const {
			isClusterPlanFetched,
			fetchClusterPlan,
			isClusterPlanFetching,
			apps,
			fetchApps,
			setIsCollapsed,
		} = this.props;
		if (!isClusterPlanFetching && !isClusterPlanFetched) {
			fetchClusterPlan();
		}

		if (!apps) {
			fetchApps();
		}

		const collapsed = window.innerWidth <= breakpoints.medium;
		setIsCollapsed(collapsed);
	}

	componentDidUpdate(prevProps) {
		const { arcVersion, isBillingEnabled, routes, backend, user } = this.props;
		if (
			!isEqual(routes, prevProps.routes) ||
			(arcVersion && arcVersion !== prevProps.arcVersion)
		) {
			if (versionCompare(arcVersion, '7.54.0') !== -1) {
				const allowedActions = get(user, 'data.allowedActions', []).filter((action) => {
					return ALLOWED_ACTIONS_BY_BACKEND[backend].includes(action);
				});
				// UPDATE UIBuilder route
				// eslint-disable-next-line
				this.setState({
					routes: {
						...routes,
						...(allowedActions.includes(ALLOWED_ACTIONS.UI_BUILDER)
							? {
									'UI Builder': {
										icon: 'control',
										action: ALLOWED_ACTIONS.UI_BUILDER,
										menu: [
											{
												label: 'Search',
												link: '/cluster/search-builder',
												tag: 'Beta',
											},
											...(backend === BACKENDS.ELASTICSEARCH.name ||
											backend === BACKENDS.OPENSEARCH.name ||
											backend === BACKENDS.SYSTEM.name
												? [
														{
															label: 'Recommendations',
															link: '/cluster/recommendations-builder',
															tag: 'Beta',
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
												tag: 'Beta',
											},
										],
										tag: 'Beta',
									},
							  }
							: {}),
						...(routes['API Credentials']
							? {
									'API Credentials': {
										icon: 'key',
										action: 'access-control',
										menu: [
											{
												label: 'User Management',
												link: '/cluster/user-management',
											},
											{
												label: 'API Credentials',
												link: '/cluster/credentials',
											},
											...(backend === BACKENDS.ELASTICSEARCH.name ||
											backend === BACKENDS.OPENSEARCH.name ||
											backend === BACKENDS.SYSTEM.name
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
		if (isBillingEnabled && isBillingEnabled !== prevProps.isBillingEnabled) {
			// eslint-disable-next-line
			this.setState({
				routes: {
					...routes,
					...accountRoute,
				},
			});
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

	onCollapse = () => {
		const { setIsCollapsed, collapsed } = this.props;
		setIsCollapsed(!collapsed);
		this.setState({ activeSubMenu: [] });
	};

	render() {
		const { showHeader, routes, activeSubMenu, activeMenuItem, value } = this.state;
		const { apps, history, match, collapsed, sessionData, backendImage, backend } = this.props;
		const filteredApps = keys(apps).filter((app) => !app.startsWith('.'));
		const routesFiltered = {};

		Object.keys(routes).forEach((key) => {
			if (ALLOWED_ACTIONS_BY_BACKEND[backend].includes(routes[key].action)) {
				routesFiltered[key] = routes[key];
			}
		});
		const allowedRoutes = getAuthorizedRoutes(routesFiltered);

		const indexName = sessionStorage.getItem('appName') || sessionData || '';

		return (
			<Layout>
				<Sider
					width={284}
					collapsible
					collapsed={collapsed}
					onCollapse={this.onCollapse}
					className={sidebarStyles}
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
						{showHeader ? (
							<Menu.Item style={{ margin: '15px auto' }}>
								<Link to="/">
									{collapsed ? (
										<Logo type="small" width={20} />
									) : (
										<Logo
											type={
												backend === BACKENDS.FUSION.name
													? 'lucid_works'
													: 'white'
											}
											width={160}
										/>
									)}
								</Link>
							</Menu.Item>
						) : null}
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
								filteredApps={filteredApps}
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
													(item.link.includes(
														'configure-search-engine-backend',
													) ||
														item.link.includes('data-usage')) &&
													(backendImage !== 'sls' ||
														backend === BACKENDS.FUSION.name ||
														backend === BACKENDS.MARKLOGIC.name)
												) {
													return null;
												}
												return (
													<Menu.Item key={item.label}>
														{/* eslint-disable-next-line */}
														{item.openIndexMenu ? (
															indexName ? (
																<LabelTag
																	item={item}
																	onClick={() =>
																		history.push(
																			`/app/${indexName}/${item.link}`,
																		)
																	}
																/>
															) : (
																<IndexSwitcher
																	item={item}
																	filteredApps={filteredApps}
																	history={history}
																/>
															)
														) : (
															<Link replace to={item.link}>
																<LabelTag item={item} />
															</Link>
														)}
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
										{routes[route].openIndexMenu ? (
											<IndexSwitcher
												item={routes[route]}
												filteredApps={filteredApps}
												history={history}
												renderItem={() => (
													<div>
														{iconMap[routes[route].icon]}
														<span>{route}</span>
													</div>
												)}
											/>
										) : (
											<Link replace to={routes[route].link}>
												{iconMap[routes[route].icon]}
												<span>{route}</span>
											</Link>
										)}
									</Menu.Item>
								);
							})}
					</Menu>
				</Sider>
				<Layout
					css={{
						paddingTop: showHeader ? 60 : 0,
						minHeight: '100vh',
						marginLeft: collapsed ? '80px' : '284px',
						overflowY: 'auto',
					}}
				>
					{showHeader && (
						<AppHeader
							collapsed={collapsed}
							onToggle={this.onCollapse}
							big={collapsed}
							minimal
							showApp={false}
							history={history}
							match={match}
						/>
					)}
					{Object.keys(allowedRoutes).length ? (
						<Switch>
							<Route
								exact
								path="/"
								render={({ history: routeHistory }) => (
									<>
										{get(allowedRoutes, '/') ? (
											<HomePage history={routeHistory} />
										) : (
											<Redirect to={Object.keys(allowedRoutes)[0]} />
										)}
									</>
								)}
							/>
							<Route
								path="/cluster"
								render={(routeProps) => (
									<ClusterLayout
										collapsed={collapsed}
										{...this.props}
										{...routeProps}
									/>
								)}
							/>
							<Route component={NoMatch} />
						</Switch>
					) : (
						<UnauthorizedPage />
					)}
				</Layout>
			</Layout>
		);
	}
}

DashboardWrapper.defaultProps = {
	isBillingEnabled: false,
	arcVersion: null,
	isClusterPlanFetching: false,
	apps: {},
	sessionData: '',
	backendImage: '',
	backend: BACKENDS.ELASTICSEARCH.name,
};

DashboardWrapper.propTypes = {
	isBillingEnabled: bool,
	fetchClusterPlan: func.isRequired,
	isClusterPlanFetching: bool,
	isClusterPlanFetched: bool.isRequired,
	apps: object,
	fetchApps: func.isRequired,
	history: object.isRequired,
	arcVersion: string,
	match: object.isRequired,
	location: object.isRequired,
	collapsed: bool.isRequired,
	setIsCollapsed: func.isRequired,
	routes: object.isRequired,
	sessionData: string,
	backendImage: string,
	backend: string,
	user: object.isRequired,
};

const mapStateToProps = (state) => ({
	user: get(state, 'user'),
	isBillingEnabled: !(get(state, '$getAppPlan.results.billing') === false),
	isClusterPlanFetched: get(state, '$getAppPlan.success'),
	isClusterPlanFetching: get(state, '$getAppPlan.isFetching', false),
	arcVersion: get(state, '$getAppPlan.results.version'),
	apps: get(state, 'apps.data'),
	collapsed: get(state, 'sideBarCollapsed'),
	routes: get(state, 'clusterRoutes'),
	sessionData: get(state, 'sessionData.sessionData', ''),
	backendImage: get(state, '$getAppPlan.results.image_type'),
	backend: get(state, '$getAppPlan.results.backend'),
});

const mapDispatchToProps = (dispatch) => ({
	fetchClusterPlan: () => dispatch(getAppPlan()),
	fetchApps: () => dispatch(loadApps()),
	setIsCollapsed: (collapsed) => dispatch(setIsSidebarCollapsed(collapsed)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardWrapper);
