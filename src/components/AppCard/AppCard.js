import React from 'react';
import { Card, Icon } from 'antd';
import PropTypes from 'prop-types';

const AppCard = ({ title, data, appName }) => (
	<Card
		title={title}
		style={{
			paddingBottom: '15px',
			overflow: 'hidden',
		}}
		bodyStyle={{ paddingBottom: '40px' }}
	>
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
	appName: PropTypes.string.isRequired,
	data: PropTypes.object, // eslint-disable-line
	shared: PropTypes.bool, // eslint-disable-line
	permissions: PropTypes.object, // eslint-disable-line
};

export default AppCard;
