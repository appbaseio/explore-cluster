import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popconfirm, Row } from 'antd';
import { css } from 'emotion';

const rowContainer = css`
	button:nth-child(1) {
		margin-right: 5px;
		margin-bottom: 5px;
	}
	button:nth-child(2) {
		margin-right: 5px;
		margin-bottom: 5px;
	}
`;
const Actions = ({ handleEdit, handleRender, handleDelete }) => (
	<Row css={rowContainer}>
		<Button data-cy="sq-copy-curl" onClick={handleRender}>
			Copy as cURL
		</Button>
		<Button data-cy="sq-edit" onClick={handleEdit}>
			Edit
		</Button>
		<Popconfirm
			title="Are you sure to delete this Stored Query?"
			onConfirm={handleDelete}
			okText="Yes"
			cancelText="No"
		>
			<Button data-cy="sq-delete" danger>
				Delete
			</Button>
		</Popconfirm>
	</Row>
);

Actions.propTypes = {
	handleRender: PropTypes.func.isRequired,
	handleEdit: PropTypes.func.isRequired,
	handleDelete: PropTypes.func.isRequired,
};

export default Actions;
