/* eslint-disable jsx-a11y/label-has-associated-control,  jsx-a11y/label-has-for */
import React, { Fragment, useState } from 'react';
import {
	useStripe,
	useElements,
	CardNumberElement,
	CardCvcElement,
	CardExpiryElement,
} from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import { Modal, Button, Alert } from 'antd';
import styled from 'react-emotion';
import WithStripe from './WithStripe';

const Wrapper = styled.div`
	label {
		color: rgba(0, 0, 0, 0.65);
		letter-spacing: 0.025em;
	}
	input,
	.StripeElement {
		display: block;
		margin: 10px 0 20px 0;
		max-width: 500px;
		padding: 10px 14px;
		font-size: 1em;
		border: 1px solid #e8e8e8;
		outline: 0;
		background: white;
	}
	input::placeholder {
		color: #aab7c4;
	}
	input:focus,
	.StripeElement--focus {
		/* box-shadow: rgba(50, 50, 93, 0.109804) 0px 4px 6px,
			rgba(0, 0, 0, 0.0784314) 0px 1px 3px;
		-webkit-transition: all 150ms ease; */
		transition: all 150ms ease;
	}
	.StripeElement.IdealBankElement,
	.StripeElement.FpxBankElement,
	.StripeElement.PaymentRequestButton {
		padding: 0;
	}
	.StripeElement.PaymentRequestButton {
		height: 40px;
	}
`;

const options = {
	style: {
		base: {
			color: '#32325d',
			fontFamily: '"Open Sans","Helvetica Neue", Helvetica, sans-serif',
			fontSmoothing: 'antialiased',
			fontSize: '16px',
			'::placeholder': {
				color: '#aab7c4',
			},
		},
		invalid: {
			color: '#fa755a',
			iconColor: '#fa755a',
		},
	},
};

const StripeForm = ({
	mainTitle,
	buttonTitle,
	actionType,
	ActionComponent,
	handleToken,
	loading,
	plan,
	disabled,
}) => {
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isShowingModal, setIsShowingModal] = useState(false);

	const stripe = useStripe();
	const elements = useElements();

	const clearElements = () => {
		elements.getElement(CardNumberElement).clear();
		elements.getElement(CardCvcElement).clear();
		elements.getElement(CardExpiryElement).clear();
		setError(null);
	};

	const handleError = (err) => {
		setError(err);
		setTimeout(() => {
			setError(null);
			setIsLoading(false);
		}, 7000);
	};

	const showModal = async () => {
		await setIsShowingModal(true);
		setTimeout(() => elements.getElement(CardNumberElement).focus(), 1000);
	};

	const okHandler = () => {
		setIsShowingModal(false);
	};

	const cancelHandler = () => {
		setIsShowingModal(false);
		clearElements();
	};

	const handleSubmit = async (event) => {
		try {
			event.preventDefault();

			if (!stripe || !elements) {
				// Stripe.js has not loaded yet. Make sure to disable
				// form submission until Stripe.js has loaded.
				return;
			}

			setIsLoading(true);
			setError(null);

			const payload = await stripe.createToken(elements.getElement(CardNumberElement));

			setIsLoading(false);

			if (payload.error) {
				handleError(payload.error);
				return;
			}

			if (actionType === 'Update-Details' || actionType === 'Subscribe-Curated-Insights') {
				await handleToken(payload.token);
				clearElements();
				okHandler();
			}

			if (actionType === 'Clicked-Payment-Button') {
				await handleToken(payload.token, plan);
			}
		} catch (err) {
			handleError(err);
		}
	};

	return (
		<Fragment>
			{ActionComponent ? (
				<ActionComponent onClick={showModal} loading={loading} disabled={disabled} />
			) : (
				<Button type="primary" onClick={showModal} disabled={disabled}>
					Update Payment Method
				</Button>
			)}
			<Modal title={mainTitle} open={isShowingModal} footer={null} onCancel={cancelHandler}>
				<Wrapper>
					<form>
						<label>
							Card number
							<CardNumberElement autocomplete="cc-number" options={options} />
						</label>
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<label style={{ marginRight: 15, flex: 1 }}>
								Expiration date
								<CardExpiryElement autocomplete="cc-exp" options={options} />
							</label>
							<label style={{ flex: 1 }}>
								CVC
								<CardCvcElement options={options} />
							</label>
						</div>

						{error && (
							<>
								<Alert type="error" showIcon message={error.message} />
								<br />
							</>
						)}
						<div style={{ display: 'flex', flexDirection: 'row', marginTop: 10 }}>
							<Button
								type="primary"
								block
								onClick={handleSubmit}
								htmlType="button"
								disabled={!stripe || isLoading}
								loading={isLoading}
								size="small"
								style={{ borderRadius: 2, height: 43, marginRight: 15 }}
							>
								{buttonTitle}
							</Button>
							<Button
								danger
								block
								onClick={cancelHandler}
								htmlType="button"
								size="small"
								style={{ borderRadius: 2, height: 43 }}
							>
								Cancel
							</Button>
						</div>
						<div style={{ textAlign: 'center', fontSize: 12, marginTop: 15 }}>
							<i>Powered by Stripe</i>
						</div>
					</form>
				</Wrapper>
			</Modal>
		</Fragment>
	);
};

StripeForm.defaultProps = {
	actionType: 'Update-Details',
	mainTitle: 'Update Payment Details',
	buttonTitle: 'Update',
	ActionComponent: undefined,
	handleToken: undefined,
	loading: false,
	plan: null,
	disabled: false,
};

StripeForm.propTypes = {
	mainTitle: PropTypes.string,
	buttonTitle: PropTypes.string,
	actionType: PropTypes.string,
	ActionComponent: PropTypes.func,
	handleToken: PropTypes.func,
	loading: PropTypes.bool,
	plan: PropTypes.string,
	disabled: PropTypes.bool,
};

export default WithStripe(StripeForm);
