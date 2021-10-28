import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { Card, Modal, Button, notification } from 'antd';
import { FieldControl, FormBuilder, Validators, FieldGroup } from 'react-reactive-form';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getAppStoredQuery, getPermission } from '../../batteries/modules/actions';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import { jsonValidator, getString } from './utils';
import Grid from '../CreateCredentials/Grid';
import { getURL } from '../../constants/config';
import Monaco from '../../batteries/components/SearchSandbox/containers/MonacoEditor';

const main = css`
	margin-bottom: 15px;
	.ant-card-body {
		background-color: transparent;
	}
`;

class GetAPIEndpoint extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			queryStr: '',
		};
		this.url = `${getURL()}/_storedquery/${props.storedQueryId}/execute`;
		this.form = FormBuilder.group({
			query: [null, [Validators.required, jsonValidator]],
		});
		if (!props.credentials) {
			const { fetchPermissions } = props;
			fetchPermissions();
		}
		props.fetchStoredQuery(props.storedQueryId).then((action) => {
			if (get(action, 'payload')) {
				const value = get(action, 'payload');
				const source = get(value, 'query');
				const params = get(value, 'params');
				const queryStr = getString(source);
				this.form.patchValue({
					query: getString({
						params,
					}),
				});
				this.setState({
					queryStr,
				});
			}
		});
	}

	componentWillUnmount() {
		this.form.reset();
	}

	get request() {
		const {
			value: { query },
		} = this.form;
		const { credentials } = this.props;
		const { username, password } = credentials || {};
		return `curl -X POST ${
			this.url
		} -H 'Content-Type: application/json' -H 'Authorization: ${`Basic ${btoa(
			`${username}:${password}`,
		)}`}' -d'
${getString(query)}
'`;
	}

	handleCopyCred = () => {
		notification.success({
			message: 'Request has been copied successfully!',
		});
	};

	render() {
		const { queryStr } = this.state;
		const { visible, handleCancel } = this.props;
		const { isLoading } = this.props;
		return (
			<FieldGroup
				strict={false}
				control={this.form}
				render={({ invalid }) => (
					<Modal
						title="API Endpoint"
						visible={visible}
						okText="Copy as cURL"
						okButtonProps={{
							disabled: invalid,
						}}
						onCancel={() => handleCancel()}
						footer={[
							<Button key="back" onClick={() => handleCancel()}>
								Cancel
							</Button>,
							<CopyToClipboard
								key="ok"
								text={this.request}
								onCopy={this.handleCopyCred}
							>
								<Button type="primary" disabled={invalid}>
									Copy as cURL
								</Button>
							</CopyToClipboard>,
						]}
						width="100%"
						style={{
							maxWidth: 850,
						}}
					>
						{isLoading ? (
							<Loader />
						) : (
							<React.Fragment>
								<Card css={main} title="Source Query">
									<pre>{queryStr}</pre>
								</Card>
								<Grid
									gridRatio={0.1}
									label="URL"
									component={<div>{this.url}</div>}
								/>
								<Grid
									gridRatio={0.1}
									label="Body"
									component={
										<FieldControl
											name="query"
											render={() => {
												const editorValue = this.form.get('query').value;
												return (
													<Monaco
														defaultValue="{}"
														language="json"
														value={editorValue}
														onChange={(value) => {
															this.form.get('query').setValue(value);
														}}
														theme="vs-dark"
														options={{
															cursorStyle: 'line',
															lineNumbersMinChars: 2,
															fontFamily: 'Monaco, monospace',
															fontSize: 14,
															padding: {
																top: 10,
																bottom: 10,
															},
															minimap: {
																enabled: false,
															},
														}}
														height="300px"
														width="100%"
													/>
												);
											}}
										/>
									}
								/>
							</React.Fragment>
						)}
					</Modal>
				)}
			/>
		);
	}
}

GetAPIEndpoint.defaultProps = {
	credentials: undefined,
};

GetAPIEndpoint.propTypes = {
	visible: PropTypes.bool.isRequired,
	handleCancel: PropTypes.func.isRequired,
	storedQueryId: PropTypes.string.isRequired,
	credentials: PropTypes.object,
	isLoading: PropTypes.bool.isRequired,
	fetchStoredQuery: PropTypes.func.isRequired,
	fetchPermissions: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	isLoading:
		get(state, '$getAppTemplate.isFetching', false) ||
		get(state, '$getAppPermissions.isFetching', false),
	credentials: get(state, 'user.data', {}),
});

const mapDispatchToProps = (dispatch) => ({
	fetchStoredQuery: (id) => dispatch(getAppStoredQuery(id)),
	fetchPermissions: (appName) => dispatch(getPermission(appName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GetAPIEndpoint);
