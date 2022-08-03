import React from 'react';
import { css } from 'emotion';
import { Card, Button, Tooltip } from 'antd';
import get from 'lodash/get';
import { string, object } from 'prop-types';
import { connect } from 'react-redux';
import Flex from '../../batteries/components/shared/Flex';
import DeployModal from './ExportInline/Components/DeployModal';
import DeployLogsModal from './ExportInline/Components/DeployLogsModal';
import { getDeploymentStatus, getAllVersions, deployUiBuilder } from './utils/sandpack-generator';
import { deployStatusMapper, getTemplate } from './utils/index';

const headerStyles = css`
	b {
		font-size: 15px;
	}
	.link-button {
		padding: 0;
		width: fit-content;
	}
	.overflow {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	.deploy-url {
		max-width: 100%;
	}
	.sub-part {
		max-width: 33%;
		flex-direction: column;
	}
`;

const getURL = () => {
	const { host, protocol } = new URL(
		localStorage.getItem('url') || sessionStorage.getItem('url'),
	);
	const username = localStorage.getItem('username') || sessionStorage.getItem('username');
	const password = localStorage.getItem('password') || sessionStorage.getItem('password');
	const uri = `${protocol}//${username}:${password}@${host}`;
	return uri;
};

class SyncStatus extends React.Component {
	constructor(props) {
		super(props);
		const { form } = props;
		this.myInterval = null;
		this.state = {
			exportType: form.get('exportSettings.type').value,
			documents: 0,
			// eslint-disable-next-line
			products: 0,
			// eslint-disable-next-line
			collections: 0,
			deploymentStatus: {},
			modalType: '',
			errMsg: '',
			isLoading: false,
			allVersions: [],
		};
		this.fetchData();
	}

	componentDidMount() {
		const { form } = this.props;
		const exportTypeHandler = form.get('exportSettings.type');
		exportTypeHandler.valueChanges.subscribe(this.handleTypeChange);
		this.fetchAllVersions();
		this.fetchDeploymentStatus();
	}

	componentWillUnmount() {
		const { form } = this.props;
		const exportTypeHandler = form.get('exportSettings.type');
		exportTypeHandler.valueChanges.unsubscribe(this.handleTypeChange);
	}

	get resyncURL() {
		const { index } = this.props;
		return `https://shopify-sync.appbase.io/?index=${index}&url=${getURL()}`;
	}

	get isShopify() {
		const { exportType } = this.state;
		return exportType === 'shopify';
	}

	handleTypeChange = (value) => {
		const { exportType } = this.state;
		if (exportType !== value)
			this.setState({
				exportType: value,
			});
	};

	fetchData = () => {
		const { index } = this.props;
		fetch(`${localStorage.getItem('url') || sessionStorage.getItem('url')}/${index}/_msearch`, {
			method: 'POST',
			headers: {
				Authorization: `Basic ${localStorage.getItem('authToken')}`,
				Accept: 'application/json',
				'Content-Type': 'application/x-ndjson',
			},
			body: `{}\n${JSON.stringify({
				query: { term: { type: 'products' } },
				size: 0,
			})}\n{}\n${JSON.stringify({
				query: { term: { type: 'collections' } },
				size: 0,
			})}\n{}\n${JSON.stringify({
				query: { match_all: {} },
				size: 0,
			})}\n`,
		})
			.then((res) => res.json())
			.then((res) => {
				this.setState({
					// eslint-disable-next-line
					products: get(res, 'responses[0].hits.total.value'),
					// eslint-disable-next-line
					collections: get(res, 'responses[1].hits.total.value'),
					documents: get(res, 'responses[2].hits.total.value'),
				});
			})
			.catch((e) => {
				console.error(e);
			});
	};

	handleDeploy = (body) => {
		const { preferenceId } = this.props;
		if (body.version_id === '') {
			// eslint-disable-next-line
			delete body.version_id;
		}
		deployUiBuilder(preferenceId, body)
			.then(() => {
				this.fetchDeploymentStatus('deployed');
				this.myInterval = setInterval(() => this.fetchDeploymentStatus(), 7000);
			})
			.catch((err) => {
				console.error(err);
				this.setState({
					isLoading: false,
				});
				if (err.message)
					this.setState({
						errMsg: err.message,
					});
				else
					this.setState({
						errMsg: 'Error in deployment',
					});
			});
	};

	fetchAllVersions = () => {
		const { preferenceId } = this.props;
		getAllVersions(preferenceId)
			.then((res) => {
				this.setState({
					allVersions: res.versions,
				});
			})
			.catch((err) => {
				console.error(err);
				// setErrMsg(err);
			});
	};

	fetchDeploymentStatus = (status = 'notDeployed') => {
		const { preferenceId } = this.props;
		getDeploymentStatus(preferenceId)
			.then((res) => {
				const state = res.status || res.state;
				this.setState({
					deploymentStatus: res,
				});
				if (status === 'deployed') {
					this.setState({
						modalType: 'deploy-logs',
					});
				}
				if (state === 'ERROR' || state === 'READY' || state === 'CANCELED')
					clearInterval(this.myInterval);
			})
			.catch((err) => {
				console.error(err);
				// setErrMsg(err);
			});
	};

	handleCancel = () => {
		this.setState({
			modalType: '',
		});
	};

	render() {
		const { documents, deploymentStatus, modalType, errMsg, isLoading, allVersions } =
			this.state;
		const { form } = this.props;
		const title = form.get('name') ? form.get('name').value : '';
		const themeType = form.get('themeType') ? form.get('themeType').value : '';
		const pipeline = form.get('pipeline') ? form.get('pipeline').value : '';
		const status = deploymentStatus.status || deploymentStatus.state;
		const templateObj = getTemplate(themeType);

		return (
			<Card>
				{pipeline ? (
					<div css={headerStyles}>
						<Flex
							justifyContent="space-between"
							// alignItems="center"
						>
							<Flex className="sub-part">
								<b>{title}</b>
								<Flex>Number of Documents: {documents}</Flex>

								<Button type="link" href="browse" className="link-button">
									Browse Data
								</Button>
							</Flex>

							<Flex className="sub-part">
								{themeType ? (
									<>
										<b>Search Template</b>
										<>{templateObj.label || themeType}</>
									</>
								) : null}
							</Flex>

							<Flex className="sub-part">
								{status ? (
									<>
										<div>
											<b>Deploy Status:</b> {status}{' '}
											{deployStatusMapper[status]}
										</div>
										{status === 'READY' ? (
											<Tooltip title={deploymentStatus.url}>
												<div className="deploy-url overflow">
													<b>Preview URL:</b> {deploymentStatus.url}
												</div>
											</Tooltip>
										) : null}

										<Button
											type="link"
											className="link-button"
											onClick={() =>
												this.setState({ modalType: 'deploy-logs' })
											}
										>
											View Details
										</Button>
									</>
								) : (
									<Button
										type="primary"
										onClick={() => this.setState({ modalType: 'deploy-modal' })}
									>
										Deploy
									</Button>
								)}
							</Flex>
						</Flex>
					</div>
				) : null}
				<DeployLogsModal
					open={modalType === 'deploy-logs'}
					handleCancel={this.handleCancel}
					deploymentStatus={deploymentStatus}
					uiBuilderName={title}
				/>
				<DeployModal
					errMsg={errMsg}
					setErrMsg={(msg) => {
						this.setState({
							errMsg: msg,
						});
					}}
					open={modalType === 'deploy-modal'}
					uiBuilderName={title}
					handleOk={(deployObj) => {
						this.setState({
							isLoading: true,
						});
						this.handleDeploy(deployObj);
					}}
					isLoading={isLoading}
					handleCancel={this.handleCancel}
					allVersions={allVersions}
				/>
			</Card>
		);
	}
}

SyncStatus.defaultProps = {
	preferenceId: '',
};

SyncStatus.propTypes = {
	index: string.isRequired,
	form: object.isRequired,
	preferenceId: string,
};

const mapStateToProps = (state, props) => ({
	index: props.pipeline || get(state, '$getCurrentApp.name'),
});

export default connect(mapStateToProps)(SyncStatus);
