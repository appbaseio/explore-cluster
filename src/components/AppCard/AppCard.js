import React from 'react';
import { Card, Icon } from 'antd';
import PropTypes from 'prop-types';

import StatsBox from './StatsBox';

const AppCard = ({ title, data }) => (
	<Card
		title={title}
		style={{
			paddingBottom: '15px',
			overflow: 'hidden',
		}}
		bodyStyle={{ paddingBottom: '40px' }}
	>
		<StatsBox data={data} />
		<div
			css={{
				color: '#aaa',
				position: 'absolute',
				bottom: 10,
				textAlign: 'center',
				width: 'calc(100% - 48px)',
			}}
		>
			<Icon type="ellipsis" theme="outlined" />
		</div>
	</Card>
);

AppCard.propTypes = {
	title: PropTypes.node.isRequired,
	data: PropTypes.object, // eslint-disable-line
};

export default AppCard;
