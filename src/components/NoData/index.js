import { Button, Icon } from 'antd';
import React from 'react';

const NoData = (onCreateModalChange) => (
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

export default NoData;
