import React from 'react';
import PropTypes from 'prop-types';
import { ReactiveList } from '@appbaseio/reactivesearch';
import get from 'lodash/get';

import { children as childrenProp } from '../../../../utils/prop-types';
import ResultList from './ResultList';

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

class ListView extends React.Component {
	shouldComponentUpdate(nextProps) {
		const { result } = this.props;
		return JSON.stringify(result) !== JSON.stringify(nextProps.result);
	}

	render() {
		const {
			result,
			showFeaturedProducts,
			onChange,
			value,
			selectButtonLabel,
			showFeaturedList,
		} = this.props;
		return (
			<React.Fragment>
				<Container hasPagination={result.pagination}>
					<ReactiveList
						{...result}
						dataField={get(result, 'dataField[0]', '_score')}
						scrollTarget="result-container"
						style={
							showFeaturedList
								? {
										margin: '12px 0',
										fontSize: '14px',
										color: '#707070',
										minHeight: '68vh',
								  }
								: { margin: '12px 0' }
						}
						componentId={result.id}
						showLoader={false}
						render={({ data, loading, loadMore, triggerAnalytics }) => {
							return (
								<ResultList
									data={data}
									loading={loading}
									loadMore={loadMore}
									triggerAnalytics={triggerAnalytics}
									pagination={result.pagination}
									size={get(result, 'size', 10)}
									showFeaturedProducts={showFeaturedProducts}
									selectButtonLabel={selectButtonLabel}
									value={value}
									onChange={onChange}
									showFeaturedList={showFeaturedList}
								/>
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
	showFeaturedProducts: PropTypes.bool,
	selectButtonLabel: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.array,
	showFeaturedList: PropTypes.bool,
};

ListView.defaultProps = {
	result: {},
	showFeaturedProducts: false,
	selectButtonLabel: undefined,
	onChange: () => {},
	value: [],
	showFeaturedList: false,
};

export default ListView;
