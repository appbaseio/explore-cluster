import React from 'react';
import { Card, Icon, Button } from 'antd';
import { MultiList } from '@appbaseio/reactivesearch';

const Filter = props => {
	return (
		<React.Fragment>
			{props.aggs.map((agg, index) => (
				<Card key={`list-${index}`}>
					<MultiList {...agg} loader="Loading Items" componentId={`list-${index}`} />
				</Card>
			))}
			<Button style={{ marginTop: 8 }} block type="primary">
				<Icon type="edit" />
				Set Aggregations
			</Button>
		</React.Fragment>
	);
};

export default Filter;
