import React, { Component } from 'react';
import { Col, Icon, Row } from 'antd';
import { actionIcon, cloneButton, columnSeparator, deleteButton } from '../AppCard/styles';
import DeleteAppModal from '../AppCard/DeleteAppModal';
import CloneIndex from '../CloneIndex';

class AppActions extends Component {
	state = {
		deleteModal: false,
		cloneModal: false,
	};

	handleDeleteModal = () => {
		const { deleteModal: currentValue } = this.state;
		this.setState({
			deleteModal: !currentValue,
		});
	};

	handleCloneModal = () => {
		const { cloneModal: currentValue } = this.state;
		this.setState({
			cloneModal: !currentValue,
		});
	};

	handleCancel = () => {
		this.setState({ cloneModal: false });
	};

	render() {
		const { title, data, onExploreClick } = this.props;
		const { deleteModal, cloneModal } = this.state;
		return (
			<div className="card-actions" key={title}>
				<Row type="flex">
					<Col
						span={8}
						className={columnSeparator}
						css={{ color: '#1890ff' }}
						onClick={onExploreClick}
					>
						<Icon className={actionIcon} type="thunderbolt" />
						Explore
					</Col>
					<Col
						span={8}
						className={cloneButton}
						onClick={(e) => {
							e.preventDefault();
							this.handleCloneModal();
						}}
					>
						<Icon className={actionIcon} type="copy" />
						Clone Index
					</Col>
					<Col
						span={8}
						className={deleteButton}
						onClick={(e) => {
							e.preventDefault();
							this.handleDeleteModal();
						}}
					>
						<Icon className={actionIcon} type="delete" />
						Delete Index
					</Col>
				</Row>
				<DeleteAppModal
					appName={data.alias || data.index}
					index={data.index}
					deleteModal={deleteModal}
					handleDeleteModal={this.handleDeleteModal}
				/>
				{cloneModal && (
					<CloneIndex handleCancel={this.handleCancel} index={data.alias || data.index} />
				)}
			</div>
		);
	}
}

export default AppActions;
