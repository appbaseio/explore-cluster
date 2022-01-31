import React from 'react';
import { Prompt } from 'react-router-dom';
import { arrayOf, bool, func, object, string } from 'prop-types';
import { Button } from 'antd';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';
import { diff } from 'jsondiffpatch';
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
} from './utils';
import ReviewAndSave from './ReviewAndSave';

class SavePreferencesN extends React.Component {
	constructor(props) {
		super(props);
		this.hasEdited = false;
		this.state = {
			hasChanged: this.compareChange,
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
			searchPreferences !== prevProps.searchPreferences ||
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
			hasChanged: isChanged,
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
		const {
			isRecommendation,
			recommendationsPreferences,
			searchPreferences,
			getPreferencesPayload,
		} = this.props;

		let newPreferences = {};
		if (isRecommendation) {
			newPreferences = recommendationsPreferences;
			delete newPreferences.resultSettings.layout;
			delete newPreferences.resultSettings.viewSwitcher;
		} else {
			newPreferences = searchPreferences;
			if (newPreferences.resultSettings && !newPreferences.resultSettings.resultHighlight) {
				newPreferences.resultSettings.resultHighlight = false;
			}

			const diffData = diff(newPreferences, getPreferencesPayload());

			if (get(diffData, 'searchSettings.redirectUrlText', '')) {
				newPreferences.searchSettings.redirectUrlText = 'View Product';
			}
			if (get(diffData, 'searchSettings.redirectUrlIcon', '')) {
				newPreferences.searchSettings.redirectUrlIcon = '';
			}
			if (get(diffData, 'resultSettings.mapsAPIkey', '')) {
				newPreferences.resultSettings.mapsAPIkey = '';
			}
			if (get(diffData, 'resultSettings.locationDataField', '')) {
				newPreferences.resultSettings.locationDataField = '';
			}
		}
		delete newPreferences.type;
		delete newPreferences.deploySettings;
		delete newPreferences.created_at;
		delete newPreferences.updated_at;

		return !isEqual(newPreferences, getPreferencesPayload());
	}

	handleSave = () => {
		const {
			isRecommendation,
			updateSearchPreferences,
			updateRecommendationsPreferences,
			getRecommendationsPreferences,
			getPreferencesPayload,
			closeForm,
		} = this.props;

		if (isRecommendation) {
			updateRecommendationsPreferences(getPreferencesPayload()).then((action) => {
				if (!(action && action.error)) {
					this.setState({
						hasChanged: false,
					});
					getRecommendationsPreferences();
					// closeForm();
				}
			});
		} else {
			updateSearchPreferences(getPreferencesPayload()).then((action) => {
				if (!(action && action.error)) {
					this.setState({
						hasChanged: false,
					});
					closeForm();
				}
			});
		}
	};

	render() {
		const {
			label,
			form,
			buttonProps,
			isLoading,
			preferenceId,
			isRecommendation,
			getSearchPreferences,
			getPreferencesPayload,
			closeForm,
		} = this.props;
		const { hasChanged, preferences } = this.state;
		return (
			<>
				<Prompt
					when={hasChanged}
					message="You have unsaved changes, are you sure you want to leave?"
				/>
				{isRecommendation ? (
					<Button
						onClick={this.handleSave}
						loading={isLoading}
						type="primary"
						size="large"
						style={{
							marginLeft: 10,
						}}
						disabled={!hasChanged}
						{...buttonProps}
					>
						{label}
					</Button>
				) : (
					<ReviewAndSave
						preferenceId={preferenceId}
						closeForm={closeForm}
						buttonProps={buttonProps}
						oldData={preferences}
						newData={getPreferencesPayload()}
						setHasChanged={() => {
							this.setState(
								{
									hasChanged: false,
								},
								() => getSearchPreferences(),
							);
						}}
						getPreferencesPayload={getPreferencesPayload}
						hasEdited={this.hasEdited}
						form={form}
					/>
				)}
			</>
		);
	}
}

SavePreferencesN.defaultProps = {
	label: 'Save',
	preferenceId: null,
	buttonProps: null,
	isRecommendation: false,
	isLoading: false,
	searchPreferences: getSearchPreferencesPayload(defaultSearchPreferences),
	recommendationsPreferences: getRecommendationPreferencesPayload(
		defaultRecommendationsPreferences,
	),
	errors: null,
};

SavePreferencesN.propTypes = {
	label: string,
	preferenceId: string,
	isLoading: bool,
	buttonProps: object,
	isRecommendation: bool,
	updateSearchPreferences: func.isRequired,
	updateRecommendationsPreferences: func.isRequired,
	getPreferencesPayload: func.isRequired,
	getSearchPreferences: func.isRequired,
	getRecommendationsPreferences: func.isRequired,
	searchPreferences: object,
	recommendationsPreferences: object,
	form: object.isRequired,
	errors: arrayOf(object),
	closeForm: func.isRequired,
};

const mapStateToProps = (state, props) => ({
	searchPreferences: getSearchPreferenceById(state, props.preferenceId),
	recommendationsPreferences: getRecommendationPreferenceById(state, props.preferenceId),
	isLoading: props.isRecommendation
		? get(state, '$saveRecommendationPreferenceN.isFetching')
		: get(state, '$saveSearchPreferenceN.isFetching'),
	errors: props.isRecommendation
		? [get(state, '$saveRecommendationPreferenceN.error')]
		: [get(state, '$saveSearchPreferenceN.error')],
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
