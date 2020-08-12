import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import {
	getDefaultSettings,
	putSettings,
	deleteSettings,
	getSettings as getSearchRelevancy,
} from '../../batteries/modules/actions';
import { getFieldWeight } from '../../utils';
import FieldsWeight from './components/FieldsWeight';

class SearchSettings extends React.Component {
	state = {
		fieldWeights: {},
		fuzziness: 0,
		queryFormat: 'or',
		queryString: false,
		searchOperators: false,
		enableNGram: true,
		hasLanguage: true,
		enableSynonyms: true,
	};

	mappingsRef = React.createRef();

	componentDidMount() {
		const {
			appName,
			getSettingsAction,
			settings,
			getDefaultSettingsAction,
			defaultSettings,
		} = this.props;

		if (settings) {
			this.init(settings);
		} else {
			getSettingsAction(appName);
		}

		if (!defaultSettings) {
			getDefaultSettingsAction();
		}
	}

	componentDidUpdate(prevProps) {
		const { settings, isLoading } = this.props;

		if (!isLoading && JSON.stringify(settings) !== JSON.stringify(prevProps.settings)) {
			this.init(settings);
		}
	}

	init = (settings) => {
		const searchSettings = get(settings, 'search', {});

		const fields = get(searchSettings, 'dataField', []);
		const weights = get(searchSettings, 'fieldWeights', []);

		const fieldWeights = fields.reduce((agg, item, index) => {
			return {
				...agg,
				[item]: get(weights, index, getFieldWeight(item.split('.').pop(), 1)),
			};
		}, {});

		this.setState({
			fuzziness: get(searchSettings, 'fuzziness'),
			queryFormat: get(searchSettings, 'queryFormat'),
			queryString: get(searchSettings, 'queryString'),
			searchOperators: get(searchSettings, 'searchOperators'),
			fieldWeights,
			enableNGram: get(settings, 'indexSettings.enableNGram', true),
			hasLanguage: !!get(settings, 'language.language'),
			enableSynonyms: get(settings, 'synonyms.enabled', true),
		});
	};

	handleFieldsUpdate = (fieldWeights) => {
		this.setState({
			fieldWeights,
		});
	};

	render() {
		const { isLoading } = this.props;
		const { fieldWeights, enableNGram, enableSynonyms, hasLanguage } = this.state;
		if (isLoading) return 'Loading Search Settings...';
		return (
			<div>
				<FieldsWeight
					onFieldsUpdate={this.handleFieldsUpdate}
					enableNGram={enableNGram}
					enableSynonyms={enableSynonyms}
					hasLanguage={hasLanguage}
					fieldWeights={fieldWeights}
				/>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;
	const appName = get(state, '$getCurrentApp.name');
	return {
		isLoading: get(state, '$getAppSettings.isFetching'),
		settings: get(state, ['$getAppSettings', 'settings', appName], defaultSearchSettings),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		appName,
		tier: get(state, '$getAppPlan.results.tier'),
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
	};
};

const mapDispatchToProps = (dispatch) => ({
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSearchRelevancy(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	deleteSettingsAction: (name) => dispatch(deleteSettings(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchSettings);
