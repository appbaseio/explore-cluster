import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Col } from 'antd';
import { css } from 'emotion';
import AppCard from '../AppCard';
import AppTable from '../AppTable';
import AppFilters from '../AppFilters';
import NoData from '../NoData';
import Loader from '../Loader';

const noData = css`
	background-color: #ffffff;
	color: rgba(0, 0, 0, 0.25);
	font-size: 14px;
	text-align: center;
	margin: 0 10px;
	padding: 16px;
`;

function AppDataWrapper({ apps, onCreateModalChange, isFetching }) {
	const renderData = (data, showListView) => {
		if (isFetching) return <Loader style={{ marginTop: 40 }} />;
		if (showListView) return <AppTable onCreateModalChange={onCreateModalChange} apps={data} />;
		if (data.length === 0) {
			return (
				<div className={noData}>
					<NoData onCreateModalChange={onCreateModalChange} />
				</div>
			);
		}
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
					{get(app, 'alias') || get(app, 'index')}
				</div>
			);

			return (
				<Col
					style={{ paddingLeft: '10px', paddingRight: '10px' }}
					key={get(app, 'index')}
					lg={8}
					md={12}
					sm={24}
				>
					<div css={{ marginBottom: 20, display: 'block', cursor: 'pointer' }}>
						<AppCard key={get(app, 'index')} title={title} data={app} />
					</div>
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
	onCreateModalChange: PropTypes.func,
	isFetching: PropTypes.bool,
};

AppDataWrapper.defaultProps = {
	apps: {},
	onCreateModalChange: () => {},
	isFetching: false,
};

export default AppDataWrapper;
