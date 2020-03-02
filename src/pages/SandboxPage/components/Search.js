import React from 'react';
import { Card, Button, Icon, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { DataSearch } from '@appbaseio/reactivesearch';

const Search = props => {
	const { app } = props;
	return (
		<Card>
			<Row type="flex" gutter={8} align="middle" justify="space-between">
				<Col xs={20}>
					<DataSearch
						dataField={props.search.dataField
							.reduce(
								(agg, field) =>
									agg
										? `${field}, ${field}.search`
										: `${agg}, ${field}, ${field}.search`,
								'',
							)
							.split(',')}
						fieldWeights={props.search.fieldWeights.reduce((agg, weight) => {
							return agg.concat([weight, weight]);
						}, [])}
						autosuggest
						componentId="search"
					/>
				</Col>
				<Col xs={4}>
					<Link to={`/app/${app}/search-settings`}>
						<Button size="large" ghost type="primary">
							<Icon type="edit" />
							Set Search
						</Button>
					</Link>
				</Col>
			</Row>
		</Card>
	);
};

export default Search;
