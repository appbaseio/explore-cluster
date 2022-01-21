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

class SavePreferencesN extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasChanged: this.compareChange,
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

		this.setState({
			hasChanged: isChanged,
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
			form,
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
			if (
				form.get('csbID').value &&
				(diffData?.facetSettings ||
					diffData?.globalSettings ||
					diffData?.themeSettings ||
					diffData?.resultSettings ||
					diffData?.searchSettings ||
					diffData?.pipeline)
			) {
				form.get('csbID').setValue('');
				form.get('hasEdited').setValue(false);
			}
			if (get(diffData, 'searchSettings.redirectUrlText', '')) {
				newPreferences.searchSettings.redirectUrlText = 'View Product';
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
			getPreferencesPayload,
			closeForm,
		} = this.props;

		if (isRecommendation) {
			updateRecommendationsPreferences(getPreferencesPayload()).then((action) => {
				if (!(action && action.error)) {
					this.setState({
						hasChanged: false,
					});
					closeForm();
				}
			});
		} else {
			updateSearchPreferences(getPreferencesPayload(getPreferencesPayload())).then(
				(action) => {
					if (!(action && action.error)) {
						this.setState({
							hasChanged: false,
						});
						closeForm();
					}
				},
			);
		}
	};

	render() {
		const { label, buttonProps, isLoading } = this.props;
		const { hasChanged } = this.state;

		return (
			<>
				<Prompt
					when={hasChanged}
					message="You have unsaved changes, are you sure you want to leave?"
				/>
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
