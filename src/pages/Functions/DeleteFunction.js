import React from 'react';
import { Button, Modal } from 'antd';
import { connect } from 'react-redux';
import { deleteFunction } from '../../batteries/modules/actions';

function DeleteFunction({ name, deleteFunctions, loading }) {
	return (
		<Button
			type="danger"
			style={{ marginLeft: 8 }}
			loading={loading}
			onClick={() => Modal.confirm({
					title: `Do you want to delete ${name} function?`,
					onOk() {
						deleteFunctions(name);
					},
					onCancel() {},
				})
			}
		>
			Delete Function
		</Button>
	);
}

const mapDispatchToProps = dispatch => ({
	deleteFunctions: funcName => dispatch(deleteFunction(funcName)),
});

export default connect(
	null,
	mapDispatchToProps,
)(DeleteFunction);
