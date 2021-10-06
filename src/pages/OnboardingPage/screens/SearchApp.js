import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	DataSearch,
	DynamicRangeSlider,
	MultiList,
	ReactiveBase,
	ReactiveList,
	ResultList,
	SelectedFilters,
	DateRange,
} from '@appbaseio/reactivesearch';

import appbaseHelpers from '../utils/appbaseHelpers';
import { getURL } from '../../../constants/config';

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
							size={15}
							sortBy="count"
							react={{
								and: ['search', 'vote_average', 'release_date'],
							}}
							showSearch={false}
							filterLabel="Genres"
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
							rangeLabels={(min, max) => ({
								start: min,
								end: max,
							})}
							react={{
								and: ['search', 'genres', 'release_date'],
							}}
						/>
					);
				}
				case 'release_date': {
					return (
						<DateRange
							key={field}
							componentId={field}
							dataField={field}
							title="Release Date"
							placeholder={{
								start: 'Start Date',
								end: 'End Date',
							}}
							react={{
								and: ['search', 'genres', 'vote_average'],
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
		title: 10,
		'title.raw': 10,
		'title.search': 2,
		tagline: 5,
		'tagline.raw': 5,
		'tagline.search': 1,
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
			and: ['search', 'genres', 'original_language', 'release_year'],
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
					<ResultList key={item._id} id={item._id}>
						<ResultList.Image
							src={item.poster_path}
							onError={(event) => {
								event.target.src = 'https://www.houseoftara.com/shop/wp-content/uploads/2019/05/placeholder.jpg'; // eslint-disable-line
							}}
						/>
						<ResultList.Content>
							<ResultList.Title
								dangerouslySetInnerHTML={{
									__html: item.original_title,
								}}
							/>
							<ResultList.Description>
								<div>
									<p
										style={{ fontSize: '16px', lineHeight: '24px' }}
										dangerouslySetInnerHTML={{ __html: item.tagline }}
									/>
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
										{item.genres ? (
											<span className="tag">{item.genres}</span>
										) : null}
									</div>
								</div>
							</ResultList.Description>
						</ResultList.Content>
					</ResultList>
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
			and: ['search', 'genres', 'original_language', 'release_year'],
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

export default class SearchApp extends Component {
	constructor(props) {
		super(props);

		this.appConfig = appbaseHelpers.appConfig();
	}

	render() {
		const { facets, fields: fieldsProp, ui } = this.props;
		const fields = getFields(fieldsProp, ['', '.search']);
		const SCALR_API = getURL();
		return (
			<ReactiveBase
				{...this.appConfig}
				url={SCALR_API}
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

					<DataSearch
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

				<SelectedFilters style={{ marginTop: 20 }} />

				<div className={facets && facets.length ? 'multi-col' : ''}>
					<div className="left-col">{renderFilters(facets)}</div>
					{renderCode(ui)}
				</div>
			</ReactiveBase>
		);
	}
}

SearchApp.propTypes = {
	facets: PropTypes.array,
	fields: PropTypes.array,
	ui: PropTypes.string,
};

SearchApp.defaultProps = {
	facets: [],
	fields: [],
	ui: undefined,
};
