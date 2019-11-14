import React from 'react';
import Stripe from 'react-stripe-checkout';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import AppButton from './AppButton';
import theme from './theme';
import { MESSAGES } from './utils';

import { STRIPE_KEY } from '../../constants';
import { PRICE_BY_PLANS } from '../../batteries/utils';

class PaymentButton extends React.Component {
	state = { visible: false };

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
 name, plan, disabled, handleToken, subscriptionID, btnProps,
} = this.props;
		if (subscriptionID) {
			return (
				<React.Fragment>
					<AppButton
						uppercase
						big
						bold
						shadow
						color={theme.colors.accentText}
						backgroundColor={theme.colors.accent}
						onClick={disabled ? null : this.showModal}
						css={{ marginTop: 40 }}
						{...btnProps}
					>
						{disabled ? 'Current Plan' : 'Subscribe'}
					</AppButton>
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
				token={token => handleToken(token, plan)}
				disabled={disabled}
				stripeKey={STRIPE_KEY.LIVE}
			>
				<AppButton
					uppercase
					big
					bold
					shadow
					color={theme.colors.accentText}
					backgroundColor={theme.colors.accent}
					css={{ marginTop: 40 }}
					{...btnProps}
				>
					{disabled ? 'Current Plan' : 'Subscribe'}
				</AppButton>
			</Stripe>
		);
	}
}

PaymentButton.defaultProps = {
	disabled: false,
	subscriptionID: '',
	btnProps: null,
};

PaymentButton.propTypes = {
	name: PropTypes.string.isRequired,
	plan: PropTypes.string.isRequired,
	btnProps: PropTypes.object,
	disabled: PropTypes.bool,
	handleToken: PropTypes.func.isRequired,
	subscriptionID: PropTypes.string,
};
export default PaymentButton;
