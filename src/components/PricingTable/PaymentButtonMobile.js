import React from 'react';
import Stripe from 'react-stripe-checkout';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { getAppPlanByName } from '../../batteries/modules/selectors';

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
			linkColor,
		} = this.props;
		if (subscriptionID) {
			return (
				<React.Fragment>
					<Link
						disabled={this.shouldDisableButton}
						onClick={isCurrentPlan ? handleUnsubscribe : this.showModal}
						css={{ color: linkColor }}
						{...btnProps}
					>
						{this.text}
					</Link>
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
				<Link css={{ color: linkColor }}>{this.text}</Link>
			</Stripe>
		);
	}
}

PaymentButtonMobile.defaultProps = {
	isCurrentPlan: false,
	linkColor: '',
	subscriptionID: '',
	handleUnsubscribe: undefined,
	btnProps: null,
	isPaid: false,
	buttonText: 'Subscribe',
};

PaymentButtonMobile.propTypes = {
	name: PropTypes.string.isRequired,
	handleUnsubscribe: PropTypes.func,
	linkColor: PropTypes.string,
	buttonText: PropTypes.string,
	plan: PropTypes.string.isRequired,
	isPaid: PropTypes.bool,
	btnProps: PropTypes.object,
	isCurrentPlan: PropTypes.bool,
	handleToken: PropTypes.func.isRequired,
	subscriptionID: PropTypes.string,
};

const mapStateToProps = state => {
	const appPlan = getAppPlanByName(state);
	return {
		isPaid: get(appPlan, 'isPaid', false),
	};
};

export default connect(mapStateToProps, null)(PaymentButtonMobile);
