import React from 'react';
import { Dropdown, Menu, Button, Icon } from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { get, keys } from 'lodash';
import { setCurrentApp } from '../../batteries/modules/actions';
import { loadApps } from '../../actions';

class AppSwitcher extends React.Component {
	componentDidMount() {
		const { apps, fetchApps } = this.props;

		if (!apps) {
			fetchApps();
		}
	}

	render() {
		const {
			apps,
			currentApp,
			history,
			updateCurrentApp,
			match,
			preserveButtonStyle,
		} = this.props;
		const route = get(match, 'params.route');

		const filteredApps = keys(apps).filter(app => !app.startsWith('.'));
		const menu = (
			<Menu
				css={{
					maxHeight: 250,
					overflowY: 'scroll',
				}}
				onClick={e => {
					const appName = e.key;
					updateCurrentApp(appName);
					history.replace(`/app/${appName}/${route || ''}`);
				}}
			>
				{filteredApps.map(app => (
					<Menu.Item key={app}>{app}</Menu.Item>
				))}
			</Menu>
		);
		return (
			<React.Fragment>
				<Dropdown trigger={['click']} overlay={menu}>
					<Button
						style={
							preserveButtonStyle
								? {}
								: {
										border: 0,
										boxShadow: 'none',
										padding: 0,
										minWidth: 115,
								  }
						}
					>
						<span>{currentApp || 'Loading...'}</span>
						<Icon type="down" />
					</Button>
				</Dropdown>
			</React.Fragment>
		);
	}
}

const mapStateToProps = state => ({
	apps: get(state, 'apps.data'),
});

const mapDispatchToProps = dispatch => ({
	updateCurrentApp: (appName, appId) => dispatch(setCurrentApp(appName, appId)),
	fetchApps: () => dispatch(loadApps()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppSwitcher));
