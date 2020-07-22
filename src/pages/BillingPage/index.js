import React, { Component } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import styled, { css } from 'react-emotion';
import { Card, Row, Collapse } from 'antd';
import { connect } from 'react-redux';
import Stripe from 'react-stripe-checkout';
import Container from '../../components/Container';
import BannerHeader from '../../components/Banner/Header';
import PricingTable from '../../components/PricingTable';
import Grid from '../../components/CreateCredentials/Grid';
import GlobalLoader from '../../batteries/components/shared/Loader/Spinner';
import Flex from '../../batteries/components/shared/Flex';
import { getAppPlanByName } from '../../batteries/modules/selectors';
import { updateAppPaymentMethod, getAppPlan } from '../../batteries/modules/actions';
import Loader from '../../batteries/components/shared/Loader';
import { displayErrors } from '../../utils/helper';
import { STRIPE_KEY } from '../../constants';
import HostedArcBilling from '../../components/PricingTable/HostedArcBilling';
import ClusterPricingTable from '../../components/PricingTable/ClusterPricingTable';
import { PRICE_BY_PLANS, EFFECTIVE_PRICE_BY_PLANS } from '../../batteries/utils';
import { getESVersion } from '../../batteries/utils/mappings';
import { getVersion } from '../../constants/config';

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const StyledLink = styled.a`
	color: dodgerblue;
	cursor: pointer;
`;

const heading = css`
	font-weight: 600;
	font-size: 14px;
	min-width: 100px;
	letter-spacing: 0.01rem;
	color: #888;
`;

const { Panel } = Collapse;

class Billing extends Component {
	static defaultProps = {
		nodeCount: undefined,
	};

	state = {
		isShowingUnsubscribeArcModal: false,
	};

	async componentDidMount() {
		const { isAppPlanFetched, fetchAppPlan, credentials } = this.props;
		const esVersion = getVersion() || (await getESVersion(null, credentials));
		if (!isAppPlanFetched && esVersion.split('.')[0] > 5) {
			fetchAppPlan();
		}
	}

	componentDidUpdate(prevProps) {
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors, true);
	}

	get billingView() {
		const { isHostedArc, isClusterBilling } = this.props;
		const { isShowingUnsubscribeArcModal } = this.state;
		if (isClusterBilling) {
			return (
				<Card bodyStyle={{ padding: '20px 50px' }}>
					<ClusterPricingTable />
					<p style={{ paddingTop: '20px' }}>
						Read more about the pricing plans over{' '}
						<a
							href="https://appbase.io/pricing/"
							target="_blank"
							rel="noopener noreferrer"
							style={{
								color: 'dodgerblue',
								textDecoration: 'none',
							}}
						>
							here
						</a>
						.
					</p>
					<p>
						<StyledLink onClick={this.openChatWindow}>Chat with us </StyledLink>to
						upgrade your plan
					</p>
				</Card>
			);
		}
		if (isHostedArc) {
			return (
				<Container>
					<Card bodyStyle={{ padding: 0 }}>
						<HostedArcBilling />
					</Card>
				</Container>
			);
		}
		return (
			<Container>
				<Card bodyStyle={{ padding: 0 }}>
					<PricingTable
						showUnsubscribeModal={isShowingUnsubscribeArcModal}
						onToggleUnsubscribeModal={this.onShowUnsubscribeArcModal}
					/>
				</Card>
			</Container>
		);
	}

	onShowUnsubscribeArcModal = () => {
		this.setState((currentState) => ({
			isShowingUnsubscribeArcModal: !currentState.isShowingUnsubscribeArcModal,
		}));
	};

	openChatWindow = () => {
		window.Intercom('show');
	};

	render() {
		// prettier-ignore
		const {
			plan,
			isOnTrial,
			planValidity,
			nodeCount,
			updatePayment,
			isLoading,
			subscriptionID,
			isPaid,
			isHostedArc,
			isClusterBilling,
			isFetchingPlan,
		} = this.props;
		if (isFetchingPlan) {
			return <GlobalLoader />;
		}
		if (isLoading) {
			return <Loader show message="Updating Payment Method... Please wait!" />;
		}
		const isSelfHostedArc = !isHostedArc && !isClusterBilling;
		return (
			<React.Fragment>
				<BannerHeader
					title={plan !== 'Basic' ? 'Upgrade Your Plan Now' : 'Your Current Plan Info'}
					description=""
					component={
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

							{planValidity ? (
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
										label={<h3 css={heading}>Total Elasticsearch Nodes</h3>}
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
										component={
											isClusterBilling
												? `$${numberWithCommas(
														nodeCount * PRICE_BY_PLANS[plan],
												  )} (calculated at $${
														EFFECTIVE_PRICE_BY_PLANS[plan]
												  }/node hour)`
												: `$${numberWithCommas(
														PRICE_BY_PLANS[plan],
												  )} (calculated at $${
														EFFECTIVE_PRICE_BY_PLANS[plan]
												  }/hour)`
										}
									/>
								</Flex>
							) : null}
							<Stripe
								stripeKey={STRIPE_KEY.LIVE}
								panelLabel="Update Payment"
								token={updatePayment}
							>
								<StyledLink>Update Payment Method</StyledLink>
							</Stripe>
						</Row>
					}
				/>
				{this.billingView}
				{subscriptionID && isPaid && (isHostedArc || isClusterBilling) && (
					<Card
						style={{
							borderBottom: 0,
							borderRight: 0,
							borderLeft: 0,
						}}
					>
						<Collapse
							bordered={false}
							style={{
								marginLeft: 12,
							}}
						>
							<Panel
								style={{
									borderBottom: 0,
								}}
								showArrow={false}
								header={
									<span style={{ color: 'tomato' }}>Looking To Unsubscribe?</span>
								}
								key="1"
							>
								<p>
									You can delete the cluster from the{' '}
									<a href="https://dashboard.appbase.io/clusters" target="blank">
										cluster detail view
									</a>{' '}
									to unsubscribe from your current plan. You will lose access to
									appbase.io APIs and dashboard views after doing this.
								</p>
							</Panel>
						</Collapse>
					</Card>
				)}
				{!subscriptionID && !isPaid && !isOnTrial && (
					<Card bodyStyle={{ padding: '20px 50px' }}>
						<p style={{ marginBottom: '0' }}>
							Need a trial extended?{' '}
							<StyledLink onClick={this.openChatWindow}>Chat with us</StyledLink>
						</p>
					</Card>
				)}
				{isPaid && isSelfHostedArc && (
					<Card
						style={{
							borderBottom: 0,
							borderRight: 0,
							borderLeft: 0,
						}}
					>
						<Collapse
							bordered={false}
							style={{
								marginLeft: 12,
							}}
						>
							<Panel
								style={{
									borderBottom: 0,
								}}
								showArrow={false}
								header={
									<span style={{ color: 'tomato' }}>Looking To Unsubscribe?</span>
								}
								key="1"
							>
								<p>
									You can unsubscribe by clicking{' '}
									<StyledLink onClick={this.onShowUnsubscribeArcModal}>
										here
									</StyledLink>
								</p>
							</Panel>
						</Collapse>
					</Card>
				)}
			</React.Fragment>
		);
	}
}

Billing.defaultProps = {
	planValidity: undefined,
	subscriptionID: undefined,
	isOnTrial: false,
	isHostedArc: false,
	isAppPlanFetched: false,
	isPaid: false,
	isFetchingPlan: false,
};

Billing.propTypes = {
	plan: PropTypes.string.isRequired,
	planValidity: PropTypes.number,
	fetchAppPlan: PropTypes.func.isRequired,
	isPaid: PropTypes.bool,
	subscriptionID: PropTypes.string,
	isOnTrial: PropTypes.bool,
	isFetchingPlan: PropTypes.bool,
	isHostedArc: PropTypes.bool,
	nodeCount: PropTypes.number,
	isAppPlanFetched: PropTypes.bool,
	isClusterBilling: PropTypes.bool.isRequired,
	updatePayment: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	errors: PropTypes.array.isRequired,
	credentials: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
	const appPlan = getAppPlanByName(state);
	const { username, password } = get(state, 'user.data') || {};
	return {
		isFetchingPlan: get(state, '$getAppPlan.isFetching'),
		isAppPlanFetched: !!getAppPlanByName(state),
		plan: get(appPlan, 'tier') || 'Free',
		planValidity: get(appPlan, 'tier_validity'),
		nodeCount: get(appPlan, 'node_count'),
		isOnTrial: get(appPlan, 'trial'),
		isPaid: get(appPlan, 'isPaid', false),
		isHostedArc: get(appPlan, 'isHostedArc', false),
		isClusterBilling: get(appPlan, 'isClusterBilling', false),
		subscriptionID: get(appPlan, 'subscription_id'),
		isLoading: get(state, '$updateAppPaymentMethod.isFetching'),
		errors: [get(state, '$updateAppPaymentMethod.error')],
		credentials: username && password ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchAppPlan: () => dispatch(getAppPlan()),
	updatePayment: (token) => dispatch(updateAppPaymentMethod(token, 'APP')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Billing);
