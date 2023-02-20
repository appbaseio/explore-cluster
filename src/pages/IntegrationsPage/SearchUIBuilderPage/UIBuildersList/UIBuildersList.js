/*
	route: /cluster/search-builder
*/

import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import { func, array, bool, object } from 'prop-types';
import { PlusOutlined } from '@ant-design/icons';
import { Card, Button, List } from 'antd';
import { connect } from 'react-redux';
import Container from '../../../../components/Container';
import { displayErrors } from '../../../../batteries/utils/helpers';
import usePrevious from '../../../../batteries/hooks/usePrevious';
import {
	getSearchPreferences,
	deleteSearchPreference as deleteSearchPreferenceAction,
} from '../../../../batteries/modules/actions';

import UIBuildersListItem from './UIBuilderListItem';
import PreferencesFormWrapper from '../../shared/PreferencesFormWrapper';

const UIBuildersList = ({
	getPreferences,
	errors,
	preferences,
	isFetchingPreferences,
	isDeletingPreference,
	history,
}) => {
	useEffect(() => {
		// fetch preferences
		getPreferences();
	}, []);

	const prevErrors = usePrevious(errors);
	// To display error messages
	useEffect(() => {
		displayErrors(errors, prevErrors);
	}, [errors]);

	const handleCreate = () => {
		history.push('/cluster/search-builder/new');
	};
	const handleEdit = (id) => {
		history.push(`/cluster/search-builder/${id}`);
	};

	return (
		<Container>
			<Card
				title="Manage Search UIs"
				extra={
					<Button onClick={handleCreate} type="primary" icon={<PlusOutlined />}>
						Create Search UI{' '}
					</Button>
				}
			>
				<List
					pagination={{
						pageSize: 3,
						showSizeChanger: false,
					}}
					dataSource={preferences}
					loading={isFetchingPreferences || isDeletingPreference}
					renderItem={(preference) => (
						<PreferencesFormWrapper preferenceId={preference.id} showBack={false}>
							{({ getPreferencesPayload }) => (
								<UIBuildersListItem
									preference={preference}
									getPreferencesPayload={getPreferencesPayload}
									handleEdit={handleEdit}
								/>
							)}
						</PreferencesFormWrapper>
					)}
				/>
			</Card>
		</Container>
	);
};

UIBuildersList.defaultProps = {
	preferences: [],
	errors: [],
	isFetchingPreferences: false,
	isDeletingPreference: false,
};

UIBuildersList.propTypes = {
	getPreferences: func.isRequired,
	isFetchingPreferences: bool,
	isDeletingPreference: bool,
	errors: array,
	preferences: array,
	history: object.isRequired,
};

const mapStateToProps = (state) => ({
	preferences: get(state, '$getSearchPreferences.results'),
	isFetchingPreferences: get(state, '$getSearchPreferences.isFetching'),
	isDeletingPreference: get(state, '$deleteSearchPreference.isFetching'),
	errors: [get(state, '$deleteSearchPreference.error')],
});

const mapDispatchToProps = (dispatch) => ({
	getPreferences: () => dispatch(getSearchPreferences()),
	deleteSearchPreference: (id) => dispatch(deleteSearchPreferenceAction(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(UIBuildersList));
