import React, { Component } from 'react';
import {
 Icon, Menu, Layout, Tag,
} from 'antd';
import { Switch, Route, Link } from 'react-router-dom';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import get from 'lodash/get';

import { bool, func } from 'prop-types';
import Loader from '../../components/Loader';
import AppHeader from '../../components/AppHeader';
import Logo from '../../components/Logo';
import { breakpoints } from '../../utils/media';
import { getAppPlan } from '../../batteries/modules/actions';
import { getParam } from '../../utils';

const NoMatch = Loadable({
	loader: () => import('../../NoMatch'),
	loading: () => <div />,
});

const HomePage = Loadable({
	loader: () => import('../HomePage'),
	loading: Loader,
});

const ClusterLayout = Loadable({
	loader: () => import('../../components/AppLayout/ClusterLayout'),
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
			{ label: 'Import Data', link: '/cluster/import' },
			{ label: 'Browse Data', link: '/cluster/browse' },
			{ label: 'Search Templates', link: '/cluster/search-templates', tag: 'Beta' },
			{ label: 'Query Suggestions', link: '/cluster/query-suggestions', tag: 'Beta' },
		],
	},
	Analytics: {
		icon: 'line-chart',
		menu: [
			{ label: 'Overview', link: '/cluster/analytics' },
			{ label: 'Request Logs', link: '/cluster/request-logs' },
			{ label: 'Popular Searches', link: '/cluster/popular-searches' },
			{ label: 'No Result Searches', link: '/cluster/no-results-searches' },
			{ label: 'Popular Filters', link: '/cluster/popular-filters' },
			{ label: 'Popular Results', link: '/cluster/popular-results' },
			{ label: 'Geo Distribution', link: '/cluster/geo-distribution' },
			{ label: 'Requests Per Minute', link: '/cluster/requests-per-minute' },
			{ label: 'Search Latency', link: '/cluster/search-latency' },
		],
	},
	Security: {
		icon: 'key',
		menu: [
			{ label: 'API Credentials', link: '/cluster/credentials' },
			{ label: 'User Management', link: '/cluster/user-management' },
			{ label: 'Role Based Access', link: '/cluster/role-based-access', tag: 'Beta' },
		],
	},
	Billing: {
		icon: 'credit-card',
		link: 'billing',
	},
};

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
			const active = routes[route].menu.find(item => pathname === item.link);

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
		(url = props.location.pathname);
		if (appName && appName !== state.appName) {
			return { appName, ...setActiveMenu };
		}

		if (!appName && !state.appName && currentApp) {
			// gets last used appName from redux-persist
			return { appName: currentApp, ...setActiveMenu };
		}
		return { ...setActiveMenu };
	}

	componentDidMount() {
		const { isClusterPlanFetched, fetchClusterPlan, isClusterPlanFetching } = this.props;
		if (!isClusterPlanFetching && !isClusterPlanFetched) {
			fetchClusterPlan();
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

	onCollapse = (collapsed) => {
		this.setState({ collapsed });
	};

	render() {
		const {
 collapsed, showHeader, routes, activeSubMenu, activeMenuItem,
} = this.state;

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
						{Object.keys(routes).map((route) => {
							if (routes[route].menu) {
								const Title = (
									<span>
										<Icon type={routes[route].icon} />
										<span>{route}</span>
									</span>
								);
								return (
									<SubMenu key={route} title={Title}>
										{routes[route].menu.map(item => (
											<Menu.Item key={item.label}>
												<Link replace to={item.link}>
													{item.label}
													{item.tag ? (
														<Tag
															style={{ fontSize: 10, marginLeft: 8 }}
															color="#001529"
														>
															{item.tag}
														</Tag>
													) : null}
												</Link>
											</Menu.Item>
										))}
									</SubMenu>
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
						overflowY: 'scroll',
					}}
				>
					{showHeader && <AppHeader big={collapsed} minimal showApp={false} />}

					<Switch>
						<Route exact path="/" component={HomePage} />
						<Route
							path="/cluster"
							component={() => (
								<ClusterLayout collapsed={collapsed} {...this.props} />
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
};

DashboardWrapper.propTypes = {
	isBillingEnabled: bool,
	fetchClusterPlan: func.isRequired,
	isClusterPlanFetching: bool,
	isClusterPlanFetched: bool.isRequired,
};

const mapStateToProps = state => ({
	isBillingEnabled: !(get(state, '$getAppPlan.results.billing') === false),
	isClusterPlanFetched: get(state, '$getAppPlan.success'),
	isClusterPlanFetching: get(state, '$getAppPlan.isFetching', false),
});

const mapDispatchToProps = dispatch => ({
	fetchClusterPlan: () => dispatch(getAppPlan()),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(DashboardWrapper);
