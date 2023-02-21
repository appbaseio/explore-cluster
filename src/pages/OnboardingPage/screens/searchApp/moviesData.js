import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import {
	SearchBox,
	DynamicRangeSlider,
	MultiList,
	ReactiveBase,
	ReactiveList,
	ResultList,
	SelectedFilters,
	RangeInput,
} from '@appbaseio/reactivesearch';
import { StarTwoTone } from '@ant-design/icons';
import { Tag, notification } from 'antd';
import appbaseHelpers from '../../utils/appbaseHelpers';
import { putSettings, getSettings } from '../../../../batteries/modules/actions';
import { getURL } from '../../../../constants/config';

const { ResultListWrapper } = ReactiveList;

const renderFilters = (fields) => {
	if (fields && fields.length) {
		return fields.map((field) => {
			switch (field) {
				case 'genres': {
					return (
						<MultiList
							key={field}
							componentId={field}
							dataField="genres.keyword"
							title="Genres"
							filterLabel="Genres"
							size={15}
							sortBy="count"
							react={{
								and: ['search', 'vote_average', 'release_year'],
							}}
							showSearch={false}
						/>
					);
				}
				case 'vote_average': {
					return (
						<DynamicRangeSlider
							key={field}
							componentId={field}
							dataField={field}
							title="Vote Average"
							filterLabel="Vote Average"
							showHistogram
							rangeLabels={(min, max) => ({
								start: min,
								end: max,
							})}
						/>
					);
				}
				case 'release_year': {
					return (
						<RangeInput
							componentId={field}
							dataField={field}
							key={field}
							title="Release Year"
							filterLabel="Release Year"
							showHistogram
							range={{
								start: 1950,
								end: 2021,
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
		original_title: 10,
		'original_title.raw': 10,
		'original_title.search': 2,
		overview: 1,
		'overview.raw': 1,
		'overview.search': 1,
	};

	return fields.map((item) => weights[item]);
};

const renderResultList = () => (
	<ReactiveList
		componentId="results"
		dataField="name"
		react={{
			and: ['search', 'genres', 'vote_average', 'release_year'],
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
					<div
						style={{
							display: 'flex',
							padding: 10,
							borderBottom: '1px solid rgb(239, 239, 239)',
						}}
					>
						<img
							style={{
								height: 160,
								width: 160,
								objectFit: 'contain',
							}}
							src={item.poster_path}
							alt={item.poster_path}
							onError={(event) => {
								// eslint-disable-next-line no-param-reassign
								event.target.src =
									'https://banksiafdn.com/wp-content/uploads/2019/10/placeholde-image.jpg'; // eslint-disable-line no-param-reassign
							}}
						/>
						<ResultList key={item._id} id={item._id}>
							<ResultList.Content>
								<ResultList.Title
									dangerouslySetInnerHTML={{
										__html: item.original_title,
									}}
								/>
								<ResultList.Description>
									<div>
										<div style={{ display: 'flex', color: '#424242' }}>
											<p style={{ fontWeight: '600', marginRight: 5 }}>
												Release Year{' '}
											</p>
											<p> {item.release_year}</p>
											<p>
												<StarTwoTone
													style={{ marginLeft: 40, marginRight: 3 }}
												/>{' '}
												{item.vote_average}/10
											</p>
										</div>
										<p
											style={{
												color: '#888',
												margin: '8px 0',
												fontSize: '13px',
												lineHeight: '18px',
											}}
											dangerouslySetInnerHTML={{ __html: item.overview }}
										/>
										<div>
											{item.genres.map((genre) => (
												<Tag>{genre}</Tag>
											))}
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
			and: ['search', 'genres', 'vote_average', 'release_year'],
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

class MoviesSearchApp extends Component {
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
					'genres.keyword': 'term',
					vote_average: 'range',
					release_year: 'range',
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
						The Movies Store{' '}
						<span role="img" aria-label="books">
							🎥
						</span>
					</h2>

					<SearchBox
						componentId="search"
						dataField={fields}
						showIcon={false}
						placeholder="Search movies..."
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

MoviesSearchApp.propTypes = {
	facets: PropTypes.array,
	fields: PropTypes.array,
	ui: PropTypes.string,
	fetchSearchSettings: PropTypes.func.isRequired,
	settings: PropTypes.object,
	credentials: PropTypes.string.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	app: PropTypes.string.isRequired,
};

MoviesSearchApp.defaultProps = {
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

export default connect(mapStateToProps, mapDispatchToProps)(MoviesSearchApp);
