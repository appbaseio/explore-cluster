import React from 'react';
import Stripe from 'react-stripe-checkout';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import AppButton from './AppButton';
import theme from './theme';

import { STRIPE_KEY } from '../../constants';
import { PRICE_BY_PLANS } from '../../batteries/utils';
import { MESSAGES } from './utils';

const Link = styled('a')`
	font-size: 1rem;
	text-transform: uppercase;
	text-decoration: none;
	font-weight: 600;
	font-weight: 700;
	border-bottom-width: 2px;
	border-bottom-style: dashed;
`;

class PaymentButtonMobile extends React.Component {
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
			name,
			plan,
			disabled,
			handleToken,
			subscriptionID,
			btnProps,
			buttonText,
			linkColor,
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
				<Link css={{ color: linkColor }}>{buttonText}</Link>
			</Stripe>
		);
	}
}

PaymentButtonMobile.defaultProps = {
	disabled: false,
	linkColor: '',
	subscriptionID: '',
	btnProps: null,
	buttonText: 'Subscribe',
};

PaymentButtonMobile.propTypes = {
	name: PropTypes.string.isRequired,
	linkColor: PropTypes.string,
	buttonText: PropTypes.string,
	plan: PropTypes.string.isRequired,
	btnProps: PropTypes.object,
	disabled: PropTypes.bool,
	handleToken: PropTypes.func.isRequired,
	subscriptionID: PropTypes.string,
};
export default PaymentButtonMobile;
