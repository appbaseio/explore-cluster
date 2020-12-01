import React from 'react';
import { Input, message, Modal } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { deleteApp } from '../../utils';
import { removeAppData } from '../../actions';
import { deleteSettings } from '../../batteries/modules/actions';
import { isValidPlan } from '../../batteries/utils';
import { allowedTiers } from '../../utils/prop-types';

class DeleteAppModal extends React.Component {
	state = {
		deleteAppName: '',
		loading: false,
	};

	handleDelete = async () => {
		const {
			appName,
			handleDeleteModal,
			handleRemoveApp,
			onDelete,
			deleteSettingsAction,
			tier,
			index,
			featureSearchRelevancy,
		} = this.props;

		this.setState({
			loading: true,
		});

		if (isValidPlan(tier, featureSearchRelevancy)) {
			await deleteSettingsAction(appName);
		}

		deleteApp(index)
			.then(() => {
				handleRemoveApp(appName);
				handleDeleteModal();
				message.success(`${appName} deleted!`);
				if (onDelete) {
					onDelete();
				}
				this.setState({
					loading: false,
					deleteAppName: '',
				});
			})
			.catch((e) => {
				message.error(e.message);
				this.setState({
					loading: false,
					deleteAppName: '',
				});
			});
	};

	handleInputChange = (e) => {
		const { name, value } = e.target;
		this.setState({
			[name]: value,
		});
	};

	render() {
		const { deleteModal, appName, handleDeleteModal } = this.props;
		const { deleteAppName, loading } = this.state;

		let disabled = true;
		if (deleteAppName === appName) {
			disabled = false;
		}

		return (
			<div onClick={(e) => e.preventDefault()}>
				<Modal
					visible={deleteModal}
					onOk={this.handleDelete}
					onCancel={handleDeleteModal}
					destroyOnClose
					title="Confirm Delete"
					okText="Delete"
					okButtonProps={{
						type: 'danger',
						disabled,
						loading,
						'data-cy': `delete-index-${appName}`,
					}}
				>
					<p>
						Type the index name <span style={{ fontWeight: '600' }}>{appName}</span>{' '}
						below to delete the index. This action cannot be undone.
					</p>
					<Input
						placeholder="Confirm Delete"
						onChange={this.handleInputChange}
						value={deleteAppName}
						name="deleteAppName"
						data-cy="delete-index-name"
					/>
				</Modal>
			</div>
		);
	}
}

DeleteAppModal.propTypes = {
	deleteModal: PropTypes.bool.isRequired,
	appName: PropTypes.string.isRequired,
	handleDeleteModal: PropTypes.func.isRequired,
	handleRemoveApp: PropTypes.func.isRequired,
	onDelete: PropTypes.func,
	deleteSettingsAction: PropTypes.func.isRequired,
	tier: allowedTiers,
	index: PropTypes.string.isRequired,
	featureSearchRelevancy: PropTypes.bool.isRequired,
};

DeleteAppModal.defaultProps = {
	tier: undefined,
	onDelete: () => {},
};

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
});

const mapDispatchToProps = (dispatch) => ({
	handleRemoveApp: (options) => dispatch(removeAppData(options)),
	deleteSettingsAction: (name) => dispatch(deleteSettings(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeleteAppModal);
