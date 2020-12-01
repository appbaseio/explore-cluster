import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Icon, Row } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { actionIcon, cloneButton, columnSeparator, deleteButton } from '../AppCard/styles';
import DeleteAppModal from '../AppCard/DeleteAppModal';
import CloneIndex from '../CloneIndex';
import { hasClusterEditAccess } from '../../utils';

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
		const { allowedActions, title, data, onExploreClick } = this.props;
		const { deleteModal, cloneModal } = this.state;
		const canEdit = hasClusterEditAccess(allowedActions);
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
					{canEdit && (
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
					)}
					{canEdit && (
						<Col
							span={8}
							className={deleteButton}
							onClick={(e) => {
								e.preventDefault();
								this.handleDeleteModal();
							}}
							data-cy={`delete-app-${get(data, 'alias') || get(data, 'index')}`}
						>
							<Icon className={actionIcon} type="delete" />
							Delete Index
						</Col>
					)}
				</Row>
				{canEdit && (
					<DeleteAppModal
						appName={get(data, 'alias') || get(data, 'index')}
						index={get(data, 'index')}
						deleteModal={deleteModal}
						handleDeleteModal={this.handleDeleteModal}
					/>
				)}
				{canEdit && cloneModal && (
					<CloneIndex
						handleCancel={this.handleCancel}
						index={get(data, 'alias') || get(data, 'index')}
					/>
				)}
			</div>
		);
	}
}

AppActions.propTypes = {
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
	data: PropTypes.object.isRequired,
	onExploreClick: PropTypes.func.isRequired,
	allowedActions: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
	allowedActions: get(state, 'user.data.allowedActions'),
});
export default connect(mapStateToProps)(AppActions);
