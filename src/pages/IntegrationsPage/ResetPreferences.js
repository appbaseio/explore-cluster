import React from 'react';
import { Button, Popconfirm } from 'antd';
import get from 'lodash/get';
import { func, bool } from 'prop-types';
import { connect } from 'react-redux';
import {
	deleteSearchPreferences,
	deleteRecommendationsPreferences,
} from '../../batteries/modules/actions';
import {
	getRecommendationPreferencesPayload,
	getSearchPreferencesPayload,
	defaultSearchPreferences,
	defaultRecommendationsPreferences,
} from './utils';

const ResetPreferences = ({ deletePreferences, isLoading }) => (
	<Popconfirm
		title="Are you sure to reset to default preferences？"
		onConfirm={deletePreferences}
		okText="Yes"
		cancelText="No"
	>
		<Button
			loading={isLoading}
			size="large"
			style={{
				marginLeft: 10,
			}}
		>
			Reset to Default Preferences
		</Button>
	</Popconfirm>
);

ResetPreferences.propTypes = {
	// eslint-disable-next-line
	isRecommendation: bool,
	isLoading: bool,
	deletePreferences: func.isRequired,
};

ResetPreferences.defaultProps = {
	isRecommendation: false,
	isLoading: false,
};

const mapStateToProps = (state, props) => ({
	isLoading: props.isRecommendation
		? get(state, '$deleteRecommendationsPreferences.isFetching')
		: get(state, '$deleteSearchPreferences.isFetching'),
});

const mapDispatchToProps = (dispatch, props) => ({
	deletePreferences: () =>
		props.isRecommendation
			? dispatch(
					deleteRecommendationsPreferences(
						getRecommendationPreferencesPayload(defaultRecommendationsPreferences),
					),
			  )
			: dispatch(
					deleteSearchPreferences(getSearchPreferencesPayload(defaultSearchPreferences)),
			  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(ResetPreferences);
