import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Icon, Tag } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import AppLayout from '../../components/AppLayout';
import { setCurrentApp } from '../../batteries/modules/actions';
import Logo from '../../components/Logo';

import { getParam } from '../../utils';
import { breakpoints } from '../../utils/media';

const { Sider } = Layout;
const { SubMenu } = Menu;

const routes = {
	'App Overview': {
		icon: 'home',
		link: '',
	},
	Develop: {
		icon: 'dashboard',
		menu: [
			{ label: 'Import Data', link: 'import' },
			{ label: 'Browse Data', link: 'browse' },
			{ label: 'Request Logs', link: 'request-logs' },
			{ label: 'Query Explorer', link: 'query' },
			{ label: 'Search Preview', link: 'search-preview', tag: 'Beta' },
			{ label: 'Functions', link: '/cluster/functions', tag: 'Beta', hasExactPath: true },
			{ label: 'Query Rules', link: '/cluster/rules', tag: 'Beta', hasExactPath: true },
			{ label: 'Search Templates', link: 'search-templates', tag: 'Beta' },
			{ label: 'Query Suggestions', link: 'query-suggestions', tag: 'Beta' },
		],
	},
	Analytics: {
		icon: 'line-chart',
		menu: [
			{ label: 'Overview', link: 'analytics' },
			{ label: 'Popular Searches', link: 'popular-searches' },
			{ label: 'No Result Searches', link: 'no-results-searches' },
			{ label: 'Popular Filters', link: 'popular-filters' },
			{ label: 'Popular Results', link: 'popular-results' },
			{ label: 'Geo Distribution', link: 'geo-distribution' },
			{ label: 'Requests Per Minute', link: 'requests-per-minute' },
			{ label: 'Search Latency', link: 'search-latency' },
		],
	},
	'Search Relevancy': {
		icon: 'search',
		menu: [
			{ label: 'Language Settings', link: 'languages', tag: 'Beta' },
			{ label: 'Search Settings', link: 'search', tag: 'Beta' },
			{ label: 'Aggregation Settings', link: 'aggs', tag: 'Beta' },
			{ label: 'Result Settings', link: 'results', tag: 'Beta' },
			{ label: 'Schema', link: 'settings', tag: 'Beta' },
		],
	},
	Security: {
		icon: 'key',
		menu: [{ label: 'API Credentials', link: 'credentials' }],
	},
	Billing: {
		icon: 'credit-card',
		link: 'billing',
	},
};

const getActiveMenu = (props, prevActiveSubMenu = []) => {
	let activeSubMenu = 'App Overview';
	let activeMenuItem = 'App Overview';
	let { route: pathname } = props.match.params; // eslint-disable-line

	if (!pathname) {
		pathname = getParam('view') || '';
	}

	Object.keys(routes).some(route => {
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

		const collapsed = window.innerWidth <= breakpoints.medium;
		const getActiveMenuData = getActiveMenu(props);

		this.state = {
			collapsed,
			showHeader,
			appName: props.match.params.appName, // eslint-disable-line
			...getActiveMenuData,
		};
	}

	static getDerivedStateFromProps(props, state) {
		const { appName } = props.match.params;
		const { currentApp } = props;
		let setActiveMenu = null;
		if (props.match.url !== url) {
			setActiveMenu = {
				...getActiveMenu(props, state.activeSubMenu),
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
		return { ...setActiveMenu };
	}

	componentDidMount() {
		const { appName } = this.state;
		const { history, match } = this.props;
		const view = getParam('view') || '';

		if (!match.params.appName && appName) {
			history.push(`/app/${appName}/${view}`);
		}
	}

	componentDidUpdate() {
		const { history, currentApp, match } = this.props;
		const { appName } = this.state;

		const route = match.params.route || '';

		if (currentApp && appName !== currentApp) {
			history.push(`/app/${currentApp}/${route}`);
		}
	}

	onCollapse = () => {
		this.setState(prevState => ({ collapsed: !prevState.collapsed }));
	};

	render() {
		const {
			collapsed,
			showHeader,
			appName,
			activeSubMenu,
			activeMenuItem // prettier-ignore
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
						onOpenChange={param => {
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
										<Icon type="cluster" />
										Cluster Overview
									</React.Fragment>
								)}
							</Link>
						</Menu.Item>
						{Object.keys(routes).map(route => {
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
									<Link replace to={`/app/${appName}/${routes[route].link}`}>
										<Icon type={routes[route].icon} />
										<span>{route}</span>
									</Link>
								</Menu.Item>
							);
						})}
					</Menu>
				</Sider>
				<AppLayout
					showHeader={showHeader}
					collapsed={collapsed}
					{...this.props}
					onToggle={this.onCollapse}
				/>
			</Layout>
		);
	}
}

const mapStateToProps = state => ({
	currentApp: get(state, '$getCurrentApp.name'),
});

const mapDispatchToProps = dispatch => ({
	updateCurrentApp: (appName, appId) => dispatch(setCurrentApp(appName, appId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppWrapper);
