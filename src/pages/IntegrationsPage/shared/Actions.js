import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Tooltip } from 'antd';
import { css } from 'react-emotion';
import get from 'lodash/get';
import { string, func, bool, object } from 'prop-types';
import { connect } from 'react-redux';
import Flex from '../../../batteries/components/shared/Flex';
import { getSearchPreferenceDeploymentStatus } from '../../../batteries/modules/actions';
import DeployLogsModal from './ExportInline/Components/DeployLogsModal';

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
	};

	componentDidMount() {
		const { versionState, id } = this.props;
		const { deploymentStatus = {} } = versionState[id] ?? {};
		if (!Object.keys(deploymentStatus).length) this.fetchDeploymentStatus();
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
		const { id, getDeploymentStatus } = this.props;
		getDeploymentStatus(id);
	};

	render() {
		const { modalType } = this.state;
		const { isRecommendation, name, versionState, id } = this.props;
		const { deploymentStatus = {} } = versionState[id] ?? {};

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

					{!isRecommendation &&
					Object.keys(deploymentStatus).length &&
					!deploymentStatus.error ? (
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
							<DeleteOutlined className="" />
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
	name: '',
	isRecommendation: false,
};

Actions.propTypes = {
	id: string.isRequired,
	handleEdit: func.isRequired,
	handleDelete: func.isRequired,
	isRecommendation: bool,
	name: string,
	versionState: object.isRequired,
	getDeploymentStatus: func.isRequired,
};

const mapStateToProps = (state) => ({
	versionState: get(state, '$getSearchPreferencesVersions.results', {}),
});

const mapDispatchToProps = (dispatch) => ({
	getDeploymentStatus: (preferenceId) =>
		dispatch(getSearchPreferenceDeploymentStatus(preferenceId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Actions);
