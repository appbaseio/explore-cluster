/*
	route: /cluster/search-builder
*/

import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import { func, array, bool, object } from 'prop-types';
import { css } from 'react-emotion';
import { PlusOutlined } from '@ant-design/icons';
import { Table, Card, Button } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import Actions from '../../Actions';
import Loader from '../../../../batteries/components/shared/Loader/Spinner';
import Container from '../../../../components/Container';
import { displayErrors } from '../../../../batteries/utils/helpers';
import usePrevious from '../../../../batteries/hooks/usePrevious';
import {
	getSearchPreferencesN,
	deleteSearchPreferenceN,
} from '../../../../batteries/modules/actions';

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
		title: 'Last Updated',
		dataIndex: 'updatedAt',
		render: (key) => {
			return {
				children: (
					<p style={{ fontSize: '14px', width: 'max-content', margin: 0 }}>{key}</p>
				),
			};
		},
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
	history,
}) => {
	const handleCreate = () => {
		history.push('/cluster/search-builder/new');
	};
	const handleEdit = (id) => {
		history.push(`/cluster/search-builder/${id}`);
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
				<Table
					dataSource={preferences.map((preference) => ({
						id: preference.id,
						name: preference.name,
						description: preference.description,
						pipeline: preference.pipeline,
						updatedAt:
							preference.updated_at || preference.created_at
								? moment
										.unix(preference.updated_at || preference.created_at)
										.format('ddd D MMM, hh:mm A')
								: 'NA',
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
	history: object.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(List));
