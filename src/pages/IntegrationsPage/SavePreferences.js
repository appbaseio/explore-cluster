import React from 'react';
import { Prompt } from 'react-router-dom';
import { bool, func, object, string } from 'prop-types';
import { Button } from 'antd';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';
import {
	saveSearchPreferences,
	saveRecommendationsPreferences,
} from '../../batteries/modules/actions';
import {
	getSearchPreferencesByName,
	getRecommendationsPreferencesByName,
} from '../../batteries/modules/selectors';
import { FormContext } from './utils';

class SavePreferences extends React.Component {
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
		this.context.valueChanges.subscribe((VALUE) => {
			console.log('VALUE GOT CHANGED', VALUE);
			this.handleChange();
		});
	}

	componentDidUpdate(prevProps) {
		const { searchPreferences, recommendationsPreferences } = this.props;
		if (
			searchPreferences !== prevProps.searchPreferences ||
			recommendationsPreferences !== prevProps.recommendationsPreferences
		) {
			this.handleChange();
		}
	}

	handleChange = () => {
		const { compareChange } = this;
		const { hasChanged } = this.state;
		if (compareChange !== hasChanged) {
			this.setState({
				hasChanged: this.compareChange,
			});
			if (compareChange) {
				window.onbeforeunload = () => {
					return 'You have unsaved changes, are you sure you want to leave?';
				};
			} else {
				window.onbeforeunload = () => {};
			}
		}
	};

	get compareChange() {
		const {
			isRecommendation,
			recommendationsPreferences,
			searchPreferences,
			getPreferencesPayload,
		} = this.props;
		return !isEqual(
			isRecommendation ? recommendationsPreferences : searchPreferences,
			getPreferencesPayload(),
		);
	}

	render() {
		const {
			label,
			buttonProps,
			isRecommendation,
			updateSearchPreferences,
			updateRecommendationsPreferences,
			getPreferencesPayload,
			isLoading,
		} = this.props;
		const { hasChanged } = this.state;

		return (
			<>
				<Prompt
					when={hasChanged}
					message="You have unsaved changes, are you sure you want to leave?"
				/>
				<Button
					onClick={() =>
						isRecommendation
							? updateRecommendationsPreferences(getPreferencesPayload())
							: updateSearchPreferences(getPreferencesPayload())
					}
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

SavePreferences.defaultProps = {
	label: 'Save',
	buttonProps: null,
	isRecommendation: false,
	isLoading: false,
	searchPreferences: null,
	recommendationsPreferences: null,
};

SavePreferences.propTypes = {
	label: string,
	isLoading: bool,
	buttonProps: object,
	isRecommendation: bool,
	updateSearchPreferences: func.isRequired,
	updateRecommendationsPreferences: func.isRequired,
	getPreferencesPayload: func.isRequired,
	searchPreferences: object,
	recommendationsPreferences: object,
};

const mapStateToProps = (state) => ({
	searchPreferences: getSearchPreferencesByName(state),
	recommendationsPreferences: getRecommendationsPreferencesByName(state),
	isLoading:
		get(state, '$saveSearchPreferences.isFetching') ||
		get(state, 'saveRecommendationsPreferences.isFetching'),
});

const mapDispatchToProps = (dispatch) => ({
	updateSearchPreferences: (payload) => dispatch(saveSearchPreferences(payload)),
	updateRecommendationsPreferences: (payload) =>
		dispatch(saveRecommendationsPreferences(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SavePreferences);
