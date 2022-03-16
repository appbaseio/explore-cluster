import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { notification } from 'antd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { getURL } from '../../../../../constants/config';
import GlobalSearch from '../../../../../components/GlobalSearch';
import PromoteDataTable from './PromoteDataTable';
import { getIndexSuggestionsPreferences } from '../../../../../batteries/modules/actions';

let config = {};
class PromoteResults extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dataSource: props.value || [],
		};
		this.globalSearchRef = React.createRef();
	}

	componentDidMount = async () => {
		const indexSuggestionsConfig = await this.fetchIndexPreferences();

		config = {
			enablePopularSuggestions: false,
			enableRecentSuggestions: false,
			maxPredictedWords: 3,
			showDistinctSuggestions: true,
			...Object.fromEntries(
				Object.entries(indexSuggestionsConfig).filter(([_, v]) => v != null), // eslint-disable-line
			),
		};
	};

	updateResults = () => {
		const { onChange } = this.props;
		if (onChange) {
			const { dataSource: dataSourceNew } = this.state;
			onChange(dataSourceNew);
		}
	};

	handleAdd = (...value) => {
		if (!value[2]) return;
		const { dataSource } = this.state;
		// eslint-disable-next-line no-unused-vars
		const [selectedSuggestion, _, suggestionSource] = value;
		if (!selectedSuggestion) return;
		if (dataSource.findIndex((item) => item.doc._id === suggestionSource._id) > -1) {
			notification.info({
				message: 'Promote Result',
				description: `${selectedSuggestion} is already promoted.`,
			});
			this.clearSearch();
			return;
		}
		delete suggestionSource._score;
		const newData = [
			...dataSource,
			{
				position: dataSource.length + 1,
				doc: {
					...suggestionSource,
					_suggestion_display_value: selectedSuggestion,
					_suggestion_url: '',
				},
			},
		];
		this.setState({ dataSource: newData }, this.updateResults);
		this.clearSearch();
	};

	handleItemReOrder = (index) => {
		const sourcePosition = index.source.index + 1;
		const destinationPosition = index.destination.index + 1;
		const { dataSource } = this.state;
		const reshuffledData = dataSource.map((data) => {
			if (data.position >= destinationPosition && data.position < sourcePosition) {
				return { ...data, position: data.position + 1 };
			}
			if (data.position > sourcePosition && data.position <= destinationPosition) {
				return { ...data, position: data.position - 1 };
			}
			if (data.position === sourcePosition) {
				return { ...data, position: destinationPosition };
			}
			return data;
		});
		this.setState({ dataSource: reshuffledData }, this.updateResults);
	};

	handleDelete = (position) => {
		const { dataSource } = this.state;
		const updatedData = [];
		dataSource.forEach((data) => {
			if (data.position > position) {
				updatedData.push({ ...data, position: data.position - 1 });
			}
			if (data.position < position) {
				updatedData.push(data);
			}
		});
		this.setState({ dataSource: updatedData }, this.updateResults);
	};

	// eslint-disable-next-line consistent-return
	fetchIndexPreferences = async () => {
		const { getIndexPreferences } = this.props;
		try {
			const data = await getIndexPreferences();
			if (data.payload) {
				return {
					applyStopwords: data.payload.applyStopwords || true,
					customStopwords: data.payload.customStopwords || [],
					includeFields: data.payload.includeFields || ['*'],
					excludeFields: data.payload.excludeFields || [],
					categoryField: data.payload.categoryField,
					urlField: data.payload.urlField,
					enableSynonyms: data.payload.enableSynonyms || true,
					size: parseInt(data.payload.size, 10) || 3,
				};
			}
			return {
				applyStopwords: true,
				customStopwords: [],
				includeFields: ['*'],
				excludeFields: [],
				categoryField: '',
				urlField: '',
				enableSynonyms: true,
				size: 3,
			};
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
		}
	};

	clearSearch() {
		if (this.globalSearchRef) {
			this.globalSearchRef.current?.handleSearchValueChange(''); // eslint-disable-line
		}
	}

	render() {
		const { indexes, dataFields, rule } = this.props;
		const { dataSource } = this.state;
		const app = indexes.join(',') || '*';
		return (
			<div>
				<ReactiveBase
					app={app}
					url={getURL()}
					credentials={atob(localStorage.getItem('authToken'))}
					style={{ marginBottom: 12 }}
					enableAppbase
					appbaseConfig={{
						recordAnalytics: false,
						enableQueryRules: false,
						useCache: false,
					}}
				>
					<GlobalSearch
						indexes={indexes}
						onValueSelected={this.handleAdd}
						dataFields={(dataFields || []).map((field) =>
							field.replace(/.keyword/g, ''),
						)}
						// avoidApi
						subprops={{
							enablePredictiveSuggestions: true,
							...config,
						}}
						app={app}
						ref={this.globalSearchRef}
					/>
				</ReactiveBase>
				<DragDropContext onDragEnd={this.handleItemReOrder}>
					<Droppable droppableId="droppable">
						{(provided, snapshot) => (
							<div
								ref={provided.innerRef}
								style={{
									backgroundColor: snapshot.isDraggingOver
										? 'transparent'
										: 'transparent',
								}}
								{...provided.droppableProps}
							>
								<PromoteDataTable
									handleDelete={this.handleDelete}
									dataSource={dataSource}
									onChange={(data, position) => {
										const newDataSource = [...dataSource];

										const doc = {
											...newDataSource[position - 1].doc,
											...data,
										};
										newDataSource[position - 1] = {
											...newDataSource[position - 1],
											doc: { ...doc },
										};

										this.setState(
											{ dataSource: newDataSource },
											this.updateResults,
										);
									}}
									rule={rule}
								/>
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>
		);
	}
}

PromoteResults.propTypes = {
	indexes: PropTypes.array,
	dataFields: PropTypes.array,
	value: PropTypes.array,
	onChange: PropTypes.func.isRequired,
	getIndexPreferences: PropTypes.func.isRequired,
	rule: PropTypes.object.isRequired,
};

PromoteResults.defaultProps = {
	indexes: [],
	dataFields: [],
	value: [],
};

const mapDispatchToProps = (dispatch) => ({
	getIndexPreferences: () => dispatch(getIndexSuggestionsPreferences()),
});

export default connect(null, mapDispatchToProps)(PromoteResults);
