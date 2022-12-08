/*
	route: /cluster/recommendations-builder
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
import Actions from '../shared/Actions';
import Loader from '../../../batteries/components/shared/Loader/Spinner';
import Container from '../../../components/Container';
import { displayErrors } from '../../../batteries/utils/helpers';
import usePrevious from '../../../batteries/hooks/usePrevious';
import {
	getRecommendationsPreferences,
	deleteRecommendationPreference,
} from '../../../batteries/modules/actions';

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
		render: (preference) => <Actions {...preference} isRecommendation />,
		key: 'id',
	},
];

const tableCls = css`
	tr:hover td {
		background: transparent;
	}
`;

const RecommendationsUIsList = ({
	getPreferences,
	errors,
	preferences,
	isFetchingPreferences,
	isDeletingPreference,
	deletePreference,
	history,
}) => {
	const handleCreate = () => {
		history.push('/cluster/recommendations-builder/new');
	};
	const handleEdit = (id) => {
		history.push(`/cluster/recommendations-builder/${id}`);
	};
	const handleDelete = (id) => {
		deletePreference(id).then((action) => {
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
				title="Manage Recommendation UIs"
				extra={
					<Button onClick={handleCreate} type="primary" icon={<PlusOutlined />}>
						Create Recommendation UI{' '}
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
RecommendationsUIsList.defaultProps = {
	preferences: [],
	errors: [],
	isFetchingPreferences: false,
	isDeletingPreference: false,
};
RecommendationsUIsList.propTypes = {
	getPreferences: func.isRequired,
	deletePreference: func.isRequired,
	isFetchingPreferences: bool,
	isDeletingPreference: bool,
	errors: array,
	preferences: array,
	history: object.isRequired,
};

const mapStateToProps = (state) => ({
	preferences: get(state, '$getRecommendationsPreferences.results'),
	isFetchingPreferences: get(state, '$getRecommendationsPreferences.isFetching'),
	isDeletingPreference: get(state, '$deleteRecommendationPreference.isFetching'),
	errors: [get(state, '$deleteRecommendationPreference.error')],
});

const mapDispatchToProps = (dispatch) => ({
	getPreferences: () => dispatch(getRecommendationsPreferences()),
	deletePreference: (id) => dispatch(deleteRecommendationPreference(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RecommendationsUIsList));
