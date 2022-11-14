import React from 'react';
import { Prompt } from 'react-router-dom';
import { arrayOf, bool, func, object, string } from 'prop-types';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';
import {
	saveSearchPreferenceN,
	saveRecommendationPreferenceN,
	getSearchPreferencesN,
	getRecommendationsPreferencesN,
} from '../../batteries/modules/actions';
import {
	getSearchPreferenceById,
	getRecommendationPreferenceById,
} from '../../batteries/modules/selectors';
import { displayErrors } from '../../batteries/utils/helpers';
import {
	FormContext,
	getRecommendationPreferencesPayload,
	getSearchPreferencesPayload,
	defaultSearchPreferences,
	defaultRecommendationsPreferences,
	getDiffDataAndCount,
} from './utils';
import { removeEmpty, reOrderPreferences, transformPreferences } from './utils/index';
import ReviewAndSave from './ReviewAndSave';

class SavePreferencesN extends React.Component {
	constructor(props) {
		super(props);
		this.hasEdited = false;
		this.state = {
			// eslint-disable-next-line react/no-unused-state
			preferences: props.searchPreferences,
		};
	}

	// eslint-disable-next-line
	static contextType = FormContext;

	componentDidMount() {
		// eslint-disable-next-line
		this.context.valueChanges.subscribe(this.handleChange);
	}

	componentDidUpdate(prevProps) {
		const { searchPreferences, recommendationsPreferences, errors } = this.props;
		displayErrors(errors, prevProps.errors);

		if (
			!isEqual(searchPreferences, prevProps.searchPreferences) ||
			recommendationsPreferences !== prevProps.recommendationsPreferences
		) {
			this.handleChange();
		}
	}

	componentWillUnmount() {
		// eslint-disable-next-line
		this.context.valueChanges.unsubscribe(this.handleChange);
	}

	handleChange = () => {
		const isChanged = this.compareChange;
		const { searchPreferences, recommendationsPreferences, isRecommendation } = this.props;

		this.setState({
			// eslint-disable-next-line react/no-unused-state
			preferences: isRecommendation ? recommendationsPreferences : searchPreferences,
		});
		if (isChanged) {
			window.onbeforeunload = () => {
				return 'You have unsaved changes, are you sure you want to leave?';
			};
		} else {
			window.onbeforeunload = () => {};
		}
	};

	get compareChange() {
		const { isRecommendation } = this.props;
		const { oldData, newData } = this.getOldDataNewData();
		return !!getDiffDataAndCount(removeEmpty(oldData), removeEmpty(newData), isRecommendation)
			.diffCount;
	}

	handleSave = () => {
		const {
			isRecommendation,
			updateSearchPreferences,
			updateRecommendationsPreferences,
			getRecommendationsPreferences,
			getPreferencesPayload,
			closeForm,
			clientId,
		} = this.props;

		if (isRecommendation) {
			updateRecommendationsPreferences(getPreferencesPayload()).then((action) => {
				if (!(action && action.error)) {
					getRecommendationsPreferences();
				}
			});
		} else {
			const preferencesPayload = getPreferencesPayload();

			// inject auth0 clientId in authentication settings
			if (preferencesPayload.authenticationSettings && clientId) {
				preferencesPayload.authenticationSettings.clientId = clientId;
			}

			updateSearchPreferences(preferencesPayload).then((action) => {
				if (!(action && action.error)) {
					closeForm();
				}
			});
		}
	};

	getOldDataNewData = () => {
		const { form, getPreferencesPayload } = this.props;
		const { preferences } = this.state || {};
		const formStatePrefs = { ...getPreferencesPayload() };
		const oldData = {
			general: reOrderPreferences(
				preferences,
				get(form.value, 'pageSettings.currentPage', ''),
			),
		};
		const newData = {
			general: formStatePrefs,
		};
		Object.keys(get(form.value, 'pageSettings.pages', '')).forEach((pageKey) => {
			oldData[pageKey] = reOrderPreferences(preferences, pageKey);
			newData[pageKey] = reOrderPreferences(transformPreferences(formStatePrefs), pageKey);
		});
		return { oldData, newData };
	};

	render() {
		const {
			form,
			label,
			buttonProps,
			preferenceId,
			isRecommendation,
			getSearchPreferences,
			getRecommendationsPreferences,
			getPreferencesPayload,
			getPreferences,
			closeForm,
			remountComponent,
		} = this.props;
		const { oldData, newData } = this.getOldDataNewData();

		return (
			<>
				<Prompt
					when={this.compareChange}
					message="You have unsaved changes, are you sure you want to leave?"
				/>
				<ReviewAndSave
					label={label}
					isRecommendation={isRecommendation}
					preferenceId={preferenceId}
					closeForm={closeForm}
					buttonProps={buttonProps}
					oldData={oldData}
					newData={newData}
					setHasChanged={() => {
						// eslint-disable-next-line
						isRecommendation ? getRecommendationsPreferences() : getSearchPreferences();
					}}
					getPreferencesPayload={getPreferencesPayload}
					getPreferences={getPreferences}
					form={form}
					remountComponent={remountComponent}
				/>
			</>
		);
	}
}

SavePreferencesN.defaultProps = {
	label: 'Save',
	preferenceId: null,
	buttonProps: null,
	isRecommendation: false,
	searchPreferences: getSearchPreferencesPayload(defaultSearchPreferences),
	recommendationsPreferences: getRecommendationPreferencesPayload(
		defaultRecommendationsPreferences,
	),
	errors: null,
	clientId: '',
};

SavePreferencesN.propTypes = {
	label: string,
	preferenceId: string,
	buttonProps: object,
	isRecommendation: bool,
	updateSearchPreferences: func.isRequired,
	updateRecommendationsPreferences: func.isRequired,
	getPreferencesPayload: func.isRequired,
	getPreferences: func.isRequired,
	getSearchPreferences: func.isRequired,
	getRecommendationsPreferences: func.isRequired,
	searchPreferences: object,
	recommendationsPreferences: object,
	form: object.isRequired,
	errors: arrayOf(object),
	closeForm: func.isRequired,
	clientId: string,
	remountComponent: func.isRequired,
};

const mapStateToProps = (state, props) => ({
	searchPreferences: getSearchPreferenceById(state, props.preferenceId),
	recommendationsPreferences: getRecommendationPreferenceById(state, props.preferenceId),
	errors: props.isRecommendation
		? [get(state, '$saveRecommendationPreferenceN.error')]
		: [get(state, '$saveSearchPreferenceN.error')],
	clientId: get(state, '$getAuth0Preferences.results')?.['_client_id'],
});

const mapDispatchToProps = (dispatch, props) => ({
	getSearchPreferences: () => dispatch(getSearchPreferencesN()),
	getRecommendationsPreferences: () => dispatch(getRecommendationsPreferencesN()),
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreferenceN(props.preferenceId, payload)),
	updateRecommendationsPreferences: (payload) =>
		dispatch(saveRecommendationPreferenceN(props.preferenceId, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SavePreferencesN);
