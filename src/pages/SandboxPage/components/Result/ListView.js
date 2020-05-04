/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { ReactiveList } from '@appbaseio/reactivesearch';
import ExpandCollapse from 'react-expand-collapse';
import { Spin, Row, Col, Divider, Popover, Tag, Icon, Tooltip, Button } from 'antd';

import { listItem } from './styles';
import { children as childrenProp } from '../../../../utils/prop-types';

const Container = ({ hasPagination, children }) => {
	if (hasPagination) {
		return children;
	}
	return <div id="result-container">{children}</div>;
};

Container.propTypes = {
	hasPagination: PropTypes.bool,
	children: childrenProp.isRequired,
};

Container.defaultProps = {
	hasPagination: false,
};

const ListItemWrapper = ({ item }) => {
	const { _promoted, _click_id, _index, highlight, index, ...rest } = item;
	return (
		<div className={listItem}>
			{_promoted && (
				<Tooltip title="Item promoted using Query Rules">
					<Tag color="#faad14">
						<Icon type="star" />
					</Tag>
				</Tooltip>
			)}
			<ExpandCollapse previewHeight="200px" expandText="Show more">
				<Row className="row" gutter={8}>
					{Object.keys(rest).map((key) => (
						<React.Fragment key={key}>
							<Col md={10}>{key}</Col>
							<Col md={1} className="text-center">
								:
							</Col>
							<Col md={11} className="text-ellipsis">
								<Popover
									content={
										typeof rest[key] === 'object' ? (
											<pre>{JSON.stringify(rest[key], null, 4)}</pre>
										) : (
											rest[key]
										)
									}
								>
									{typeof rest[key] === 'object' ? (
										JSON.stringify(rest[key])
									) : (
										<span
											dangerouslySetInnerHTML={{
												__html: JSON.stringify(rest[key]) || 'N/A',
											}}
										/>
									)}
								</Popover>
							</Col>
						</React.Fragment>
					))}
				</Row>
			</ExpandCollapse>
			<Divider />
		</div>
	);
};

ListItemWrapper.propTypes = {
	item: PropTypes.object,
};

ListItemWrapper.defaultProps = {
	item: {},
};

const renderLoadMore = ({ size, loadMore, data, loading }) => {
	if (data.length < size) {
		return null;
	}

	return (
		<Button onClick={loadMore} block type="primary" ghost>
			{loading && <Icon type="loading" />}
			Load More
		</Button>
	);
};

renderLoadMore.propTypes = {
	size: PropTypes.number,
	loadMore: PropTypes.func.isRequired,
	data: PropTypes.object,
	loading: PropTypes.bool,
};

renderLoadMore.defaultProps = {
	size: 0,
	data: {},
	loading: false,
};

const ListItem = React.memo(ListItemWrapper);

const ListView = ({ result }) => (
	<React.Fragment>
		<Container hasPagination={result.pagination}>
			<ReactiveList
				{...result}
				scrollTarget="result-container"
				style={{ margin: '12px 0' }}
				componentId={result.id}
				render={({ data, loading, loadMore }) => {
					if (loading && (!data || !data.length)) {
						return <Spin />;
					}
					return (
						<React.Fragment>
							{data.map((item) => (
								<ListItem key={item._id} item={item} />
							))}
							{result.pagination ||
								renderLoadMore({ loading, loadMore, data, size: result.size })}
						</React.Fragment>
					);
				}}
			/>
		</Container>
	</React.Fragment>
);

ListView.propTypes = {
	result: PropTypes.object,
};

ListView.defaultProps = {
	result: {},
};

export default ListView;
