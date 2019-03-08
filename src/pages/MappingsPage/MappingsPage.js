import React, { Fragment } from 'react';
import { Row, Col } from 'antd';
import { string } from 'prop-types';

import Header from '../../components/Header';
import Mappings from '../../batteries/components/Mappings';

const MappingsPage = ({ appName }) => (
	<Fragment>
		<Header compact>
			<Row type="flex" justify="space-between" gutter={16}>
				<Col lg={18}>
					<h2>App Settings</h2>

					<Row>
						<Col lg={18}>
							<p>
								View mappings, edit use-case and data types, add or delete fields -{' '}
								<a
									href="https://docs.appbase.io/concepts/mappings.html"
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
			</Row>
		</Header>
		<section>
			<Mappings key={appName} appName={appName} appId={appName} />
		</section>
	</Fragment>
);

MappingsPage.propTypes = {
	appName: string.isRequired,
};

export default MappingsPage;
