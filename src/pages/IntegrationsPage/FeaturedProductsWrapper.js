import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Row, Col } from 'antd';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import Loadable from 'react-loadable';
import { css } from 'emotion';
import Loader from '../../components/Loader';
import ListView from '../SandboxPage/components/Result/ListView';

const { TabPane } = Tabs;

const container = css`
	width: 94%;
	padding: 16px;
	padding-right: 40px;
	padding-left: 40px;
	margin-top: 20px;
	margin-right: 30px;
	margin-left: 30px;
	.my-24 {
		margin-bottom: 16px;
	}
`;

const SearchPreview = Loadable({
	loader: () =>
		import(
			/* webpackChunkName: "SearchPreviewComponent" */ '../SandboxPage/components/SearchPreview'
		),
	loading: Loader,
});

const getKey = (value) => `featured_list__${JSON.stringify(value)}`;

const FeaturedProductsWrapper = (props) => {
	const {
		appName,
		testSettings,
		toggleVisibility,
		selectButtonLabel,
		value,
		onChange,
		credentials,
		url,
	} = props;
	const [tabKey, changeKey] = useState(getKey(value));
	const [defaultKey, changeDefaultKey] = useState('1');
	useEffect(() => {
		if (String(defaultKey) === String(2)) {
			changeKey(getKey(value));
		}
	}, [defaultKey, value]);
	const defaultQuery = () => {
		return {
			query: {
				terms: {
					_id: value,
				},
			},
		};
	};
	return (
		<Tabs
			onChange={(tab) => {
				if (String(tab) === String(2)) {
					changeKey(getKey(value));
				}
				changeDefaultKey(tab);
			}}
			key={tabKey}
			defaultActiveKey={defaultKey}
		>
			<TabPane tab="Browse Products" key="1">
				<SearchPreview
					app={appName}
					testSettings={testSettings}
					hasTestSettings
					handleModal={toggleVisibility}
					showFeaturedProducts
					selectButtonLabel={selectButtonLabel}
					value={value}
					onChange={onChange}
				/>
			</TabPane>
			<TabPane tab="Featured List" key="2">
				<Row className={container}>
					<Col xs={24}>
						<ReactiveBase
							app={appName}
							enableAppbase
							credentials={credentials}
							url={url}
							appbaseConfig={{
								recordAnalytics: false,
							}}
						>
							<ListView
								result={{
									id: 'resultList',
									defaultQuery,
									renderResultStats(stats) {
										return (
											<div
												style={{
													marginBottom: '25px',
													marginLeft: '-20px',
													fontSize: 14,
													color: '#999999',
												}}
											>
												{`Found ${stats.numberOfResults} featured ${
													stats.numberOfResults > 1
														? 'products'
														: 'product'
												}`}
											</div>
										);
									},
									renderNoResults() {
										return (
											<div
												style={{
													marginLeft: '-20px',
													fontSize: 14,
													color: '#999999',
												}}
											>
												No products are featured. Go to <strong>Browse Products</strong> to
												feature some.
											</div>
										);
									},
								}}
								showFeaturedProducts
								selectButtonLabel={selectButtonLabel}
								value={value}
								onChange={onChange}
								showFeaturedList
							/>
						</ReactiveBase>
					</Col>
				</Row>
			</TabPane>
		</Tabs>
	);
};

FeaturedProductsWrapper.propTypes = {
	appName: PropTypes.string.isRequired,
	testSettings: PropTypes.object.isRequired,
	toggleVisibility: PropTypes.func.isRequired,
	selectButtonLabel: PropTypes.string,
	value: PropTypes.array,
	onChange: PropTypes.func,
	credentials: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
};

FeaturedProductsWrapper.defaultProps = {
	selectButtonLabel: undefined,
	value: [],
	onChange: () => {},
};

export default FeaturedProductsWrapper;
