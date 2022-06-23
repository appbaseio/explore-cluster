import React from 'react';
import { Button, Popconfirm, Tooltip, Icon } from 'antd';
import { css } from 'react-emotion';
import { string, func, bool } from 'prop-types';
import DeployLogsModal from './ExportInline/Components/DeployLogsModal';
import Flex from '../../batteries/components/shared/Flex';
import { getDeploymentStatus } from './utils/sandpack-generator';
// import asyncCallWithTimeout from './ExportInline/Components/ModalHeader';

const container = css`
	gap: 10px;
	.ant-btn {
		padding: 0px 10px;
	}
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
	state = {
		modalType: '',
		deploymentStatus: {},
	};

	componentDidMount() {
		this.fetchDeploymentStatus();
	}

	handleEdit = () => {
		const { id, handleEdit } = this.props;
		handleEdit(id);
	};

	handleDelete = () => {
		const { id, handleDelete } = this.props;
		handleDelete(id);
	};

	handleCancel = () => {
		this.setState({
			modalType: '',
		});
	};

	fetchDeploymentStatus = () => {
		const { id } = this.props;
		getDeploymentStatus(id)
			.then((res) => {
				this.setState({
					deploymentStatus: res,
				});
			})
			.catch((err) => {
				console.error(err);
				// setErrMsg(err);
			});
	};

	render() {
		const { modalType, deploymentStatus } = this.state;
		const { isRecommendation, name } = this.props;

		return (
			<div>
				<Flex alignItems="center" css={container} justifyContent="space-between">
					{/* <Flex justifyContent="space-between" alignItems="center" className="left-container"> */}

					<Tooltip
						placement="topLeft"
						title={isRecommendation ? `Edit Recommendation UI` : `Edit Search UI`}
					>
						<Button onClick={this.handleEdit} type="normal">
							View
						</Button>
					</Tooltip>

					{!isRecommendation && Object.keys(deploymentStatus).length ? (
						<Button
							onClick={() => {
								this.setState({ modalType: 'deploy-logs' });
							}}
							type="normal"
						>
							Deploy Status
						</Button>
					) : null}

					<Tooltip
						placement="topLeft"
						title={isRecommendation ? `Delete Recommendation UI` : `Delete Search UI`}
					>
						<Popconfirm
							title={
								isRecommendation ? `Delete Recommendation UI` : `Delete Search UI`
							}
							onConfirm={this.handleDelete}
							okText="Confirm"
							cancelText="Cancel"
						>
							<Icon type="delete" className="show-on-hover" />
						</Popconfirm>
					</Tooltip>
				</Flex>

				<DeployLogsModal
					open={modalType === 'deploy-logs'}
					handleCancel={this.handleCancel}
					deploymentStatus={deploymentStatus}
					uiBuilderName={name}
				/>
				{/* </Flex> */}
			</div>
		);
	}
}

Actions.defaultProps = {
	isRecommendation: false,
};

Actions.defaultProps = {
	name: '',
};

Actions.propTypes = {
	id: string.isRequired,
	handleEdit: func.isRequired,
	handleDelete: func.isRequired,
	isRecommendation: bool,
	name: string,
};

export default Actions;
