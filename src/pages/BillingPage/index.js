import React, { Component } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import styled, { css } from 'react-emotion';
import { Card, Row } from 'antd';
import { connect } from 'react-redux';
import Stripe from 'react-stripe-checkout';
import Container from '../../components/Container';
import BannerHeader from '../../components/Banner/Header';
import PricingTable from '../../components/PricingTable';
import Grid from '../../components/CreateCredentials/Grid';
import Flex from '../../batteries/components/shared/Flex';
import { getAppPlanByName } from '../../batteries/modules/selectors';
import { updateAppPaymentMethod } from '../../batteries/modules/actions';
import Loader from '../../batteries/components/shared/Loader';
import { displayErrors } from '../../utils/helper';
import { STRIPE_KEY } from '../../constants';

const TextLink = styled('span')`
	color: rgb(111, 99, 245);
	font-weight: 600;
	text-decoration: underline;
	cursor: pointer;
`;

const heading = css`
	font-weight: 600;
	font-size: 14px;
	min-width: 100px;
	letter-spacing: 0.01rem;
	color: #888;
`;

const uppercase = css`
	text-transform: uppercase;
`;

class Billing extends Component {
	static defaultProps = {
		nodeCount: undefined,
	};

	componentDidUpdate(prevProps) {
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors, true);
	}

	render() {
		// prettier-ignore
		const {
			plan,
			isOnTrial,
			planValidity,
			nodeCount,
			updatePayment,
			isLoading,
		} = this.props;
		if (isLoading) {
			return <Loader show message="Updating Payment Method... Please wait!" />;
		}
		return (
			<React.Fragment>
				<BannerHeader
					title={plan !== 'Basic' ? 'Upgrade Your Plan Now' : 'Your Current Plan Info'}
					description=""
					component={(
						<Row>
							<Flex alignItems="center">
								<Grid
									style={{
										width: '540px',
										margin: '0px',
									}}
									gridRatio={0.4}
									label={<h3 css={heading}>Plan</h3>}
									component={isOnTrial ? `${plan} (Trial Mode)` : plan}
								/>
							</Flex>

							{planValidity && (
								<Flex alignItems="center">
									<Grid
										style={{
											width: '540px',
											margin: '0px',
											marginTop: '-35px',
										}}
										gridRatio={0.4}
										label={<h3 css={heading}>Valid Up To</h3>}
										component={new Date(planValidity * 1000).toDateString()}
									/>
								</Flex>
							)}
							{nodeCount ? (
								<Flex alignItems="center">
									<Grid
										style={{
											width: '540px',
											margin: '0px',
											marginTop: '-35px',
										}}
										gridRatio={0.4}
										label={<h3 css={heading}>Total ElasticSearch Nodes</h3>}
										component={nodeCount}
									/>
								</Flex>
							) : null}
							{nodeCount ? (
								<Flex alignItems="center">
									<Grid
										style={{
											width: '540px',
											margin: '0px',
											marginTop: '-35px',
										}}
										gridRatio={0.4}
										label={<h3 css={heading}>Effective Monthly Price</h3>}
										component={`$${eval(
											nodeCount * 49,
										)} (calculated at $0.07/node hour)`}
									/>
								</Flex>
							) : null}
							<Stripe
								stripeKey={STRIPE_KEY.TEST}
								panelLabel="Update Payment"
								token={updatePayment}
							>
								<TextLink>Update Payment Method</TextLink>
							</Stripe>
						</Row>
					)}
				/>
				<Container>
					<Card bodyStyle={{ padding: 0 }}>
						<PricingTable />
					</Card>
				</Container>
			</React.Fragment>
		);
	}
}

Billing.propTypes = {
	plan: PropTypes.string.isRequired,
	planValidity: PropTypes.number,
	isOnTrial: PropTypes.bool,
	nodeCount: PropTypes.number,
	updatePayment: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	errors: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => {
	const appPlan = getAppPlanByName(state);
	return {
		plan: get(appPlan, 'tier') === 'arc-basic' ? 'Basic' : 'Free',
		planValidity: get(appPlan, 'tier_validity'),
		nodeCount: get(appPlan, 'node_count'),
		isOnTrial: get(appPlan, 'trial'),
		isLoading: get(state, '$updateAppPaymentMethod.isFetching'),
		errors: [get(state, '$updateAppPaymentMethod.error')],
	};
};

const mapDispatchToProps = dispatch => ({
	updatePayment: token => dispatch(updateAppPaymentMethod(token, 'APP')),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps(),
)(Billing);
