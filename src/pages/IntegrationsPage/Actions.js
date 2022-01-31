import React from 'react';
import { Button, Popconfirm, Tooltip, Icon } from 'antd';
import { css } from 'react-emotion';
import { string, func, bool } from 'prop-types';
import Flex from '../../batteries/components/shared/Flex';

const container = css`
	.left-container {
		padding-right: 20px;
	}
	.show-on-hover {
		transform: rotateX(90deg);
		opacity: 0;
		transition: all ease 0.3s;
		font-size: 16px;
	}
	&:hover {
		.show-on-hover {
			transform: rotateX(0deg);
			opacity: 1;
		}
	}
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
		const { isRecommendation } = this.props;
		return (
			<Flex alignItems="center" css={container}>
				<Flex justifyContent="space-between" alignItems="center" className="left-container">
					<Flex>
						<Tooltip
							placement="topLeft"
							title={isRecommendation ? `Edit Recommendation UI` : `Edit Search UI`}
						>
							<Button onClick={this.handleEdit} type="normal">
								View
							</Button>
						</Tooltip>
					</Flex>
				</Flex>
				<Tooltip
					placement="topLeft"
					title={isRecommendation ? `Delete Recommendation UI` : `Delete Search UI`}
				>
					<Popconfirm
						title={isRecommendation ? `Delete Recommendation UI` : `Delete Search UI`}
						onConfirm={this.handleDelete}
						okText="Confirm"
						cancelText="Cancel"
					>
						<Icon type="delete" className="show-on-hover" />
					</Popconfirm>
				</Tooltip>
			</Flex>
		);
	}
}

Actions.defaultProps = {
	isRecommendation: false,
};

Actions.propTypes = {
	id: string.isRequired,
	handleEdit: func.isRequired,
	handleDelete: func.isRequired,
	isRecommendation: bool,
};

export default Actions;
