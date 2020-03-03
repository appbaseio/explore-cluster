import React from 'react';
import { Button, Icon, message, Typography } from 'antd';
import Appbase from 'appbase-js';
import { css } from 'emotion';

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
		const { query, app, url, credentials } = props;
		this.appbaseRef = Appbase({
			app,
			url,
			credentials,
		});

		this.state = {
			query: JSON.stringify(query, null, 4),
			isValid: isValidJSON(query),
			isExecuting: false,
			response: null,
		};
	}

	toggleExecutionStatus = () => {
		this.setState(prevState => ({
			isExecuting: !prevState.isExecuting,
		}));
	};

	handleEditor = value => {
		const isValid = isValidJSON(value);
		if (isValid) {
			const parsedQuery = JSON.parse(value);
			const isNotValidId = parsedQuery.some(
				item =>
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
		}
	};

	runQuery = () => {
		const { query } = this.state;
		const { onChange } = this.props;

		const parsedQuery = JSON.parse(query);
		this.toggleExecutionStatus();
		this.appbaseRef
			.reactiveSearchv3(parsedQuery)
			.then(res => {
				this.setState({
					response: JSON.stringify(res, null, 4),
				});
				if (onChange) {
					onChange(parsedQuery);
				}
				this.toggleExecutionStatus();
			})
			.catch(e => {
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

export default QueryView;
