import React, { Fragment } from 'react';
import { Row, Col, Button, Icon, Skeleton, Alert } from 'antd';
import { injectGlobal } from 'emotion';
import { connect } from 'react-redux';
import { string, object } from 'prop-types';
import get from 'lodash/get';
import Importer from '@appbaseio-confidential/importer';
import applyClusterSettings from '@appbaseio-confidential/importer/lib/utils/applyClusterSettings';

import Header from '../../components/Header';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { getUrlParams } from '../../utils/helper';

// Adding this style for Importer components because we dont import styles with Importer Library
import 'antd/es/upload/style/css';
import 'antd/es/select/style/css';
import 'antd/es/divider/style/css';
import 'antd/es/switch/style/css';
import 'antd/es/modal/style/css';
import 'antd/es/card/style/css';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';

// eslint-disable-next-line no-unused-expressions
injectGlobal`
	.ant-layout-header{
		background: white !important;
	}

	.ant-modal-confirm-body > .anticon + .ant-modal-confirm-title + .ant-modal-confirm-content {
    	margin-left: 0;
	}
`;

class ImporterPage extends React.Component {
	state = {
		preparingApp: true,
		destinationParams: null,
	};

	async componentDidMount() {
		const { type, appName: index } = this.props;
		const cluster = sessionStorage.getItem('cluster') || '';
		const { host, protocol } = new URL(sessionStorage.getItem('url'));
		const username = sessionStorage.getItem('username');
		const password = sessionStorage.getItem('password');
		const uri = `${protocol}//${username}:${password}@${host}`;

		if (type === 'cluster') {
			try {
				if (index) {
					const parameters = await applyClusterSettings(cluster, index);
					this.setState({
						destinationParams: parameters,
					});
				} else {
					this.setState({
						destinationParams: {
							index,
							cluster,
							type: 'AppbaseCluster',
							uri: `${uri}/${index}`,
							tier: 'paid',
							url: uri,
						},
					});
				}
			} catch (e) {
				console.error(e);
			}
			this.togglePreparing();
		} else {
			const parameters = {
				type: 'AppbaseCluster',
				clusterType: 'self-hosted',
				index,
				cluster: uri || '',
				uri: index ? `${uri}/${index}` : uri,
				tier: 'paid',
				url: uri,
			};
			this.setState({
				destinationParams: parameters,
			});
			this.togglePreparing();
		}
	}

	togglePreparing = () => {
		this.setState((prevState) => ({
			preparingApp: !prevState.preparingApp,
		}));
	};

	render() {
		const { user } = this.props;

		const { destinationParams, preparingApp } = this.state;
		const isLocalES = destinationParams
			? destinationParams.uri.includes('localhost') ||
			  destinationParams.uri.includes('127.0.0.1') ||
			  destinationParams.uri.includes('0.0.0.0')
			: false;
		const urlParams = getUrlParams(window.location.search);
		const loadSample = urlParams['load-data'] && JSON.parse(urlParams['load-data']);
		const sourceParams = loadSample
			? {
					subType: 'url',
					uri:
						'https://raw.githubusercontent.com/appbaseio/cdn/dev/appbase/ecommerce_data.json',
					extraType: 'SourceFile',
					type: 'json',
					useBulk: true,
			  }
			: undefined;
		return (
			<Fragment>
				<Header compact>
					<Row type="flex" justify="space-between" gutter={16}>
						<Col lg={18}>
							<h2>Import Data</h2>
							<Row>
								<Col lg={18}>
									<p>
										Bring data from JSON/CSV/Elasticsearch/SQL sources into
										appbase.io via GUI.
										<br />
										<br />
										Want to use other sources like MongoDB or 3rd party APIs?
										Read the{' '}
										<a
											href="https://docs.appbase.io/docs/data/Import/"
											target="_blank"
											rel="noopener noreferrer"
										>
											docs
										</a>
										.
									</p>
									{isLocalES ? (
										<Alert
											message={`Importer requires a reachable URL, you're currently using ${destinationParams.cluster} which doesn't seem to be reachable from an external service.`}
											type="warning"
											showIcon
										/>
									) : null}
								</Col>
							</Row>
						</Col>
						<Col
							lg={6}
							css={{
								display: 'flex !important',
								flexDirection: 'column-reverse !important',
								paddingBottom: 20,
							}}
						>
							<Button
								size="large"
								type="primary"
								href="https://appbase.io/contact/"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Icon type="form" />
								Contact Us
							</Button>
							<p
								css={{
									marginTop: 20,
									fontSize: 13,
									textAlign: 'center',
									lineHeight: '20px',
								}}
							>
								Need help with your dataset?
								<br />
								We now offer paid support.
							</p>
						</Col>
					</Row>
				</Header>
				<ErrorToaster>
					<section>
						{preparingApp ? (
							<div style={{ maxWidth: '80%', margin: '20px auto' }}>
								<h2>Preparing app for Import. This may take few seconds.</h2>
								<Skeleton active />
							</div>
						) : (
							<Importer
								initSource={sourceParams}
								initUser={
									user && user.data && user.data.email
										? user
										: { data: { email: 'user@arc.appbase.io' } }
								}
								arc
								embed
								initDestination={destinationParams}
							/>
						)}
					</section>
				</ErrorToaster>
			</Fragment>
		);
	}
}

ImporterPage.propTypes = {
	appName: string.isRequired,
	user: object,
	type: string,
};

ImporterPage.defaultProps = {
	user: {},
	type: '',
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : '',
		type: get(state, '$getAppPlan.results.billing_type'),
		user: get(state, 'user', { data: { email: 'user@arc.appbase.io' } }),
	};
};

export default withErrorToaster(connect(mapStateToProps)(ImporterPage));
