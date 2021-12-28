import React, { useEffect, useState } from 'react';
import get from 'lodash/get';
import { func, array, bool } from 'prop-types';
import { css } from 'react-emotion';
import { Table, Card, Button } from 'antd';
import { connect } from 'react-redux';
import Actions from '../Actions';
import Loader from '../../../batteries/components/shared/Loader/Spinner';
import Container from '../../../components/Container';
import { displayErrors } from '../../../batteries/utils/helpers';
import usePrevious from '../../../batteries/hooks/usePrevious';
import { getSearchPreferencesN, deleteSearchPreferenceN } from '../../../batteries/modules/actions';
import Main from './Main';

const columns = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
		render: (key) => key || '_',
	},
	{
		title: 'Description',
		dataIndex: 'description',
		render: (key) => key || '_',
	},
	{
		title: 'Pipeline',
		dataIndex: 'pipeline',
		key: 'pipeline',
	},
	{
		title: 'Actions',
		render: (preference) => <Actions {...preference} />,
		key: 'id',
	},
];

const tableCls = css`
	tr:hover td {
		background: transparent;
	}
`;

const List = ({
	getPreferences,
	errors,
	preferences,
	isFetchingPreferences,
	isDeletingPreference,
	deleteSearchPreference,
}) => {
	const [showForm, setShowForm] = useState(false);
	const [preferenceId, setPreferenceId] = useState(undefined);
	const handleCreate = () => {
		setPreferenceId(null);
		setShowForm(true);
	};
	const closeForm = () => {
		setPreferenceId(null);
		setShowForm(false);
	};
	const handleEdit = (id) => {
		setPreferenceId(id);
		setShowForm(true);
	};
	const handleDelete = (id) => {
		deleteSearchPreference(id).then((action) => {
			if (!(action && action.error)) {
				// fetch preferences
				getPreferences();
			}
		});
	};
	useEffect(() => {
		// fetch preferences
		getPreferences();
	}, []);
	const prevErrors = usePrevious(errors);
	// To display error messages
	useEffect(() => {
		displayErrors(errors, prevErrors);
	}, [errors]);
	if (showForm) {
		return <Main closeForm={closeForm} preferenceId={preferenceId} />;
	}
	return (
		<Container>
			<Card
				title="Manage Search Preferences"
				extra={
					<Button onClick={handleCreate} type="primary" icon="plus">
						Create Preference{' '}
					</Button>
				}
			>
				<Table
					dataSource={preferences.map((preference) => ({
						id: preference.id,
						name: preference.name,
						description: preference.description,
						pipeline: preference.pipeline,
						handleEdit,
						handleDelete,
					}))}
					loading={{
						indicator: <Loader />,
						spinning: isFetchingPreferences || isDeletingPreference,
					}}
					rowKey={(row) => row.id}
					columns={columns}
					css={tableCls}
				/>
			</Card>
		</Container>
	);
};
List.defaultProps = {
	preferences: [],
	errors: [],
	isFetchingPreferences: false,
	isDeletingPreference: false,
};
List.propTypes = {
	getPreferences: func.isRequired,
	deleteSearchPreference: func.isRequired,
	isFetchingPreferences: bool,
	isDeletingPreference: bool,
	errors: array,
	preferences: array,
};

const mapStateToProps = (state) => ({
	preferences: get(state, '$getSearchPreferencesN.results'),
	isFetchingPreferences: get(state, '$getSearchPreferencesN.isFetching'),
	isDeletingPreference: get(state, '$deleteSearchPreferenceN.isFetching'),
	errors: [get(state, '$deleteSearchPreferenceN.error')],
});

const mapDispatchToProps = (dispatch) => ({
	getPreferences: () => dispatch(getSearchPreferencesN()),
	deleteSearchPreference: (id) => dispatch(deleteSearchPreferenceN(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(List);
