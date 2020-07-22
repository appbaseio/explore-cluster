import React, { Component } from 'react';
import { Icon, Input, Layout, Menu } from 'antd';
import { Link, Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import { get, keys } from 'lodash';

import { bool, func, object } from 'prop-types';
import Loader from '../../components/Loader';
import AppHeader from '../../components/AppHeader';
import Logo from '../../components/Logo';
import { breakpoints } from '../../utils/media';
import { getAppPlan } from '../../batteries/modules/actions';
import { getParam, getParsedRoutes } from '../../utils';
import LabelTag from '../../components/LabelTag';
import IndexSwitcher from '../../components/IndexSwitcher';
import { loadApps } from '../../actions';
import SidebarAutocomplete from '../../components/SidebarAutocomplete';
import searchInputStyle from './styles';

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
		import(/* webpackChunkName: "ClusterLayout" */ '../../components/AppLayout/ClusterLayout'),
	loading: Loader,
});

const { Sider } = Layout;
const { SubMenu } = Menu;

const defaultRoutes = {
	'Cluster Overview': {
		icon: 'cluster',
		link: '/',
	},
	Develop: {
		icon: 'dashboard',
		menu: [
			{ label: 'Import Data', link: 'import', openIndexMenu: true },
			{ label: 'Browse Data', link: '/cluster/browse' },
			{ label: 'Request Logs', link: '/cluster/request-logs' },
			{ label: 'Search Preview', link: 'search-preview', tag: 'Beta', openIndexMenu: true },
		],
	},
	'Search Relevancy': {
		icon: 'search',
		menu: [
			{ label: 'Language Settings', link: 'languages', tag: 'Beta', openIndexMenu: true },
			{ label: 'Search Settings', link: 'search', tag: 'Beta', openIndexMenu: true },
			{ label: 'Aggregation Settings', link: 'aggs', tag: 'Beta', openIndexMenu: true },
			{ label: 'Result Settings', link: 'results', tag: 'Beta', openIndexMenu: true },
			{ label: 'Index Settings', link: 'index-settings', tag: 'Beta', openIndexMenu: true },
			{ label: 'Schema', link: 'settings', tag: 'Beta', openIndexMenu: true },
			{ label: 'Synonyms', link: 'synonyms', tag: 'Beta', openIndexMenu: true },
			{ label: 'Query Suggestions', link: '/cluster/query-suggestions', tag: 'Beta' },
			{ label: 'Query Rules', link: '/cluster/rules', tag: 'Beta' },
			{ label: 'Functions', link: '/cluster/functions', tag: 'Beta' },
			{ label: 'Grade Evaluation', link: '/cluster/grade-evaluation', tag: 'Beta' },
		],
	},
	Analytics: {
		icon: 'line-chart',
		menu: [
			{ label: 'Overview', link: '/cluster/analytics' },
			{ label: 'Popular Searches', link: '/cluster/popular-searches' },
			{ label: 'No Result Searches', link: '/cluster/no-results-searches' },
			{ label: 'Popular Filters', link: '/cluster/popular-filters' },
			{ label: 'Popular Results', link: '/cluster/popular-results' },
			{ label: 'Geo Distribution', link: '/cluster/geo-distribution' },
			{ label: 'Requests Per Minute', link: '/cluster/requests-per-minute' },
			{ label: 'Search Latency', link: '/cluster/search-latency' },
		],
	},
	'Curated Insights': {
		icon: 'rise',
		link: '/cluster/curated-insights',
	},
	Security: {
		icon: 'key',
		menu: [
			{ label: 'API Credentials', link: '/cluster/credentials' },
			{ label: 'User Management', link: '/cluster/user-management' },
			{ label: 'Role Based Access', link: '/cluster/role-based-access', tag: 'Beta' },
			{ label: 'Search Templates', link: '/cluster/search-templates', tag: 'Beta' },
		],
	},
	Billing: {
		icon: 'credit-card',
		link: '/cluster/billing',
	},
};

const parsedRoutes = getParsedRoutes(defaultRoutes);

const accountRoute = {
	Account: {
		icon: 'setting',
		menu: [
			{ label: 'Profile', link: '/cluster/profile' },
			{ label: 'Billing', link: '/cluster/billing' },
		],
	},
};

const getActiveMenu = (props, prevActiveSubMenu = []) => {
	let activeSubMenu = 'App Overview';
	let activeMenuItem = 'App Overview';
	let pathname = props.location.pathname; // eslint-disable-line
	if (!pathname) {
		pathname = getParam('view') || '';
	}
	const routes = defaultRoutes;
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

		const collapsed = window.innerWidth <= breakpoints.medium;
		let showHeader = true;
		try {
			const header = JSON.parse(sessionStorage.getItem('header'));
			if (header !== undefined) {
				showHeader = header;
			}
		} catch (e) {
			console.log(e);
		}
		const getActiveMenuData = getActiveMenu(props);
		this.state = {
			collapsed,
			appName: props.match.params.appName, // eslint-disable-line

			showHeader,
			routes: defaultRoutes,
			value: '',
			...getActiveMenuData,
		};
	}

	static getDerivedStateFromProps(props, state) {
		const { appName } = props.match.params;
		const { currentApp } = props;
		let setActiveMenu = null;
		if (props.location.pathname !== url) {
			setActiveMenu = {
				...getActiveMenu(props, state.activeSubMenu),
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
		} = this.props;
		if (!isClusterPlanFetching && !isClusterPlanFetched) {
			fetchClusterPlan();
		}

		if (!apps) {
			fetchApps();
		}
	}

	componentDidUpdate(prevProps) {
		const { isBillingEnabled } = this.props;
		if (isBillingEnabled && isBillingEnabled !== prevProps.isBillingEnabled) {
			// eslint-disable-next-line
			this.setState({
				routes: {
					...defaultRoutes,
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
		this.setState((prevState) => ({ collapsed: !prevState.collapsed }));
	};

	render() {
		const { collapsed, showHeader, routes, activeSubMenu, activeMenuItem, value } = this.state;
		const { apps, history, match } = this.props;

		const filteredApps = keys(apps).filter((app) => !app.startsWith('.'));

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
						{showHeader ? (
							<Menu.Item style={{ margin: '15px auto' }}>
								<Link to="/">
									{collapsed ? (
										<Logo type="small" width={20} />
									) : (
										<Logo type="white" width={160} />
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
									suffix={<Icon type="search" />}
								/>
							</div>
						)}

						{value && (
							<SidebarAutocomplete
								filteredApps={filteredApps}
								history={history}
								routes={parsedRoutes}
								value={value}
								resetAutoComplete={this.resetSearch}
							/>
						)}

						{!value &&
							Object.keys(routes).map((route) => {
								if (routes[route].menu) {
									const Title = (
										<span>
											<Icon type={routes[route].icon} />
											<span>{route}</span>
										</span>
									);
									return (
										<SubMenu key={route} title={Title}>
											{routes[route].menu.map((item) => (
												<Menu.Item key={item.label}>
													{item.openIndexMenu ? (
														<IndexSwitcher
															item={item}
															filteredApps={filteredApps}
															history={history}
														/>
													) : (
														<Link replace to={item.link}>
															<LabelTag item={item} />
														</Link>
													)}
												</Menu.Item>
											))}
										</SubMenu>
									);
								}
								if (routes[route].hasExactPath) {
									return (
										<Menu.Item key={route}>
											<Link replace to={routes[route].link}>
												<Icon type={routes[route].icon} />
												<span>{route}</span>
											</Link>
										</Menu.Item>
									);
								}
								return (
									<Menu.Item key={route}>
										<Link replace to={routes[route].link}>
											<Icon type={routes[route].icon} />
											<span>{route}</span>
										</Link>
									</Menu.Item>
								);
							})}
					</Menu>
				</Sider>
				<Layout
					css={{
						paddingTop: showHeader ? 60 : 0,
						minHeight: '100vh',
						marginLeft: collapsed ? '80px' : '260px',
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
					<Switch>
						<Route
							exact
							path="/"
							render={({ history: routeHistory }) => (
								<HomePage history={routeHistory} />
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
				</Layout>
			</Layout>
		);
	}
}

DashboardWrapper.defaultProps = {
	isBillingEnabled: false,
	isClusterPlanFetching: false,
	apps: {},
};

DashboardWrapper.propTypes = {
	isBillingEnabled: bool,
	fetchClusterPlan: func.isRequired,
	isClusterPlanFetching: bool,
	isClusterPlanFetched: bool.isRequired,
	apps: object,
	fetchApps: func.isRequired,
	history: object.isRequired,
	match: object.isRequired,
	location: object.isRequired,
};

const mapStateToProps = (state) => ({
	isBillingEnabled: !(get(state, '$getAppPlan.results.billing') === false),
	isClusterPlanFetched: get(state, '$getAppPlan.success'),
	isClusterPlanFetching: get(state, '$getAppPlan.isFetching', false),
	apps: get(state, 'apps.data'),
});

const mapDispatchToProps = (dispatch) => ({
	fetchClusterPlan: () => dispatch(getAppPlan()),
	fetchApps: () => dispatch(loadApps()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardWrapper);
