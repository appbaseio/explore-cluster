import React, { useEffect, useState } from 'react';
import { Input, message, Modal, notification } from 'antd';
import { connect } from 'react-redux';
import { cloneQueryRule } from '../../../../../batteries/modules/actions';

// eslint-disable-next-line no-shadow
function CloneRuleModal({ rule, cloneQueryRule, handleCancel }) {
	const [ruleName, setRuleName] = useState(undefined);
	const [didMount, setDidMount] = useState(false);
	useEffect(() => {
		if (!ruleName) return;
		if (didMount) {
			if (rule && rule.cloneError) {
				notification.error({
					message: 'Error',
					description: rule.cloneError,
				});
			} else if (!rule.isCloning) {
				message.success(`${rule.name} cloned successfully`);
				handleCancel();
			}
		} else setDidMount(true);
	}, [rule]);
	return (
		<Modal
			okText="Clone"
			onOk={() =>
				cloneQueryRule(rule, {
					...rule,
					name: ruleName,
				})
			}
			onCancel={handleCancel}
			title={`Clone ${rule.name} rule`}
			visible
			confirmLoading={rule.isCloning}
			destroyOnClose
			okButtonProps={{ disabled: !ruleName }}
		>
			Type the rule name below to clone this rule. This action cannot be undone.
			<Input
				onChange={event => {
					const { value } = event.target;
					setRuleName(value);
				}}
				style={{ marginTop: '12px' }}
			/>
		</Modal>
	);
}

const mapDispatchToProps = dispatch => ({
	cloneQueryRule: (rule, newRule) => dispatch(cloneQueryRule(rule, newRule)),
});

export default connect(null, mapDispatchToProps)(CloneRuleModal);
