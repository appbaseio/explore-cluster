import React from 'react';
import { Card, Icon, Button } from 'antd';
import { Link } from 'react-router-dom';
import { MultiList } from '@appbaseio/reactivesearch';

const Filter = props => {
	const { app, aggs } = props;
	return (
		<React.Fragment>
			{aggs.map(agg => (
				<Card key={agg.dataField}>
					<MultiList
						{...agg}
						title={agg.id}
						renderNoResults={() => 'No Data Found'}
						componentId={agg.id}
						loader="Loading Items"
					/>
				</Card>
			))}

			<Link to={`/app/${app}/aggs`}>
				<Button style={{ marginTop: 8 }} block type="primary">
					<Icon type="edit" />
					Set Aggregations
				</Button>
			</Link>
		</React.Fragment>
	);
};

export default Filter;
