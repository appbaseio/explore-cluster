import React from 'react';
import PropTypes from 'prop-types';

import { Button, Col, Icon, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { css } from 'emotion';
import AppCard from '../AppCard';
import AppTable from '../AppTable';
import AppFilters from '../AppFilters';

const noData = css`
	background-color: #ffffff;
	color: rgba(0, 0, 0, 0.25);
	font-size: 14px;
	text-align: center;
	margin: 0 10px;
	padding: 16px;
`;

export function renderNoData(onCreateModalChange) {
	return (
		<>
			<Icon
				type="exclamation-circle"
				theme="outlined"
				style={{
					fontSize: 16,
					marginBottom: 10,
				}}
			/>
			<h4>No indices found</h4>
			<Button onClick={onCreateModalChange}>Create a new index</Button>
		</>
	);
}

function AppDataWrapper({ apps, onCreateModalChange }) {
	const renderData = (data, showListView) => {
		if (showListView) return <AppTable onCreateModalChange={onCreateModalChange} apps={data} />;
		if (data.length === 0) {
			return <div className={noData}>{renderNoData(onCreateModalChange)}</div>;
		}
		return data.map(app => {
			const title = (
				<div
					css={{
						display: 'flex',
						justifyContent: 'space-between',
						height: 32,
						alignItems: 'center',
					}}
				>
					{app.alias || app.index}
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
					<div css={{ marginBottom: 20, display: 'block', cursor: 'pointer' }}>
						<AppCard key={app.index} title={title} data={app} />
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
};

AppDataWrapper.defaultProps = {
	apps: {},
};

export default AppDataWrapper;
