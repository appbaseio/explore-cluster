import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, message, notification, Typography } from 'antd';
import { connect } from 'react-redux';
import { omit, get } from 'lodash';
import { cloneQueryRule } from '../../../../batteries/modules/actions';

class CloneRule extends React.Component {
	handleClone = () => {
		const { cloneQueryRuleAction, rule } = this.props;
		cloneQueryRuleAction(rule, {
			...omit(rule, 'order'),
			name: `${rule.name} (cloned)`,
		}).then((res) => {
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

	render() {
		const { rule, isMobile, ghost, buttonStyle, buttonSize } = this.props;

		if (isMobile) {
			return (
				// eslint-disable-next-line
				<div onClick={this.handleClone}>
					<Icon type={rule.isCloning ? 'loading' : 'copy'} />{' '}
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
				<Icon type={rule.isCloning ? 'loading' : 'copy'} /> Clone
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
});

export default connect(null, mapDispatchToProps)(CloneRule);
