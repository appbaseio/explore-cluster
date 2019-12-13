import React, { Component } from 'react';
import { Col, Icon, Row } from 'antd';
import { actionIcon, columnSeparator, deleteButton } from '../AppCard/styles';
import DeleteAppModal from '../AppCard/DeleteAppModal';

class AppActions extends Component {
	state = {
		deleteModal: false,
	};

	handleDeleteModal = () => {
		const { deleteModal: currentValue } = this.state;
		this.setState({
			deleteModal: !currentValue,
		});
	};

	render() {
		const { title, data, onExploreClick } = this.props;
		const { deleteModal } = this.state;
		return (
			<div className="card-actions" key={title}>
				<Row type="flex">
					<Col
						span={12}
						className={columnSeparator}
						css={{ color: '#1890ff' }}
						onClick={onExploreClick}
					>
						<Icon className={actionIcon} type="thunderbolt" />
						Explore
					</Col>
					<Col
						span={12}
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
					appName={data.index}
					deleteModal={deleteModal}
					handleDeleteModal={this.handleDeleteModal}
				/>
			</div>
		);
	}
}

export default AppActions;
