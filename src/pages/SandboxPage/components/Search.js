import React from 'react';
import { Card, Button, Icon, Row, Col } from 'antd';
import { DataSearch } from '@appbaseio/reactivesearch';

const Search = props => {
	return (
		<Card>
			<Row type="flex" gutter={8} align="middle" justify="space-between">
				<Col xs={20}>
					<DataSearch {...props.search} componentId="search" />
				</Col>
				<Col xs={4}>
					<Button size="large" ghost type="primary">
						<Icon type="edit" />
						Set Search
					</Button>
				</Col>
			</Row>
		</Card>
	);
};

export default Search;
