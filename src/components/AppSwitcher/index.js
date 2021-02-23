import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import keys from 'lodash/keys';
import { css } from 'emotion';
import { setCurrentApp } from '../../batteries/modules/actions';
import { loadApps } from '../../actions';

const selectStyle = css`
	.ant-select-selection {
		border: none;
	}
	.ant-select-selection-selected-value {
		max-width: 92%;
	}
`;

class AppSwitcher extends React.Component {
	componentDidMount() {
		const { apps, fetchApps } = this.props;

		if (!apps) {
			fetchApps();
		}
	}

	render() {
		const { apps, currentApp, history, updateCurrentApp, match } = this.props;
		const route = get(match, 'params.route');

		const filteredApps = keys(apps).filter((app) => !app.startsWith('.'));

		const userApps = filteredApps.filter((index) => index && !index.includes('metricbeat-'));

		const sortedApps = (userApps || []).sort((a, b) => {
			if (a < b) {
				return -1;
			}
			if (a > b) {
				return 1;
			}
			return 0;
		});

		return (
			<React.Fragment>
				<Select
					className={selectStyle}
					value={currentApp}
					style={{ minWidth: 180 }}
					onSelect={(appName) => {
						updateCurrentApp(appName);
						history.push(`/app/${appName}/${route || ''}`);
					}}
					showSearch
					autoFocus
				>
					{sortedApps.map((app) => (
						<Select.Option key={app} value={app}>
							{app}
						</Select.Option>
					))}
				</Select>
			</React.Fragment>
		);
	}
}

AppSwitcher.propTypes = {
	apps: PropTypes.object,
	fetchApps: PropTypes.func.isRequired,
	currentApp: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
	updateCurrentApp: PropTypes.func.isRequired,
	match: PropTypes.object.isRequired,
};

AppSwitcher.defaultProps = {
	apps: {},
};

const mapStateToProps = (state) => ({
	apps: get(state, 'apps.data'),
});

const mapDispatchToProps = (dispatch) => ({
	updateCurrentApp: (appName, appId) => dispatch(setCurrentApp(appName, appId)),
	fetchApps: () => dispatch(loadApps()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppSwitcher));
