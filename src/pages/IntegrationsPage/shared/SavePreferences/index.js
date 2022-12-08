import React from 'react';
import { Prompt } from 'react-router-dom';
import { arrayOf, bool, func, object, string } from 'prop-types';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';
import {
	getSearchPreferences as getSearchPreferencesAction,
	getRecommendationsPreferences as getRecommendationsPreferencesAction,
} from '../../../../batteries/modules/actions';
import {
	getSearchPreferenceById,
	getRecommendationPreferenceById,
} from '../../../../batteries/modules/selectors';
import { displayErrors } from '../../../../batteries/utils/helpers';
import {
	FormContext,
	getRecommendationPreferencesPayload,
	getSearchPreferencesPayload,
	defaultSearchPreferences,
	defaultRecommendationsPreferences,
	getDiffDataAndCount,
} from '../../utils/utils';
import { removeEmpty, reOrderPreferences, transformPreferences } from '../../utils/index';
import ReviewAndSave from './ReviewAndSave';

class SavePreferences extends React.Component {
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

SavePreferences.defaultProps = {
	label: 'Save',
	preferenceId: null,
	buttonProps: null,
	isRecommendation: false,
	searchPreferences: getSearchPreferencesPayload(defaultSearchPreferences),
	recommendationsPreferences: getRecommendationPreferencesPayload(
		defaultRecommendationsPreferences,
	),
	errors: null,
};

SavePreferences.propTypes = {
	label: string,
	preferenceId: string,
	buttonProps: object,
	isRecommendation: bool,
	getPreferencesPayload: func.isRequired,
	getPreferences: func.isRequired,
	getSearchPreferences: func.isRequired,
	getRecommendationsPreferences: func.isRequired,
	searchPreferences: object,
	recommendationsPreferences: object,
	form: object.isRequired,
	errors: arrayOf(object),
	closeForm: func.isRequired,

	remountComponent: func.isRequired,
};

const mapStateToProps = (state, props) => ({
	searchPreferences: getSearchPreferenceById(state, props.preferenceId),
	recommendationsPreferences: getRecommendationPreferenceById(state, props.preferenceId),
	errors: props.isRecommendation
		? [get(state, '$saveRecommendationPreference.error')]
		: [get(state, '$saveSearchPreference.error')],
	clientId: get(state, '$getAuth0Preferences.results')?.['_client_id'],
});

const mapDispatchToProps = (dispatch) => ({
	getSearchPreferences: () => dispatch(getSearchPreferencesAction()),
	getRecommendationsPreferences: () => dispatch(getRecommendationsPreferencesAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SavePreferences);
