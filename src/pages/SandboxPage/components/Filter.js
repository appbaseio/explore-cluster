import React from 'react';
import { Card, Icon, Button } from 'antd';
import { Link } from 'react-router-dom';
import { MultiList } from '@appbaseio/reactivesearch';

const Filter = props => {
	const {app} = props;
	return (
		<React.Fragment>
			{Object.keys(props.aggs.dataField).map((agg, index) => (
				<Card key={`list-${index}`}>
					<MultiList
						dataField={props.aggs.dataField[agg] === 'term' ? `${agg}.keyword` : agg}
						loader="Loading Items"
						componentId={`list-${index}`}
						size={props.aggs.size}
						includeNullValues={props.aggs.includeNullValues}
						sortBy={props.aggs.sortBy}
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
