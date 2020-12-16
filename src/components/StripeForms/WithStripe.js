import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_KEY } from '../../constants';

const stripePromise = loadStripe(STRIPE_KEY.LIVE);
// const stripePromise = loadStripe(STRIPE_KEY.TEST); // comment for production

const WithStripe = (Component) => {
	return (props) => {
		return (
			<Elements stripe={stripePromise}>
				<Component {...props} />
			</Elements>
		);
	};
};
export default WithStripe;
