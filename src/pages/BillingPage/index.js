import React, { Component } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import styled, { css } from 'react-emotion';
import {
	Card,
	Row,
	Collapse,
	message as antMessage,
	Button,
	Input,
	Modal,
	notification,
} from 'antd';
import { connect } from 'react-redux';
import StripeForm from '../../components/StripeForms/StripeForm';
import BannerHeader from '../../components/Banner/Header';
import Grid from '../../components/CreateCredentials/Grid';
import GlobalLoader from '../../batteries/components/shared/Loader/Spinner';
import Flex from '../../batteries/components/shared/Flex';
import { getAppPlanByName } from '../../batteries/modules/selectors';
import { getAppPlan, deleteAppSubscription } from '../../batteries/modules/actions';
import Loader from '../../batteries/components/shared/Loader';
import { displayErrors } from '../../utils/helper';
import ClusterPricingTable from '../../components/PricingTable/ClusterPricingTable';
import { PRICE_BY_PLANS, EFFECTIVE_PRICE_BY_PLANS } from '../../batteries/utils';
import { getAuthHeaders } from '../../batteries/utils/mappings';
import { getURL } from '../../constants/config';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';
import BillingFrame from '../../components/PricingTable/BillingFrame';
import Unsubscribe from '../../components/PricingTable/Unsubscribe';

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

	constructor(props) {
		super(props);
		this.startTime = moment();
		this.state = {
			isShowingUnsubscribeArcModal: false,
			otp: '',
			showOtpModal: false,
			message: '',
			resending: false,
		};
	}

	async componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Billing',
			category: 'Billing',
			label: 'visit',
			value: null,
		});
		const { isAppPlanFetched, fetchAppPlan, errors, isError } = this.props;
		// if there are already errors with plan api, don't try to fetch it again
		// otherwise there is sideEffect with redux being updated and infinite call being made
		// errors[0] is undefined.
		if (!isAppPlanFetched && !errors[0] && !Object.keys(isError)) {
			fetchAppPlan();
		}
	}

	componentDidUpdate(prevProps) {
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors, true);
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Billing',
			label: 'billing-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	get billingView() {
		const { isHostedArc, isClusterBilling } = this.props;
		if (isClusterBilling) {
			return (
				<Card bodyStyle={{ padding: '20px 50px' }}>
					<ClusterPricingTable />
					<p style={{ paddingTop: '20px' }}>
						Read more about the pricing plans over{' '}
						<a
							href="https://reactivesearch.io/pricing/"
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
				<BillingFrame
					id="softr-525dc68b-6f97-436e-ba83-11c9ad9ca059-pricing2"
					url="https://www.reactivesearch.io/embed/pages/525dc68b-6f97-436e-ba83-11c9ad9ca059/blocks/pricing2"
				/>
			);
		}
		// Self hosted Arc
		return (
			<BillingFrame
				id="softr-bddcd2a5-c2a3-427e-b637-bafe6a71e328-pricing2"
				url="https://www.reactivesearch.io/embed/pages/bddcd2a5-c2a3-427e-b637-bafe6a71e328/blocks/pricing2"
			/>
		);
	}

	get isOtpValid() {
		const { otp } = this.state;
		return otp && otp.length === 6;
	}

	cancelConfirmBox = () => {
		this.setState({
			isShowingUnsubscribeArcModal: false,
		});
	};

	onShowUnsubscribeArcModal = () => {
		this.setState((currentState) => ({
			isShowingUnsubscribeArcModal: !currentState.isShowingUnsubscribeArcModal,
		}));
	};

	openChatWindow = () => {
		window.Intercom('show');
	};

	closeOtpModal = () => {
		this.setState({
			showOtpModal: false,
			otp: '',
		});
	};

	deleteSubscription = () => {
		const { deleteSubscription } = this.props;
		deleteSubscription().then((action) => {
			const message = get(action, 'payload.message');
			if (message) {
				this.cancelConfirmBox();
				this.setState({
					showOtpModal: true,
					message,
				});
			}
		});
	};

	deleteFinalSubscription = () => {
		const { otp } = this.state;
		const { deleteSubscription, fetchAppPlan } = this.props;
		deleteSubscription({
			otp: String(otp),
		}).then((action) => {
			const payload = get(action, 'payload');
			if (payload) {
				this.closeOtpModal();
				const message = get(action, 'payload.message');
				if (message) {
					notification.success({
						title: 'Unsubscribed successfully.',
						message,
					});
				}
				fetchAppPlan();
			}
		});
	};

	resendCode = () => {
		const { deleteSubscription } = this.props;
		this.setState({
			resending: true,
		});
		deleteSubscription().then((action) => {
			this.setState({
				resending: false,
			});
			const message = get(action, 'payload.message');
			if (message) {
				this.setState({
					otp: '',
				});
				notification.success({
					title: 'Activation code sent successfully',
					message,
				});
			}
		});
	};

	updatePaymentDetails = async (token) => {
		const { credentials } = this.props;
		try {
			let response = await fetch(`${getURL()}/arc/payment`, {
				method: 'PUT',
				headers: {
					...getAuthHeaders(credentials),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					token,
				}),
			});
			response = await response.text();
			response = JSON.parse(response);
			antMessage.success(response.message);
		} catch (err) {
			antMessage.error(err.message);
		}
	};

	render() {
		// prettier-ignore
		const {
			plan,
			isOnTrial,
			planValidity,
			nodeCount,
			isLoading,
			subscriptionID,
			isPaid,
			isHostedArc,
			isClusterBilling,
			isFetchingPlan,
			isSubmitting
		} = this.props;

		const { showOtpModal, otp, message, resending, isShowingUnsubscribeArcModal } = this.state;

		if (isFetchingPlan) {
			return <GlobalLoader />;
		}
		if (isLoading) {
			return <Loader show message="Updating Payment Method... Please wait!" />;
		}

		const isSelfHostedArc = !isHostedArc && !isClusterBilling;
		const isOSS = plan === 'Free';

		return (
			<React.Fragment>
				<Modal
					title="Cancel Subscription"
					visible={showOtpModal}
					onCancel={this.closeOtpModal}
					footer={[
						<Button key="back1" onClick={this.closeOtpModal}>
							Cancel
						</Button>,
						<Button
							loading={resending}
							key="resend"
							type="primary"
							onClick={this.resendCode}
						>
							Resend Code
						</Button>,
						<Button
							loading={!resending && isSubmitting}
							key="submit1"
							type="danger"
							onClick={this.deleteFinalSubscription}
							disabled={!this.isOtpValid}
						>
							Unsubscribe
						</Button>,
					]}
				>
					{message && <p>{message}</p>}
					<div style={{ margin: '20px 0px' }}>
						<Flex>
							<Input
								addonBefore="Enter Activation code"
								name="otp"
								value={otp}
								autoFocus
								onChange={(e) => {
									this.setState({
										otp: e.target.value,
									});
								}}
								style={{
									width: '300px',
								}}
							/>
						</Flex>
					</div>
				</Modal>
				{isShowingUnsubscribeArcModal && (
					<Unsubscribe
						deleteSubscription={this.deleteSubscription}
						loading={isSubmitting}
						onCancel={this.cancelConfirmBox}
					/>
				)}
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
									label={<h3 className={heading}>Plan</h3>}
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
										label={<h3 className={heading}>Valid Up To</h3>}
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
										label={
											<h3 className={heading}>Total Elasticsearch Nodes</h3>
										}
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
										label={<h3 className={heading}>Effective Monthly Price</h3>}
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
							{!isOSS ? (
								<StripeForm handleToken={this.updatePaymentDetails} />
							) : (
								<p>
									You are using OSS version of{' '}
									<a
										href="https://www.appbase.io/pricing"
										target="_blank"
										rel="noopener noreferrer"
									>
										Reactivesearch.io{' '}
									</a>
									consider upgrading to paid version to access all the features.
								</p>
							)}
							{isOnTrial && (
								<p>
									Your plan will change to <b>Basic</b> at the end of the trial
									duration.
								</p>
							)}
						</Row>
					}
				/>
				{this.billingView}
				{subscriptionID && isPaid && !isOSS && (isHostedArc || isClusterBilling) && (
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
							Need a trial extension?{' '}
							<StyledLink onClick={this.openChatWindow}>Chat with us</StyledLink>
						</p>
					</Card>
				)}
				{isPaid && isSelfHostedArc && !isOnTrial && (
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
	isError: {},
};

Billing.propTypes = {
	isSubmitting: PropTypes.bool.isRequired,
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
	isLoading: PropTypes.bool.isRequired,
	errors: PropTypes.array.isRequired,
	credentials: PropTypes.string.isRequired,
	deleteSubscription: PropTypes.func.isRequired,
	isError: PropTypes.object,
};

const mapStateToProps = (state) => {
	const appPlan = getAppPlanByName(state);
	const { username, password } = get(state, 'user.data') || {};
	return {
		isSubmitting: get(state, '$deleteAppSubscription.isFetching'),
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
		isError: get(state, '$getAppPlan.error', {}),
		isLoading: get(state, '$updateAppPaymentMethod.isFetching'),
		errors: [
			get(state, '$updateAppPaymentMethod.error'),
			get(state, '$deleteAppSubscription.error'),
		],
		credentials: username && password ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	deleteSubscription: (payload) => dispatch(deleteAppSubscription(payload)),
	fetchAppPlan: () => dispatch(getAppPlan()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Billing);
