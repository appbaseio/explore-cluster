import React, { useState } from 'react';
import { Icon, Input, Modal, Tooltip } from 'antd';
import { connect } from 'react-redux';
import { deleteFunction } from '../../batteries/modules/actions';

function DeleteFunction({ name, deleteFunctions, loading }) {
	const [disabled, setDisabled] = useState(true);
	const [visible, setVisible] = useState(false);
	return (
		<>
			<Tooltip title="Delete Function">
				<Icon
					theme="twoTone"
					type="delete"
					twoToneColor="#d11a2a"
					style={{ cursor: 'pointer' }}
					onClick={() => setVisible(true)}
				/>
			</Tooltip>
			<Modal
				confirmLoading={loading}
				okText="Delete"
				onOk={() => deleteFunctions(name)}
				onCancel={() => setVisible(false)}
				title="Confirm Delete"
				visible={visible}
				okButtonProps={{ disabled }}
			>
				Type the function name <span style={{ fontWeight: '600' }}>{name}</span> below to
				delete this function. This action cannot be undone.
				<Input
					onChange={(event) => {
						const { value } = event.target;
						setDisabled(value !== name);
					}}
					style={{ marginTop: '12px' }}
				/>
			</Modal>
		</>
	);
}

const mapDispatchToProps = (dispatch) => ({
	deleteFunctions: (funcName) => dispatch(deleteFunction(funcName)),
});

export default connect(null, mapDispatchToProps)(DeleteFunction);
