import React from 'react';
import { Card, Button, Icon, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { DataSearch, SelectedFilters } from '@appbaseio/reactivesearch';

const Search = props => {
	const { app, search } = props;
	return (
		<Card>
			<Row type="flex" gutter={8} align="middle" justify="space-between">
				<Col xs={20}>
					<DataSearch {...search} autosuggest componentId={search.id} />
				</Col>
				<Col xs={4}>
					<Link to={`/app/${app}/search-settings`}>
						<Button size="large" ghost type="primary">
							<Icon type="edit" />
							Set Search
						</Button>
					</Link>
				</Col>
				<Col xs={24}>
					<SelectedFilters />
				</Col>
			</Row>
		</Card>
	);
};

export default Search;
