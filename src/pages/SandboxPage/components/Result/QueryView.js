import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import Appbase from 'appbase-js';
import { css } from 'emotion';

import SandboxContext from '../SandboxContext';
import RSPlayground from '../../../../components/RSPlayground';

const headingStyle = css`
	font-size: 16px;
	color: rgba(0, 0, 0, 0.75);
	margin: 15px 0 5px;
	display: block;
`;

class QueryView extends React.Component {
	constructor(props) {
		super(props);
		const { query, app, url, credentials, recordAnalytics } = props;
		this.appbaseRef = Appbase({
			app,
			url,
			credentials,
		});

		this.state = {
			query: JSON.stringify(
				{
					query,
					settings: {
						recordAnalytics,
						enableQueryRules: true,
					},
				},
				null,
				4,
			),
			isExecuting: false,
		};
	}

	componentDidUpdate(prevProps) {
		const { query, recordAnalytics } = this.props;
		if (
			JSON.stringify(query) !== JSON.stringify(prevProps.query) ||
			recordAnalytics !== prevProps.recordAnalytics
		) {
			// eslint-disable-next-line
			this.setState({
				query: JSON.stringify(
					{
						query,
						settings: {
							recordAnalytics,
							enableQueryRules: true,
						},
					},
					null,
					4,
				),
			});
		}
	}

	toggleExecutionStatus = () => {
		this.setState((prevState) => ({
			isExecuting: !prevState.isExecuting,
		}));
	};

	render() {
		const { query } = this.state;
		return (
			<React.Fragment>
				<Typography.Text className={headingStyle} strong>
					Raw Request
				</Typography.Text>
				<div
					style={{
						position: 'relative',
						height: '500px',
						width: '100%',
						border: '1px solid #cccccc',
					}}
				>
					<RSPlayground
						presets={{
							editorPresets: {
								queryEditorValue: query,
							},
							settingsPresets: {
								showUrl: false,
								theme: 'light',
								showTabs: false,
								showHeaders: false,
								showSettings: false,
							},
						}}
					/>
				</div>
			</React.Fragment>
		);
	}
}

QueryView.propTypes = {
	query: PropTypes.array,
	app: PropTypes.string.isRequired,
	url: PropTypes.string,
	credentials: PropTypes.string.isRequired,
	recordAnalytics: PropTypes.bool,
};

QueryView.defaultProps = {
	query: [],
	url: undefined,
	recordAnalytics: true,
};

const QueryViewWrapper = () => {
	return (
		<SandboxContext.Consumer>
			{({ query, recordAnalytics, url, app, credentials }) => (
				<QueryView
					query={query}
					recordAnalytics={recordAnalytics}
					app={app}
					url={url}
					credentials={credentials}
				/>
			)}
		</SandboxContext.Consumer>
	);
};

export default QueryViewWrapper;
