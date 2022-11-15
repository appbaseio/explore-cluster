import React from 'react';
import PropTypes from 'prop-types';
import { Button, message, notification, Typography } from 'antd';
import { LoadingOutlined, CopyOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import omit from 'lodash/omit';
import get from 'lodash/get';
import { cloneQueryRule, getScriptRule } from '../../../../batteries/modules/actions';

class CloneRule extends React.Component {
	handleClone = () => {
		const { cloneQueryRuleAction, rule, fetchScriptRule } = this.props;

		const cloneAction = (newRule) => {
			cloneQueryRuleAction(rule, newRule).then((res) => {
				if (res && res.error) {
					notification.error({
						message: 'Error',
						description: get(res.error, 'message'),
					});
				} else {
					message.success(`${rule.name} cloned successfully`);
				}
			});
		};
		const extractScriptAction = rule.actions?.filter(
			(actionItem) => actionItem.type === 'script',
		);
		const newRule = {
			...omit(rule, 'order'),
			name: `${rule.name} (cloned)`,
		};

		if (extractScriptAction.length) {
			fetchScriptRule(newRule.id).then((res) => {
				if (res && res.error) {
					notification.error({
						message: 'Error',
						description: get(res.error, 'message'),
					});
				} else {
					newRule.actions = newRule.actions.map((actionItem) => {
						if (actionItem.type === 'script') {
							return { ...actionItem, script: res.payload.script };
						}
						return actionItem;
					});
					cloneAction(newRule);
				}
			});
		} else {
			cloneAction(newRule);
		}
	};

	render() {
		const { rule, isMobile, ghost, buttonStyle, buttonSize } = this.props;

		if (isMobile) {
			return (
				// eslint-disable-next-line
				<div onClick={this.handleClone}>
					{rule.isCloning ? <LoadingOutlined /> : <CopyOutlined />}{' '}
					<Typography.Text>Clone</Typography.Text>
				</div>
			);
		}
		return (
			<Button
				onClick={this.handleClone}
				type="primary"
				ghost={ghost}
				style={buttonStyle}
				size={buttonSize}
				disabled={rule.isCloning}
			>
				{rule.isCloning ? <LoadingOutlined /> : <CopyOutlined />}
				Clone
			</Button>
		);
	}
}

CloneRule.propTypes = {
	rule: PropTypes.object,
	isMobile: PropTypes.bool,
	ghost: PropTypes.bool,
	buttonStyle: PropTypes.object,
	buttonSize: PropTypes.string,
	cloneQueryRuleAction: PropTypes.func.isRequired,
	fetchScriptRule: PropTypes.func.isRequired,
};

CloneRule.defaultProps = {
	rule: {},
	isMobile: false,
	ghost: false,
	buttonStyle: {},
	buttonSize: 'default',
};

const mapDispatchToProps = (dispatch) => ({
	cloneQueryRuleAction: (rule, newRule) => dispatch(cloneQueryRule(rule, newRule)),
	fetchScriptRule: (scriptId) => dispatch(getScriptRule(scriptId)),
});

export default connect(null, mapDispatchToProps)(CloneRule);
