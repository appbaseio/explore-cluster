import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Spin, Button } from 'antd';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import ListItem from './ListItem';
import Flex from '../../../../batteries/components/shared/Flex';

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
	data: PropTypes.array,
	loading: PropTypes.bool,
};

LoadMore.defaultProps = {
	size: 0,
	data: [],
	loading: false,
};

class ResultList extends React.Component {
	shouldComponentUpdate(nextProps) {
		return Object.keys(this.props).some((propName) => {
			if (propName === 'data') {
				return !isEqual(get(this, `props.${propName}`, []), get(nextProps, propName, []));
			}
			if (propName === 'pagination') {
				return !isEqual(get(this, `props.${propName}`, {}), get(nextProps, propName, {}));
			}
			return get(this, `props.${propName}`) !== get(nextProps, propName);
		});
	}

	render() {
		const {
			data,
			loading,
			loadMore,
			triggerAnalytics,
			pagination,
			size,
			showFeaturedProducts,
			selectButtonLabel,
			onChange,
			value,
			showFeaturedList,
		} = this.props;

		if (loading && (!data || !data.length)) {
			return (
				<Flex justifyContent="center" alignItems="center">
					<Spin />
				</Flex>
			);
		}

		return (
			<>
				{data.map((item) => {
					return (
						<div key={item._id} onClick={() => triggerAnalytics(item._click_id)}>
							<ListItem
								key={item.id}
								item={item}
								showFeaturedProducts={showFeaturedProducts}
								value={value}
								onChange={onChange}
								selectButtonLabel={selectButtonLabel}
								showFeaturedList={showFeaturedList}
							/>
						</div>
					);
				})}

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
	showFeaturedProducts: PropTypes.bool,
	selectButtonLabel: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.array,
	showFeaturedList: PropTypes.bool,
};

ResultList.defaultProps = {
	data: null,
	pagination: null,
	size: 10,
	showFeaturedProducts: false,
	selectButtonLabel: undefined,
	onChange: () => {},
	value: [],
	showFeaturedList: false,
};

export default ResultList;
