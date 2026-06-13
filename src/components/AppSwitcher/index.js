import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import keys from 'lodash/keys';
import { css } from 'emotion';
import { setCurrentApp } from '../../batteries/modules/actions';
import { isSystemIndex } from '../../batteries/utils';
import { loadApps } from '../../actions';

const selectStyle = css`
	/* antd v3/v4 */
	.ant-select-selection {
		border: none;
	}
	/* antd v5 */
	.ant-select-selector {
		border: none !important;
		padding-right: 24px !important; /* ensure room for arrow */
	}
	/* Truncate selected value gracefully (v3/v4) */
	.ant-select-selection-selected-value {
		max-width: 100%;
		padding: 0 20px 0 0;
		display: inline-block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		vertical-align: bottom;
	}
	/* Truncate selected value gracefully (v5) */
	.ant-select-selection-item {
		max-width: 100%;
		display: inline-block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		vertical-align: bottom;
	}
	/* Truncate dropdown options as well (v3/v4) */
	.ant-select-dropdown-menu-item {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 520px;
	}
	/* Truncate dropdown options as well (v5) */
	.ant-select-item-option-content {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 520px;
	}
`;

// Styles applied to the dropdown container via dropdownClassName
const dropdownTruncateClass = css`
	/* v3/v4 */
	.ant-select-dropdown-menu {
		width: 360px !important;
		max-width: 360px !important;
	}
	.ant-select-dropdown-menu-item {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}
	/* v5 */
	.ant-select-dropdown {
		width: 360px !important;
		max-width: 360px !important;
	}
	.ant-select-item {
		max-width: 100% !important;
	}
`;

class AppSwitcher extends React.Component {
	state = {
		computedWidth: 200,
	};

	canvas = null;

	componentDidMount() {
		const { apps, fetchApps } = this.props;

		if (!apps) {
			fetchApps();
		}
		this.computeWidth();
	}

	componentDidUpdate(prevProps) {
		const { currentApp } = this.props;
		if (prevProps.currentApp !== currentApp) {
			this.computeWidth();
		}
	}

	getTextWidth = (
		text,
		font = '14px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
	) => {
		if (!this.canvas) {
			this.canvas = document.createElement('canvas');
		}
		const context = this.canvas.getContext('2d');
		context.font = font;
		const metrics = context.measureText(text);
		return metrics.width;
	};

	computeWidth = () => {
		const { currentApp } = this.props;
		const text = currentApp || '';
		// Measure text width and add padding + arrow space
		const textWidth = this.getTextWidth(text);
		const padding = 28; // horizontal padding inside selector
		const arrow = 18; // dropdown arrow space
		const gutters = 8; // small safety gutter
		const min = 96;
		const max = 360;
		const width = Math.max(
			min,
			Math.min(max, Math.ceil(textWidth + padding + arrow + gutters)),
		);
		this.setState({ computedWidth: width });
	};

	render() {
		const { apps, currentApp, history, updateCurrentApp, match } = this.props;
		const { computedWidth } = this.state;
		const route = get(match, 'params.route');

		const userApps = keys(apps).filter((app) => app && !isSystemIndex(app));

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
					/* Width adapts to content up to a cap, avoids extra whitespace */
					style={{ minWidth: 120, maxWidth: 360, width: computedWidth }}
					popupClassName={dropdownTruncateClass}
					dropdownMatchSelectWidth
					onSelect={(appName) => {
						updateCurrentApp(appName);
						history.push(`/app/${appName}/${route || ''}`);
						sessionStorage.setItem('appName', appName);
					}}
					showSearch
					autoFocus
				>
					{sortedApps.map((app) => (
						<Select.Option key={app} value={app} title={app}>
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
