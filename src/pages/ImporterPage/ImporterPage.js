import React, { Fragment } from 'react';
import {
 Row, Col, Button, Icon, Skeleton, Alert,
} from 'antd';
import { injectGlobal } from 'emotion';
import { connect } from 'react-redux';
import { string } from 'prop-types';
import get from 'lodash/get';
import Importer from '@appbaseio-confidential/importer';
import applyClusterSettings from '@appbaseio-confidential/importer/lib/utils/applyClusterSettings';
import PCKG from '@appbaseio-confidential/importer/package.json';


import Header from '../../components/Header';
import { IMPORTER_LINK } from '../../constants/config';

console.log("IMPORTER PACKAGE VERSION", PCKG.version)

injectGlobal`
	.ant-layout-header{
		background: white !important;
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
		if (type !== 'arc') {
			try {
				const parameters = await applyClusterSettings(cluster, index);
				this.setState({
					destinationParams: parameters,
				});
			} catch (e) {
				console.error(e);
			}
			this.togglePreparing();
		} else {
			const { host, protocol } = new URL(sessionStorage.getItem('url'));
			const username = sessionStorage.getItem('username');
			const password = sessionStorage.getItem('password');
			const uri = `${protocol}//${username}:${password}@${host}`;
			const parameters = {
				type: 'AppbaseCluster',
				clusterType: 'self-hosted',
				index,
				cluster: uri || '',
				uri,
				tier: 'paid',
			};
			this.setState({
				destinationParams: parameters,
			});
			this.togglePreparing();
		}
	}

	togglePreparing = () => {
		this.setState(prevState => ({
			preparingApp: !prevState.preparingApp,
		}));
	};

	render() {
		const {
 appName, credentials, type, user,
} = this.props;

		const { destinationParams, preparingApp } = this.state;
		const isLocalES = destinationParams
			? destinationParams.uri.includes('localhost')
			  || destinationParams.uri.includes('127.0.0.1')
			  || destinationParams.uri.includes('0.0.0.0')
			: false;
		return (
			<Fragment>
				<Header compact>
					<Row type="flex" justify="space-between" gutter={16}>
						<Col lg={18}>
							<h2>Import Data</h2>
							<Row>
								<Col lg={18}>
									<p>
										Bring your data from JSON or CSV files into appbase.io via
										the Import GUI.
										<br />
										<br />
										Or use our CLI tool for importing data from data sources
										like MongoDB, Postgres, MySQL -{' '}
										<a
											href="https://medium.appbase.io/abc-import-import-your-mongodb-sql-json-csv-data-into-elasticsearch-a202cafafc0d"
											target="_blank"
											rel="noopener noreferrer"
										>
											learn more
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
				<section>
					{preparingApp ? (
						<div style={{ maxWidth: '80%', margin: '20px auto' }}>
							<h2>Preparing app for Import. This may take few seconds.</h2>
							<Skeleton active />
						</div>
					) : (
						<Importer initUser={user} arc embed initDestination={destinationParams} />
					)}
				</section>
			</Fragment>
		);
	}
}

ImporterPage.propTypes = {
	appName: string.isRequired,
	credentials: string.isRequired,
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : '',
		type: get(state, '$getAppPlan.results.billing_type'),
		user: get(state, 'user', { data: {} }),
	};
};

export default connect(mapStateToProps)(ImporterPage);
