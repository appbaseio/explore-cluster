/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import { getURL } from '../../../constants/config';
import { getSettings } from '../../../batteries/modules/actions';
import { generateQuery } from '../../SandboxPage/utils';
import { generateTutorialSandboxURL } from '../../SandboxPage/utils/sandbox-generator';
import { saveCsbUrl } from '../../../actions';

const Footer = ({
	previousScreen,
	disabled,
	settings,
	nextScreen,
	app,
	url,
	label,
	history,
	searchFields, // eslint-disable-line
	facetFields,
	credentials,
	selectedDataset,
	fetchSearchSettings,
	updateCsbUrl,
}) => {
	let codesandboxURL = '';

	useEffect(() => {
		if (!settings && app) {
			fetchSearchSettings(app);
		}
	}, [app]);

	const handleClick = async () => {
		if (settings) {
			codesandboxURL = await generateTutorialSandboxURL({
				settings: generateQuery(settings),
				app,
				credentials,
				url,
				facetFields,
				selectedDataset,
			});
			updateCsbUrl(codesandboxURL);
		}

		history.push({
			pathname: '/tutorial/finish',
			search: `?app=${app}`,
		});
	};

	return (
		<footer>
			<div className="left-column">
				{previousScreen ? (
					<a
						className="button has-icon"
						style={{ marginRight: 16 }}
						onClick={previousScreen}
						data-cy="goto-previous-step"
					>
						<LeftOutlined /> &nbsp; Previous
					</a>
				) : null}
				{label === 'Finish' ? (
					<a
						className={`button has-icon ${disabled ? 'disabled' : ''}`}
						onClick={() => handleClick()}
						data-cy="finish-tutorial"
					>
						Finish &nbsp; <RightOutlined />
					</a>
				) : (
					<a
						className={`button has-icon ${disabled ? 'disabled' : ''}`}
						onClick={() => {
							if (!disabled) nextScreen();
						}}
						data-cy="goto-next-step"
					>
						{label || 'Next'} &nbsp; <RightOutlined />
					</a>
				)}
			</div>
		</footer>
	);
};

Footer.propTypes = {
	previousScreen: PropTypes.func,
	disabled: PropTypes.bool,
	app: PropTypes.string,
	label: PropTypes.string,
	nextScreen: PropTypes.func,
	fetchSearchSettings: PropTypes.func.isRequired,
	credentials: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	settings: PropTypes.object,
	searchFields: PropTypes.array,
	facetFields: PropTypes.array,
	history: PropTypes.object.isRequired,
	selectedDataset: PropTypes.string,
	updateCsbUrl: PropTypes.func.isRequired,
};

Footer.defaultProps = {
	previousScreen: null,
	disabled: false,
	label: 'Next',
	nextScreen: () => {},
	settings: null,
	app: undefined,
	facetFields: [],
	searchFields: [],
	selectedDataset: 'movies',
};

const mapStateToProps = (state, props) => {
	const appName = get(state, '$getCurrentApp.name');
	const { username, password } = get(state, 'user.data', {});
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	return {
		settings: get(
			state,
			['$getAppSettings', 'settings', props.app || appName],
			defaultSettings,
		),
		fetchingDefaultSettings: get(state.$getAppSettings, `default.loading`),
		credentials: username ? `${username}:${password}` : null,
		url: getURL(),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchSearchSettings: (appName) => dispatch(getSettings(appName)),
	updateCsbUrl: (url) => dispatch(saveCsbUrl(url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Footer));
