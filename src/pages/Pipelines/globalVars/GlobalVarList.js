import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { DeleteOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Input, Tooltip, Button, Modal, Alert } from 'antd';
import { getURL } from '../../../constants/config';
import CreateModal from './CreateModal';
import { globalVarsCardContainer } from './styles';

const GlobalVarList = ({ formData, handleClose, credentials, globalVars }) => {
	const [open, setOpen] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);

	const handleUpdateModalClose = () => {
		setOpen(false);
		handleClose();
	};

	const hanldeDelete = () => {
		const ACC_API = getURL();
		fetch(`${ACC_API}/_pipelines/env/${formData.key}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${btoa(credentials)}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				if (!data.error) {
					setDeleteModal(false);
					handleClose();
				}
			})
			.catch((error) => {
				console.error(error);
			});
	};

	return (
		<div key={formData.key} style={{ padding: 20 }} css={globalVarsCardContainer}>
			<div className="title-container">
				{formData.label}
				{formData.description ? (
					<Tooltip
						title={() => (
							<div
								// eslint-disable-next-line
								dangerouslySetInnerHTML={{
									__html: formData.description,
								}}
							/>
						)}
					>
						<span style={{ marginLeft: 5 }}>
							<InfoCircleOutlined />
						</span>
					</Tooltip>
				) : null}
			</div>
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<Input value={formData.value} className="input-container" disabled />

				<Button
					type="primary"
					onClick={() => setOpen(true)}
					className="validate-button show-on-hover"
				>
					<EditOutlined style={{ margin: '0.25rem' }} />
					Update
				</Button>
				<div
					className="show-on-hover"
					style={{
						cursor: 'pointer',
						color: '#999',
					}}
					onClick={() => setDeleteModal(true)}
				>
					<DeleteOutlined /> Delete
				</div>
			</div>
			<Modal
				title={`Delete global env ${formData.key}`}
				visible={deleteModal}
				onOk={() => hanldeDelete()}
				onCancel={() => setDeleteModal(false)}
				okText={
					<div>
						<DeleteOutlined /> Confirm Deletion
					</div>
				}
			>
				<Alert
					type="warning"
					showIcon
					message="Deleting a global env can prevent existing pipelines from resolving if the env is being used."
				/>
			</Modal>
			<CreateModal
				open={open}
				setOpen={setOpen}
				mode="Update"
				pipelineKey={formData.key}
				handleClose={() => handleUpdateModalClose()}
				globalVars={globalVars}
			/>
		</div>
	);
};

GlobalVarList.propTypes = {
	formData: PropTypes.object,
	globalVars: PropTypes.array,
	handleClose: PropTypes.func.isRequired,
	credentials: PropTypes.string.isRequired,
};

GlobalVarList.defaultProps = {
	formData: {},
	globalVars: [],
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : null,
	};
};

export default connect(mapStateToProps, null)(GlobalVarList);
