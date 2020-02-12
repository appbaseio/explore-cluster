import React from 'react';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import { Button, Icon, Card, Typography } from 'antd';

const container = css`
	padding: 50px;
`;

const QueryRulesForm = () => {
	return (
		<div className={container}>
			<Link to="/cluster/rules">
				<Button>
					<Icon type="arrow-left" />
					Back to Rules
				</Button>
			</Link>
			<Card hoverable style={{ margin: '10px 0' }}>
				<Typography.Title level={4}>Create Query Rule</Typography.Title>
			</Card>
		</div>
	);
};

export default QueryRulesForm;
