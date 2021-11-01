import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import {
	DataSearch,
	MultiList,
	ReactiveBase,
	ReactiveList,
	ResultList,
	SelectedFilters,
	RangeInput,
} from '@appbaseio/reactivesearch';
import { Tag, notification } from 'antd';
import appbaseHelpers from '../../utils/appbaseHelpers';
import { putSettings, getSettings } from '../../../../batteries/modules/actions';
import { getURL } from '../../../../constants/config';
import { seachAppStyles } from './styles';

const { ResultListWrapper } = ReactiveList;

const renderFilters = (fields) => {
	if (fields && fields.length) {
		return fields.map((field) => {
			switch (field) {
				case 'categories': {
					return (
						<MultiList
							key={field}
							componentId={field}
							dataField="categories.keyword"
							title="Categories"
							filterLabel="Categories"
							size={15}
							sortBy="count"
							react={{
								and: ['search', 'brand', 'retail_price'],
							}}
							showSearch={false}
						/>
					);
				}
				case 'brand': {
					return (
						<MultiList
							key={field}
							componentId={field}
							dataField="brand.keyword"
							title="Brand"
							filterLabel="Brand"
							size={15}
							sortBy="count"
							react={{
								and: ['search', 'categories', 'retail_price'],
							}}
							showSearch={false}
						/>
					);
				}
				case 'retail_price': {
					return (
						<RangeInput
							componentId={field}
							dataField={field}
							key={field}
							title="Retail Price (Rupees)"
							filterLabel="Retail Price"
							showHistogram
							range={{
								start: 45,
								end: 20000,
							}}
						/>
					);
				}
				default:
					return null;
			}
		});
	}
	return null;
};

const getFields = (fields, suffix) => {
	let newFields = [];
	fields.forEach((item) => {
		suffix.forEach((str) => {
			newFields = [...newFields, `${item}${str}`];
		});
	});
	return newFields;
};

const getWeights = (fields) => {
	const weights = {
		product_name: 10,
		'product_name.raw': 10,
		'product_name.search': 2,
		categories: 3,
		'categories.raw': 3,
		'categories.search': 1,
		description: 1,
		'description.raw': 1,
		'description.search': 1,
	};

	return fields.map((item) => weights[item]);
};

const renderResultList = () => (
	<ReactiveList
		componentId="results"
		dataField="name"
		react={{
			and: ['search', 'categories', 'brand', 'retail_price'],
		}}
		size={4}
		className="right-col"
		innerClass={{
			listItem: 'list-item',
			resultStats: 'result-stats',
		}}
		pagination
		stream
	>
		{({ data }) => (
			<ResultListWrapper>
				{data.map((item) => (
					<div className={seachAppStyles}>
						<div>
							<img
								className="img-container"
								src={item.image[0]}
								alt={item.image[0]}
								onError={(event) => {
									event.target.src =
										'https://www.houseoftara.com/shop/wp-content/uploads/2019/05/placeholder.jpg'; // eslint-disable-line no-param-reassign
								}}
							/>
						</div>
						<ResultList key={item._id} id={item._id}>
							<ResultList.Content>
								<ResultList.Title
									dangerouslySetInnerHTML={{
										__html: item.product_name, //eslint-disable-line
									}}
								/>
								<ResultList.Description>
									<div>
										<div style={{ display: 'flex', color: '#424242' }}>
											<p style={{ fontWeight: '600', marginRight: 5 }}>
												Retail Price:{' '}
											</p>
											<p>Rs.{item.retail_price}</p>
											{item.brand && (
												<>
													<p
														style={{
															marginLeft: 40,
															fontWeight: '600',
															marginRight: 5,
														}}
													>
														Brand:{' '}
													</p>
													<p>{item.brand}</p>
												</>
											)}
										</div>
										<p
											className="description-container"
											dangerouslySetInnerHTML={{ __html: item.description }}
										/>
										<div>
											{Array.isArray(item?.categories) ? (
												item.categories.map((category) => (
													<Tag>{category}</Tag>
												))
											) : (
												<Tag>
													<p
														dangerouslySetInnerHTML={{
															__html: item.categories,
														}}
													/>
												</Tag>
											)}
										</div>
									</div>
								</ResultList.Description>
							</ResultList.Content>
						</ResultList>
					</div>
				))}
			</ResultListWrapper>
		)}
	</ReactiveList>
);

const renderJSONList = () => (
	<ReactiveList
		componentId="results"
		dataField="name"
		react={{
			and: ['search', 'categories', 'brand', 'retail_price'],
		}}
		size={4}
		renderItem={(res) => (
			<pre
				key={res._id}
				style={{
					background: 'rgba(239,239,239,.4)',
					padding: '15px 20px',
					color: '#424242',
					borderRadius: '5px',
				}}
			>
				{JSON.stringify(res, null, 2)}
			</pre>
		)}
		className="right-col"
		innerClass={{
			listItem: 'list-item',
			resultStats: 'result-stats',
		}}
		pagination
		stream
	/>
);

const renderCode = (lib) => {
	switch (lib) {
		case 'react':
			return renderResultList();
		case 'raw_json':
			return renderJSONList();
		default:
			return renderResultList();
	}
};

class EcommSearchApp extends Component {
	constructor(props) {
		super(props);
		this.appConfig = appbaseHelpers.appConfig();
	}

	componentDidMount() {
		const { settings, fetchSearchSettings, app, fields: fieldsProp } = this.props;
		if (!settings) {
			fetchSearchSettings(app);
		} else {
			const fields = getFields(fieldsProp, ['', '.search']);
			this.updateAppSettings(fields);
		}
	}

	updateAppSettings = async (fields) => {
		const { settings, app, updateSettingsAction } = this.props;
		const dataField = [...fields];
		const fieldWeights = getWeights(fields);
		const newSettings = { ...settings };

		const settingsData = {
			...newSettings,
			search: {
				...newSettings?.search,
				fieldWeights,
				dataField,
			},
			aggregations: {
				...newSettings?.aggregations,
				dataField: {
					'brand.keyword': 'term',
					'categories.keyword': 'term',
					retail_price: 'range',
				},
			},
		};
		try {
			const savedSettings = await updateSettingsAction(app, settingsData);
			if (savedSettings && savedSettings.error) {
				notification.error({
					message: 'Failed to save Search Settings',
					description: get(savedSettings, 'error.message'),
				});
			}
		} catch (err) {
			notification.error({
				message: 'Failed to save Search Settings',
				description: err.message,
			});
		}
	};

	render() {
		const { facets, fields: fieldsProp, ui } = this.props;
		const fields = getFields(fieldsProp, ['', '.search']);
		const SCALR_API = getURL();

		return (
			<ReactiveBase
				{...this.appConfig}
				url={SCALR_API}
				enableAppbase
				className="search-app"
				theme={{
					colors: {
						primaryColor: '#FF307A',
					},
				}}
				style={{
					backgroundColor: '#fff',
					padding: '40px',
					borderRadius: '2px',
					textAlign: 'left',
				}}
			>
				<header>
					<h2>
						The Products Store{' '}
						<span role="img" aria-label="books">
							💻
						</span>
					</h2>

					<DataSearch
						componentId="search"
						dataField={fields}
						showIcon={false}
						placeholder="Search products..."
						autosuggest={false}
						filterLabel="Search"
						fieldWeights={getWeights(fields)}
						highlight
						style={{
							maxWidth: '400px',
							margin: '0 auto',
						}}
					/>
				</header>

				<SelectedFilters style={{ marginTop: 20 }} showClearAll={false} />

				<div className={facets && facets.length ? 'multi-col' : ''}>
					<div className="left-col">{renderFilters(facets)}</div>
					{renderCode(ui)}
				</div>
			</ReactiveBase>
		);
	}
}

EcommSearchApp.propTypes = {
	facets: PropTypes.array,
	fields: PropTypes.array,
	ui: PropTypes.string,
	fetchSearchSettings: PropTypes.func.isRequired,
	settings: PropTypes.object,
	credentials: PropTypes.string.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	app: PropTypes.string.isRequired,
};

EcommSearchApp.defaultProps = {
	facets: [],
	fields: [],
	ui: undefined,
	settings: null,
};

const mapStateToProps = (state, props) => {
	const { username, password } = get(state, 'user.data', {});
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const settings = get(state, ['$getAppSettings', 'settings', props.app], defaultSettings);
	return {
		settings,
		fetchingDefaultSettings: get(state.$getAppSettings, `default.loading`),
		credentials: username ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchSearchSettings: (appName) => dispatch(getSettings(appName)),
	updateSettingsAction: (appName, payload) => dispatch(putSettings(appName, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EcommSearchApp);
// export default EcommSearchApp;
