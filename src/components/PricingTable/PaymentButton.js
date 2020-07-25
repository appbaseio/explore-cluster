import React from 'react';
import Stripe from 'react-stripe-checkout';
import { Modal, Button } from 'antd';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'emotion';
import theme from './theme';
import { MESSAGES } from './utils';
import { getAppPlanByName } from '../../batteries/modules/selectors';
import { STRIPE_KEY } from '../../constants';
import { PRICE_BY_PLANS } from '../../batteries/utils';
import { shade } from '../../utils/media';

const styles = (color, backgroundColor) =>
	css(
		backgroundColor && {
			backgroundColor,
			'&:hover, &:focus, &:active': {
				backgroundColor: shade(backgroundColor, -0.1),
				color,
				border: 0,
				boxShadow: '0 6px 6px 0 rgba(0,0,0,.1)',
			},
		},
		color && {
			color,
		},
		{
			whiteSpace: 'nowrap',
			marginTop: 40,
			textTransform: 'uppercase',
			fontFamily:
				'Open Sans,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Noto Sans,Ubuntu,Droid Sans,Helvetica Neue,sans-serif',
			fontWeight: 600,
			height: 44,
			fontSize: '1rem',
			width: 160,
			outline: 'none',
			letterSpacing: '0.01rem',
			textDecoration: 'none',
			padding: '0 25px',
			lineHeight: '1rem',
			boxShadow: '0 3px 3px 0 rgba(0,0,0,0.1)',
			transition: 'all .3s ease',
			userSelect: 'none',
			cursor: 'pointer',
			borderRadius: 3,
			border: 0,
			alignItems: 'center',
			boxSizing: 'border-box',
			webkitFontSmoothing: 'antialiased',
			textRendering: 'optimizeLegibility',
		},
	);
class PaymentButton extends React.Component {
	state = { visible: false };

	get text() {
		const { isCurrentPlan, handleUnsubscribe, subscriptionID, isPaid } = this.props;
		if (subscriptionID && isCurrentPlan) {
			if (handleUnsubscribe && isPaid) {
				return 'Unsubscribe';
			}
			return 'Current Plan';
		}
		return 'Subscribe';
	}

	get shouldDisableButton() {
		const { isCurrentPlan, handleUnsubscribe, isPaid } = this.props;
		return isCurrentPlan && !handleUnsubscribe && isPaid;
	}

	showModal = () => {
		this.setState({
			visible: true,
		});
	};

	handleOk = () => {
		this.setState({
			visible: false,
		});
	};

	handleCancel = () => {
		this.setState({
			visible: false,
		});
	};

	render() {
		const { visible } = this.state;
		const {
			name,
			plan,
			isCurrentPlan,
			handleToken,
			subscriptionID,
			btnProps,
			handleUnsubscribe,
		} = this.props;
		const { color, backgroundColor } = btnProps;
		if (subscriptionID) {
			return (
				<React.Fragment>
					<Button
						disabled={this.shouldDisableButton}
						onClick={isCurrentPlan ? handleUnsubscribe : this.showModal}
						css={styles(color, backgroundColor)}
					>
						{this.text}
					</Button>
					<Modal
						title="Update plan"
						visible={visible}
						onCancel={this.handleCancel}
						onOk={() => {
							handleToken(null, plan);
							this.handleOk();
						}}
					>
						{MESSAGES[plan]}
					</Modal>
				</React.Fragment>
			);
		}
		return (
			<Stripe
				name={name}
				amount={PRICE_BY_PLANS[plan] * 100}
				token={(token) => handleToken(token, plan)}
				disabled={isCurrentPlan}
				stripeKey={STRIPE_KEY.LIVE}
			>
				<Button css={styles(color, backgroundColor)}>{this.text}</Button>
			</Stripe>
		);
	}
}

PaymentButton.defaultProps = {
	isCurrentPlan: false,
	subscriptionID: '',
	isPaid: false,
	handleUnsubscribe: undefined,
	btnProps: {
		color: theme.colors.accentText,
		backgroundColor: theme.colors.accent,
	},
};

PaymentButton.propTypes = {
	name: PropTypes.string.isRequired,
	plan: PropTypes.string.isRequired,
	handleUnsubscribe: PropTypes.func,
	btnProps: PropTypes.object,
	isCurrentPlan: PropTypes.bool,
	isPaid: PropTypes.bool,
	handleToken: PropTypes.func.isRequired,
	subscriptionID: PropTypes.string,
};

const mapStateToProps = (state) => {
	const appPlan = getAppPlanByName(state);
	return {
		isPaid: get(appPlan, 'isPaid', false),
	};
};

export default connect(mapStateToProps, null)(PaymentButton);
