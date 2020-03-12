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
					{search.dataField && search.dataField.length ? null : (
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: '100%',
								background: 'rgba(255,255,255,0.6)',
								zIndex: 2,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							Set searchable fields to enable search.
						</div>
					)}
					<DataSearch {...search} autosuggest componentId={search.id} />
				</Col>
				<Col xs={4}>
					<Link to={`/app/${app}/search`}>
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
