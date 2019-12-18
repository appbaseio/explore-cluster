import React from 'react';
import PropTypes from 'prop-types';
import { Col, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { css } from 'emotion';
import AppCard from '../AppCard';
import AppTable from '../AppTable';
import AppFilters from '../AppFilters';

const noData = css`
	background-color: #ffffff;
	margin: 0 10px;
	padding: 40px;
`;

function AppDataWrapper({ apps }) {
	const renderData = (data, showListView) => {
		if (showListView) return <AppTable apps={data} />;
		if (data.length === 0) return <Empty className={noData} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
		return data.map((app) => {
			const title = (
				<div
					css={{
						display: 'flex',
						justifyContent: 'space-between',
						height: 32,
						alignItems: 'center',
					}}
				>
					{app.index}
				</div>
			);

			return (
				<Col
					style={{ paddingLeft: '10px', paddingRight: '10px' }}
					key={app.index}
					lg={8}
					md={12}
					sm={24}
				>
					<Link
						to={`/app/${app.index}/overview`}
						css={{ marginBottom: 20, display: 'block' }}
					>
						<AppCard key={app.index} title={title} data={app} />
					</Link>
				</Col>
			);
		});
	};
	return (
		<AppFilters apps={Object.values(apps.data || {})}>
			{(filteredData, showListView) => renderData(filteredData, showListView)}
		</AppFilters>
	);
}

AppDataWrapper.propTypes = {
	apps: PropTypes.object,
};

AppDataWrapper.defaultProps = {
	apps: {},
};

export default AppDataWrapper;
