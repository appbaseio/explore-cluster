import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Spin, Button } from 'antd';
import isEqual from 'lodash/isEqual';
import ListItem from './ListItem';

const LoadMore = ({ size, loadMore, data, loading }) => {
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

LoadMore.propTypes = {
	size: PropTypes.number,
	loadMore: PropTypes.func.isRequired,
	data: PropTypes.object,
	loading: PropTypes.bool,
};

LoadMore.defaultProps = {
	size: 0,
	data: {},
	loading: false,
};

class ResultList extends React.Component {
	shouldComponentUpdate(nextProps) {
		const { loading, data, pagination, size } = this.props;
		if (
			loading !== nextProps.loading ||
			size !== nextProps.size ||
			!isEqual(data, nextProps.data) ||
			!isEqual(pagination, nextProps.pagination)
		) {
			return true;
		}

		return false;
	}

	render() {
		const { data, loading, loadMore, triggerAnalytics, pagination, size } = this.props;

		if (loading && (!data || !data.length)) {
			return <Spin />;
		}

		return (
			<>
				{data.map((item) => (
					<div key={item.id} onClick={() => triggerAnalytics(item._click_id)}>
						<ListItem key={item.id} item={item} />
					</div>
				))}

				{pagination || (
					<LoadMore loading={loading} loadMore={loadMore} data={data} size={size} />
				)}
			</>
		);
	}
}

ResultList.propTypes = {
	data: PropTypes.array,
	pagination: PropTypes.any,
	size: PropTypes.number,
	loading: PropTypes.bool.isRequired,
	loadMore: PropTypes.func.isRequired,
	triggerAnalytics: PropTypes.func.isRequired,
};

ResultList.defaultProps = {
	data: null,
	pagination: null,
	size: 10,
};

export default ResultList;
