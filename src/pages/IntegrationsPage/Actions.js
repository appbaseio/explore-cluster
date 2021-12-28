import React from 'react';
import { Button, Popconfirm, Tooltip } from 'antd';
import { css } from 'react-emotion';
import { string, func } from 'prop-types';
import Flex from '../../batteries/components/shared/Flex';

const container = css`
	padding-right: 10px;
`;
class Actions extends React.Component {
	handleEdit = () => {
		const { id, handleEdit } = this.props;
		handleEdit(id);
	};

	handleDelete = () => {
		const { id, handleDelete } = this.props;
		handleDelete(id);
	};

	render() {
		return (
			<Flex alignItems="center">
				<Flex justifyContent="space-between" alignItems="center" css={container}>
					<Flex>
						<Tooltip placement="topLeft" title="Edit Preference">
							<Button onClick={this.handleEdit} type="normal">
								View
							</Button>
						</Tooltip>
					</Flex>
				</Flex>
				<Tooltip placement="topLeft" title="Delete Preference">
					<Popconfirm
						title="Are you sure to delete preference?"
						onConfirm={this.handleDelete}
						okText="Yes"
						cancelText="No"
					>
						<Button type="danger">Delete</Button>
					</Popconfirm>
				</Tooltip>
			</Flex>
		);
	}
}

Actions.propTypes = {
	id: string.isRequired,
	handleEdit: func.isRequired,
	handleDelete: func.isRequired,
};

export default Actions;
