import React from 'react';
import PropTypes from 'prop-types';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { hasClusterEditAccess } from '../../utils';

const NoData = ({ onCreateModalChange, allowedActions }) => {
	const canEdit = hasClusterEditAccess(allowedActions);
	return (
		<>
			<ExclamationCircleOutlined
				style={{
					fontSize: 16,
					marginBottom: 10,
				}}
			/>
			<h4>No indices found</h4>
			{canEdit && <Button onClick={onCreateModalChange}>Create a new index</Button>}
		</>
	);
};

const mapStateToProps = (state) => ({
	allowedActions: get(state, 'user.data.allowedActions'),
});

NoData.propTypes = {
	onCreateModalChange: PropTypes.func.isRequired,
	allowedActions: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(NoData);
