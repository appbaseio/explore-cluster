import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Icon, Input, Layout, Menu, Tag } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import AppLayout from '../../components/AppLayout';
import {
	getDefaultSettings,
	getSettings,
	putSettings,
	setCurrentApp,
} from '../../batteries/modules/actions';
import Logo from '../../components/Logo';

import { getParam, getParsedRoutes } from '../../utils';
import { breakpoints } from '../../utils/media';
import Loader from '../../components/Loader';
import { isValidPlan } from '../../batteries/utils';
import SidebarAutocomplete from '../../components/SidebarAutocomplete';
import { allowedTiers } from '../../utils/prop-types';
import searchInputStyle from '../DashboardWrapper/styles';
import WithRedirectTooltip from '../../components/WithRedirectTooltip';

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
			{ label: 'Search Preview', link: 'search-preview', tag: 'Beta' },
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
			{ label: 'Index Settings', link: 'index-settings', tag: 'Beta' },
			{ label: 'Schema', link: 'settings', tag: 'Beta' },
			{ label: 'Synonyms', link: 'synonyms', tag: 'Beta' },
			{ label: 'Query Suggestions', link: 'query-suggestions', tag: 'Beta' },
			{ label: 'Query Rules', link: '/cluster/rules', tag: 'Beta', hasExactPath: true },
			{
				label: 'Grade Evaluation',
				link: '/cluster/grade-evaluation',
				tag: 'Beta',
				hasExactPath: true,
			},
			{ label: 'Functions', link: '/cluster/functions', tag: 'Beta', hasExactPath: true },
		],
	},
	'Curated Insights': {
		icon: 'rise',
		link: '/cluster/curated-insights',
		hasExactPath: true,
	},
	Security: {
		icon: 'key',
		menu: [
			{ label: 'API Credentials', link: 'credentials' },
			{ label: 'User Management', link: '/cluster/user-management', hasExactPath: true },
			{
				label: 'Role Based Access',
				link: '/cluster/role-based-access',
				tag: 'Beta',
				hasExactPath: true,
			},
			{ label: 'Search Templates', link: 'search-templates', tag: 'Beta' },
		],
	},
	Billing: {
		icon: 'credit-card',
		link: 'billing',
	},
};

const parsedRoutes = getParsedRoutes(routes);

const getActiveMenu = (props, prevActiveSubMenu = []) => {
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

		const collapsed = window.innerWidth <= breakpoints.medium;
		const getActiveMenuData = getActiveMenu(props);

		this.state = {
			collapsed,
			showHeader,
			appName: props.match.params.appName, // eslint-disable-line
			value: '',
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

		if (state.collapsed) {
			return { value: '' };
		}
		return { ...setActiveMenu };
	}

	componentDidMount() {
		const { appName } = this.state;
		const { history, match } = this.props;
		const view = getParam('view') || '';

		this.handleSettings(appName);

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
		if (!isValidPlan(tier, featureSearchRelevancy)) return;
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
		this.setState((prevState) => ({ collapsed: !prevState.collapsed }));
	};

	render() {
		const {
			collapsed,
			showHeader,
			appName,
			activeSubMenu,
			activeMenuItem,
			loading,
			value,
		} = this.state;

		const { history } = this.props;

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
										<Icon type="cluster" />
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
									suffix={<Icon type="search" />}
								/>
							</div>
						)}

						{value && (
							<SidebarAutocomplete
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
										<Link replace to={`/app/${appName}/${routes[route].link}`}>
											<Icon type={routes[route].icon} />
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
					<AppLayout
						showHeader={showHeader}
						collapsed={collapsed}
						{...this.props}
						onToggle={this.onCollapse}
					/>
				)}
			</Layout>
		);
	}
}

AppWrapper.propTypes = {
	currentApp: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired,
	settings: PropTypes.object,
	defaultSettings: PropTypes.object,
	updateSettingsAction: PropTypes.func.isRequired,
	getDefaultSettingsAction: PropTypes.func.isRequired,
	getSettingsAction: PropTypes.func.isRequired,
	tier: allowedTiers,
	featureSearchRelevancy: PropTypes.bool,
};

AppWrapper.defaultProps = {
	settings: null,
	tier: undefined,
	featureSearchRelevancy: false,
	defaultSettings: null,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	return {
		currentApp: appName,
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		settings: get(state, ['$getAppSettings', 'settings', appName]),
		tier: get(state, '$getAppPlan.results.tier'),
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateCurrentApp: (appName, appId) => dispatch(setCurrentApp(appName, appId)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppWrapper);
