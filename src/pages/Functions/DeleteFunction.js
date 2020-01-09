import React, { useState } from 'react';
import {
 Button, Icon, Input, Modal,
} from 'antd';
import { connect } from 'react-redux';
import { deleteFunction } from '../../batteries/modules/actions';

function DeleteFunction({ name, deleteFunctions, loading }) {
	const [disabled, setDisabled] = useState(true);
	const [visible, setVisible] = useState(false);
	return (
		<>
			<Button
				type="danger"
				style={{ marginRight: 8 }}
				loading={loading}
				onClick={() => setVisible(true)}
			>
				<Icon type="delete" />
				Delete Function
			</Button>
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
						console.log({ value });
						setDisabled(value !== name);
					}}
					style={{ marginTop: '12px' }}
				/>
			</Modal>
		</>
	);
}

const mapDispatchToProps = dispatch => ({
	deleteFunctions: funcName => dispatch(deleteFunction(funcName)),
});

export default connect(
	null,
	mapDispatchToProps,
)(DeleteFunction);
