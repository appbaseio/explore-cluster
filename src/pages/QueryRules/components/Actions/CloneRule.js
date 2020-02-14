import React, { useEffect, useState } from 'react';
import { Button, Icon, Input, message, Modal, notification } from 'antd';
import { connect } from 'react-redux';
import { cloneQueryRule } from '../../../../batteries/modules/actions';

// eslint-disable-next-line no-shadow
function CloneRule({ rule, cloneQueryRule }) {
	const [ruleName, setRuleName] = useState(true);
	const [visible, setVisible] = useState(false);
	const [didMount, setDidMount] = useState(false);
	useEffect(() => {
		if (didMount) {
			if (rule && rule.cloneError) {
				notification.error({
					message: 'Error',
					description: rule.cloneError,
				});
			} else if (!rule.isCloning) {
				message.success(`${ruleName} cloned successfully`);
				setVisible(false);
			}
		} else setDidMount(true);
	}, [rule]);
	return (
		<>
			<Button onClick={() => setVisible(true)} type="primary">
				<Icon type="copy" /> Clone
			</Button>
			<Modal
				okText="Clone"
				onOk={() => cloneQueryRule(rule, { ...rule, name: ruleName })}
				onCancel={() => setVisible(false)}
				title={`Clone ${rule.name} rule`}
				visible={visible}
				confirmLoading={rule.isCloning}
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
		</>
	);
}

const mapDispatchToProps = dispatch => ({
	cloneQueryRule: (rule, newRule) => dispatch(cloneQueryRule(rule, newRule)),
});

export default connect(null, mapDispatchToProps)(CloneRule);
