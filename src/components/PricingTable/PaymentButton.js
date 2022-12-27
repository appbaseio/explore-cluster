import React from 'react';
import { Modal, Button } from 'antd';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'emotion';
import StripeForm from '../StripeForms/StripeForm';
import theme from './theme';
import { MESSAGES } from './utils';
import { getAppPlanByName } from '../../batteries/modules/selectors';
import { PRICE_BY_PLANS } from '../../batteries/utils';
import { shade } from '../../utils/media';

export const styles = (color, backgroundColor) =>
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
						open={visible}
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
			<StripeForm
				mainTitle={name}
				buttonTitle={`Pay $${PRICE_BY_PLANS[plan]}`}
				actionType="Clicked-Payment-Button"
				handleToken={handleToken}
				plan={plan}
				disabled={isCurrentPlan}
				ActionComponent={(props) => (
					<Button {...props} css={styles(color, backgroundColor)}>
						{this.text}
					</Button>
				)}
			/>
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
