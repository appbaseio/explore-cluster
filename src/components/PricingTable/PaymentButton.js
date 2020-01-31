import React from 'react';
import Stripe from 'react-stripe-checkout';
import { Modal } from 'antd';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AppButton from './AppButton';
import theme from './theme';
import { MESSAGES } from './utils';
import { getAppPlanByName } from '../../batteries/modules/selectors';
import { STRIPE_KEY } from '../../constants';
import { PRICE_BY_PLANS } from '../../batteries/utils';

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
		if (subscriptionID) {
			return (
				<React.Fragment>
					<AppButton
						disabled={this.shouldDisableButton}
						uppercase
						big
						bold
						shadow
						color={theme.colors.accentText}
						backgroundColor={theme.colors.accent}
						onClick={isCurrentPlan ? handleUnsubscribe : this.showModal}
						css={{ marginTop: 40 }}
						{...btnProps}
					>
						{this.text}
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
				disabled={isCurrentPlan}
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
					{this.text}
				</AppButton>
			</Stripe>
		);
	}
}

PaymentButton.defaultProps = {
	isCurrentPlan: false,
	subscriptionID: '',
	isPaid: false,
	handleUnsubscribe: undefined,
	btnProps: null,
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

const mapStateToProps = state => {
	const appPlan = getAppPlanByName(state);
	return {
		isPaid: get(appPlan, 'isPaid', false),
	};
};

export default connect(mapStateToProps, null)(PaymentButton);
