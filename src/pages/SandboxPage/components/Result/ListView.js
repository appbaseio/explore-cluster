/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { ReactiveList } from '@appbaseio/reactivesearch';
import { Spin, Row, Col, Divider, Popover, Tag, Icon, Tooltip, Button } from 'antd';
import get from 'lodash/get';

import { listItem } from './styles';
import { children as childrenProp } from '../../../../utils/prop-types';
import Grading from './Grading';
import Expand from './Expand';

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

class ListItem extends React.Component {
	shouldComponentUpdate(nextProps) {
		const { item } = this.props;
		return JSON.stringify(item) !== JSON.stringify(nextProps.item);
	}

	render() {
		const { item } = this.props;
		const { _promoted, _click_id, _index, highlight, _type, index, ...rest } = item;
		return (
			<div className={listItem}>
				{_promoted && (
					<Tooltip title="Item promoted using Query Rules">
						<Tag color="#faad14">
							<Icon type="star" />
						</Tag>
					</Tooltip>
				)}
				<Expand>
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
												<pre
													dangerouslySetInnerHTML={{
														__html: JSON.stringify(rest[key]) || 'N/A',
													}}
												/>
											) : (
												<span
													dangerouslySetInnerHTML={{
														__html: JSON.stringify(rest[key]) || 'N/A',
													}}
												/>
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
				</Expand>

				<Grading id={item._id} />
				<Divider />
			</div>
		);
	}
}

ListItem.propTypes = {
	item: PropTypes.object,
};

ListItem.defaultProps = {
	item: {},
};

const renderLoadMore = ({ size, loadMore, data, loading }) => {
	if (!data || data.length % size !== 0) {
		return null;
	}

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

class ListView extends React.Component {
	shouldComponentUpdate(nextProps) {
		const { result } = this.props;
		return JSON.stringify(result) !== JSON.stringify(nextProps.result);
	}

	render() {
		const { result } = this.props;
		return (
			<React.Fragment>
				<Container hasPagination={result.pagination}>
					<ReactiveList
						{...result}
						dataField={get(result, 'dataField[0]', '_score')}
						scrollTarget="result-container"
						style={{ margin: '12px 0' }}
						componentId={result.id}
						render={({ data, loading, loadMore, triggerAnalytics }) => {
							if (loading && (!data || !data.length)) {
								return <Spin />;
							}
							return (
								<React.Fragment>
									{data.map((item) => (
										<div
											id={item._id}
											onClick={() => triggerAnalytics(item._click_id)}
										>
											<ListItem key={item._id} item={item} />
										</div>
									))}
									{result.pagination ||
										renderLoadMore({
											loading,
											loadMore,
											data,
											size: get(result, 'size', 10),
										})}
								</React.Fragment>
							);
						}}
					/>
				</Container>
			</React.Fragment>
		);
	}
}

ListView.propTypes = {
	result: PropTypes.object,
};

ListView.defaultProps = {
	result: {},
};

export default ListView;
