import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, message, Typography } from 'antd';
import Appbase from 'appbase-js';
import { css } from 'emotion';
import { get } from 'lodash';

import AceEditor from '../../../../batteries/components/SearchSandbox/containers/AceEditor';

import { isValidJSON } from '../../utils';

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
			isValid: isValidJSON(JSON.stringify(query)),
			isExecuting: false,
			response: null,
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
				response: null,
				isValid: isValidJSON(JSON.stringify(query)),
			});
		}
	}

	toggleExecutionStatus = () => {
		this.setState((prevState) => ({
			isExecuting: !prevState.isExecuting,
		}));
	};

	handleEditor = (value) => {
		const isValid = isValidJSON(value);
		if (isValid) {
			const parsedQuery = JSON.parse(value);

			if (!Array.isArray(get(parsedQuery, 'query'))) {
				console.error('Cannot execute with empty query.');
				return;
			}

			const isNotValidId = parsedQuery.query.some(
				(item) =>
					!(item.id === 'search' || item.id === 'result' || item.id.startsWith('list')),
			);

			if (isNotValidId) {
				message.error('Changing id is not allowed.');
				this.forceUpdate();
				return;
			}
			this.setState({
				query: value,
				isValid,
				response: null,
			});
		} else {
			this.setState({
				isValid,
				query: value,
			});
		}
	};

	runQuery = () => {
		const { query } = this.state;
		const { onChange, toggleAnalytics } = this.props;

		const parsedQuery = JSON.parse(query);
		this.toggleExecutionStatus();
		this.appbaseRef
			.reactiveSearchv3(parsedQuery.query, {
				...get(parsedQuery, 'settings', {}),
			})
			.then((res) => {
				this.setState({
					response: JSON.stringify(res, null, 4),
				});
				if (onChange) {
					onChange(parsedQuery.query);
					toggleAnalytics(!!parsedQuery.settings.recordAnalytics);
				}
				this.toggleExecutionStatus();
			})
			.catch((e) => {
				this.toggleExecutionStatus();
				message.error(e.message);
				console.log(e);
			});
	};

	render() {
		const { query, isValid, isExecuting, response } = this.state;
		return (
			<React.Fragment>
				<Typography.Text className={headingStyle} strong>
					Request Body
				</Typography.Text>
				<AceEditor
					mode="json"
					value={query}
					theme="monokai"
					name="query-editor"
					onChange={this.handleEditor}
					fontSize={14}
					showPrintMargin={false}
					style={{ width: '100%', borderRadius: 4, margin: '12px 0' }}
					showGutter
					highlightActiveLine
					setOptions={{
						showLineNumbers: false,
						tabSize: 4,
					}}
					editorProps={{ $blockScrolling: true }}
				/>
				<Button disabled={!isValid} onClick={this.runQuery}>
					<Icon type={isExecuting ? 'loading' : 'play-circle'} />
					Validate & Run
				</Button>
				{response && (
					<div>
						<Typography.Text className={headingStyle} strong>
							Response
						</Typography.Text>
						<AceEditor
							mode="json"
							value={response}
							readOnly
							name="query-response"
							fontSize={14}
							showPrintMargin={false}
							style={{
								width: '100%',
								borderRadius: 4,
								border: '1px solid rgba(0,0,0,0.15)',
								margin: '12px 0',
							}}
							showGutter
							setOptions={{
								showLineNumbers: false,
								tabSize: 4,
							}}
							editorProps={{ $blockScrolling: true }}
						/>
					</div>
				)}
			</React.Fragment>
		);
	}
}

QueryView.propTypes = {
	query: PropTypes.object,
	app: PropTypes.string.isRequired,
	url: PropTypes.string,
	credentials: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	toggleAnalytics: PropTypes.func,
	recordAnalytics: PropTypes.bool,
};

QueryView.defaultProps = {
	query: {},
	url: undefined,
	onChange: null,
	toggleAnalytics: () => {},
	recordAnalytics: true,
};

export default QueryView;
