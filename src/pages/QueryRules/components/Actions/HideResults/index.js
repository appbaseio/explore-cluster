import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { notification, Tag } from 'antd';
import { getURL } from '../../../../../constants/config';
import GlobalSearch from '../../../../../components/GlobalSearch';
import { getIndexSuggestionsPreferences } from '../../../../../batteries/modules/actions';

let config = {};
class HideResults extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hiddenResults: props.value,
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
			const { hiddenResults: hiddenResultsNew } = this.state;
			onChange(hiddenResultsNew);
		}
	};

	onHide = (...value) => {
		if (!value[2]) return;
		const { hiddenResults } = this.state;
		const currentId = value[2]._id;
		if (!currentId) return;
		if (hiddenResults.includes(currentId)) {
			notification.info({
				message: 'Hide Result',
				description: `${currentId} is already hidden.`,
			});
			this.clearSearch();
			return;
		}
		this.setState({ hiddenResults: [...hiddenResults, currentId] }, this.updateResults);
		this.clearSearch();
	};

	onClose = (e, id) => {
		e.preventDefault();
		const { hiddenResults } = this.state;
		const index = hiddenResults.indexOf(id);
		if (index !== -1) {
			hiddenResults.splice(index, 1);
			this.setState({ hiddenResults }, this.updateResults);
		}
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
			// eslint-disable-next-line
			this.globalSearchRef.current?.handleSearchValueChange('');
		}
	}

	render() {
		const { indexes, dataFields } = this.props;
		const { hiddenResults } = this.state;
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
						onValueSelected={this.onHide}
						dataFields={(dataFields || []).map((field) =>
							field.replace(/.keyword/g, ''),
						)}
						avoidApi
						app={app}
						ref={this.globalSearchRef}
						// onKeyDown={this.handleAdd}
						subprops={{
							enablePredictiveSuggestions: true,
							...config,
						}}
					/>
				</ReactiveBase>
				<div>
					{hiddenResults.map((id) => (
						<Tag key={id} closable onClose={(e) => this.onClose(e, id)}>
							{id}
						</Tag>
					))}
				</div>
			</div>
		);
	}
}

HideResults.propTypes = {
	indexes: PropTypes.array,
	dataFields: PropTypes.array,
	value: PropTypes.array,
	onChange: PropTypes.func.isRequired,
	getIndexPreferences: PropTypes.func.isRequired,
};

HideResults.defaultProps = {
	indexes: [],
	dataFields: [],
	value: [],
};

const mapDispatchToProps = (dispatch) => ({
	getIndexPreferences: () => dispatch(getIndexSuggestionsPreferences()),
});

export default connect(null, mapDispatchToProps)(HideResults);
