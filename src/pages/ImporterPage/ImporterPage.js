import React, { Fragment } from 'react';
import {
 Row, Col, Button, Icon,
} from 'antd';
import { connect } from 'react-redux';
import { string } from 'prop-types';
import get from 'lodash/get';
import URL from 'url-parser-lite';

import Header from '../../components/Header';
import { IMPORTER_LINK, getURL } from '../../constants/config';

function getLink(appname, credentials) {
	const API = getURL();
	const { protocol, host } = URL(API);
	const url = `${protocol}://${credentials}@${host}`;

	const parameters = {
		appname,
		hosturl: url,
		platform: 'elasticsearch',
	};
	return `${IMPORTER_LINK}${JSON.stringify(parameters)}&header=false`;
}

const ImporterPage = ({ appName, credentials }) => (
	<Fragment>
		<Header compact>
			<Row type="flex" justify="space-between" gutter={16}>
				<Col lg={18}>
					<h2>Import Data</h2>
					<Row>
						<Col lg={18}>
							<p>
								Bring your data from JSON or CSV files into appbase.io via the
								Import GUI.
								<br />
								<br />
								Or use our CLI tool for importing data from data sources like
								MongoDB, Postgres, MySQL -{' '}
								<a
									href="https://medium.appbase.io/abc-import-import-your-mongodb-sql-json-csv-data-into-elasticsearch-a202cafafc0d"
									target="_blank"
									rel="noopener noreferrer"
								>
									learn more
								</a>
								.
							</p>
						</Col>
					</Row>
				</Col>
				<Col
					lg={6}
					css={{
						display: 'flex',
						flexDirection: 'column-reverse',
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
			<iframe
				title="Importer"
				src={getLink(appName, credentials)}
				frameBorder="0"
				width="100%"
				height={`${window.innerHeight - 243 || 600}px`}
			/>
		</section>
	</Fragment>
);

ImporterPage.propTypes = {
	appName: string.isRequired,
	credentials: string.isRequired,
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : '',
	};
};

export default connect(mapStateToProps)(ImporterPage);
