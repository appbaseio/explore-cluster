import React, { Component } from 'react';
import {
 Icon, Menu, Layout, Tag,
} from 'antd';
import { Switch, Route, Link } from 'react-router-dom';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import get from 'lodash/get';

import { bool } from 'prop-types';
import Loader from '../../components/Loader';
import AppHeader from '../../components/AppHeader';
import Logo from '../../components/Logo';
import { breakpoints } from '../../utils/media';

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
			{ label: 'Search Templates', link: '/cluster/search-templates', tag: 'Beta' },
			{ label: 'Query Suggestions', link: 'query-suggestions', tag: 'Beta' },
		],
	},
	'Browse Data': {
		icon: 'hdd',
		link: '/cluster/browse',
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

class DashboardWrapper extends Component {
	constructor() {
		super();

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
		this.state = {
			collapsed,
			showHeader,
			routes: defaultRoutes,
		};
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
		const { collapsed, showHeader, routes } = this.state;

		return (
			<Layout>
				<Sider
					width={260}
					css={{
						height: '100vh',
						position: 'fixed',
						left: 0,
					}}
					collapsible
					collapsed={collapsed}
					onCollapse={this.onCollapse}
				>
					<Menu
						theme="dark"
						// openKeys={activeSubMenu}
						// selectedKeys={activeMenuItem}
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
};

DashboardWrapper.propTypes = {
	isBillingEnabled: bool,
};

const mapStateToProps = state => ({
	isBillingEnabled: get(state, '$getAppPlan.results.billing_type'),
});

export default connect(
	mapStateToProps,
	null,
)(DashboardWrapper);
