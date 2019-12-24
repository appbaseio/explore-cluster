import React, { Component } from 'react';
import styled, { css } from 'react-emotion';
import { Check } from 'react-feather';
import { connect } from 'react-redux';
import {
 Tooltip, Modal, Button, Input, notification,
} from 'antd';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import Loader from '../../batteries/components/shared/Loader';
import NewPricingCard from './NewPricingCard';
import theme from './theme';
import { media, hexToRgb } from '../../utils/media';
import { displayErrors } from '../../utils/helper';
import {
	createAppSubscription,
	deleteAppSubscription,
	getAppPlan,
} from '../../batteries/modules/actions';
import { getAppPlanByName } from '../../batteries/modules/selectors';
import Flex from '../../batteries/components/shared/Flex';
import Unsubscribe from './Unsubscribe';
import { STRIPE_KEY } from '../../constants';
import { ARC_PLANS, PRICE_BY_PLANS } from '../../batteries/utils';
import PaymentButton from './PaymentButton';

const CheckList = ({ list }) => list.map(item => (
		<li key={item}>
			<Check css={{ marginRight: '6px', fontWeight: 'strong' }} width="15" height="15" />{' '}
			{item}
		</li>
	));

const hideOnLarge = css`
	${media.ipadPro(css`
		display: none;
	`)};
	width: 80%;
	margin: 50px auto;
	user-select: none;
`;

const showOnLarge = css`
	display: none;
	${media.ipadPro(css`
		display: flex;
	`)};
	user-select: none;
`;

const Title = styled('div')`
	font-size: 20px;
	font-weight: bold;
	line-height: 27px;
	text-align: center;
	margin-bottom: 25px;
`;

const Price = styled('div')`
	height: 54px;
	font-family: 'Open Sans';
	font-size: 36px;
	line-height: 26px;
	text-align: center;
	margin: 0 auto 20px auto;
	> small {
		font-family: 'Open Sans';
		font-size: 12px;
		font-weight: 600;
		line-height: 22px;
		text-align: center;
		padding-left: 4rem;
	}
`;

const Table = styled('table')`
	text-align: center;
	border-collapse: separate;
	border-spacing: 16px 0px;

	> thead > tr {
		&:nth-child(1) {
			> td {
				padding-top: 30px;
				vertical-align: top;
			}
		}
	}
	> thead > tr > td,
	> tbody > tr > td {
		width: 205px;
		border: 1.5px solid #f4f4f4;
		border-bottom: 0;
		padding: 11px 2px;
		font-size: 18px;
		font-weight: 600;
		line-height: 22px;
		text-align: center;

		&:nth-child(1) {
			min-width: 240px;
			border-color: transparent;
			text-align: left;
			font-size: 20px;
			font-weight: 600;
			line-height: 27px;
			> span {
				padding-bottom: 0px;
				border-bottom-style: dashed;
				border-bottom-width: 3px;
				a {
					text-decoration: none;
					color: inherit;
				}
			}
		}

		&:nth-child(3) {
			border-color: ${theme.badge.blue};
			background: ${theme.badge.blue};
			color: #ffffff;
		}
		&:nth-child(4) {
			border-color: ${theme.badge.darkBlue};
			background: ${theme.badge.darkBlue};
			color: #ffffff;
		}
		&:nth-child(5) {
			border-color: ${theme.badge.red};
			background: ${theme.badge.red};
			color: #ffffff;
		}
	}
	> tbody > tr {
		text-align: left;
		&:hover {
			td {
				&:nth-child(1) {
					border-color: ${hexToRgb('#ECECEC', 0.21)};
					background: ${hexToRgb('#ECECEC', 0.21)};
				}
				&:nth-child(2) {
					border-color: ${hexToRgb('#ECECEC', 0.21)};
					background: ${hexToRgb('#ECECEC', 0.21)};
				}
				&:nth-child(3) {
					border-color: ${hexToRgb(theme.badge.blue, 0.79)};
					background: ${hexToRgb(theme.badge.blue, 0.79)};
				}
				&:nth-child(4) {
					border-color: ${hexToRgb(theme.badge.darkBlue, 0.79)};
					background: ${hexToRgb(theme.badge.darkBlue, 0.79)};
				}
				&:nth-child(5) {
					border-color: ${hexToRgb(theme.badge.red, 0.79)};
					background: ${hexToRgb(theme.badge.red, 0.79)};
				}
			}
		}
		> td {
			border-top: 0;
		}

		> td:nth-child(1) {
			border-top: 1.5px;
		}
		&:last-child {
			> td {
				&:nth-child(2) {
					border-bottom: 1.5px #f4f4f4 solid;
				}
			}
		}
	}
`;

const Caption = styled('div')`
	color: ${hexToRgb('#232e44', 0.6)};
	font-size: 12px;
	font-weight: 600;
	line-height: 17px;
	text-align: center;
	text-decoration: none !important;
`;

const ListCaption = styled('div')`
	margin-top: 13px;
	color: ${hexToRgb('#FFFFFF', 0.8)};
	font-size: 0.875rem;
	font-weight: 600;
	line-height: 17px;
	text-align: left;
	text-decoration: none !important;
	text-transform: uppercase;
	margin-left: 3px;
`;

const HeadingTr = css`
	height: 100px;
	&:hover {
		td {
			&:nth-child(1) {
				border-color: ${hexToRgb('#FFFFFF', 1)} !important;
				background: ${hexToRgb('#FFFFFF', 1)} !important;
			}
			&:nth-child(2) {
				border-color: ${hexToRgb('#f4f4f4', 1)} !important;
				background: ${hexToRgb('#FFFFFF', 1)} !important;
			}
			&:nth-child(3) {
				border-color: ${hexToRgb(theme.badge.blue, 1)} !important;
				background: ${hexToRgb(theme.badge.blue, 1)} !important;
			}
			&:nth-child(4) {
				border-color: ${hexToRgb(theme.badge.darkBlue, 1)} !important;
				background: ${hexToRgb(theme.badge.darkBlue, 1)} !important;
			}
			&:nth-child(5) {
				border-color: ${hexToRgb(theme.badge.red, 1)} !important;
				background: ${hexToRgb(theme.badge.red, 1)} !important;
			}
		}
	}
	td {
		color: ${hexToRgb('#232e44', 0.5)};
		font-size: 16px !important;
		font-weight: 600 !important;
		line-height: 28px !important;
		text-transform: uppercase;
		text-decoration: none !important;
		padding-bottom: 20px !important;
		> small {
			display: block;
			clear: both;
			color: #232e44;
			font-size: 12px;
			line-height: 17px;
			text-transform: none;
			font-weight: 600;
			a {
				color: inherit;
			}
		}
	}
`;

class HostedArcBilling extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showConfirmBox: false,
			otp: '',
			showOtpModal: false,
			message: '',
			resending: false,
		};
		// live key
		this.stripeKey = STRIPE_KEY.LIVE;
	}

	componentDidUpdate(prevProps) {
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors, true);
	}

	get isOtpValid() {
		const { otp } = this.state;
		return otp && otp.length === 6;
	}

	handleToken = (token, plan) => {
		const { createSubscription, fetchAppPlan, subscriptionID } = this.props;
		const isTesting = false; // SET true to test with test stripe keys
		if (subscriptionID) {
			// Update plan
			createSubscription(null, plan, isTesting).then((response) => {
				if (response && response.payload) {
					fetchAppPlan();
				}
			});
		} else {
			// Create subscription
			createSubscription(token, plan, isTesting).then((response) => {
				if (response && response.payload) {
					fetchAppPlan();
				}
			});
		}
	};

	closeOtpModal = () => {
		this.setState({
			showOtpModal: false,
			otp: '',
		});
	};

	openOtpModal = () => {
		this.setState({
			showOtpModal: true,
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
					title: 'OTP sent successfully',
					message,
				});
			}
		});
	};

	showConfirmBox = () => {
		this.setState({
			showConfirmBox: true,
		});
	};

	cancelConfirmBox = () => {
		this.setState({
			showConfirmBox: false,
		});
	};

	getPlan = value => `$${value}`;

	render() {
		const {
			//  growth, active,
			showConfirmBox,
			showOtpModal,
			message,
			resending,
			otp,
		} = this.state;
		const {
isArcBasic, isArcStandard, isSubmitting, isLoading, isArcEnterprise, subscriptionID,
} = this.props;
		if (isLoading) {
			return <Loader show message="Updating Plan... Please wait!" />;
		}
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
								addonBefore="Enter OTP"
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
				{showConfirmBox && (
					<Unsubscribe
						deleteSubscription={this.deleteSubscription}
						loading={isSubmitting}
						onCancel={this.cancelConfirmBox}
					/>
				)}
				<Table className={hideOnLarge}>
					<thead>
						<tr colSpan="1">
							<td>
								<Tooltip title="hey bro" />
							</td>
							<td>
								<Title>BASIC PLAN</Title>
								<Price>
									{this.getPlan(PRICE_BY_PLANS[ARC_PLANS.HOSTED_ARC_BASIC])}
									<br />
									<small style={{ fontWeight: 700 }}>/month</small>
								</Price>
								<Caption>Works with 1 ElasticSearch node</Caption>
							</td>
							<td>
								<Title>STANDARD PLAN</Title>
								<Price>
									{this.getPlan(PRICE_BY_PLANS[ARC_PLANS.HOSTED_ARC_STANDARD])}
									<br />
									<small style={{ fontWeight: 700 }}>/month</small>
								</Price>
								<Caption style={{ color: 'white' }}>
									Works with upto 3 ElasticSearch nodes.
								</Caption>
							</td>

							<td>
								<Title>ENTERPRISE PLAN</Title>
								<Price>
									{this.getPlan(PRICE_BY_PLANS[ARC_PLANS.HOSTED_ARC_ENTERPRISE])}
									<br />
									<small style={{ fontWeight: 700 }}>/month</small>
								</Price>
								<Caption style={{ color: 'white' }}>
									Works with upto 10 ElasticSearch nodes.
								</Caption>
							</td>
						</tr>
					</thead>
					<tbody>
						<tr className={HeadingTr}>
							<td>Security</td>
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Encrypt and Serve all search data over HTTPS."
								>
									TLS Security
								</Tooltip>
							</td>
							<td>
								<Check />
							</td>
							<td>
								<Check />
							</td>
							<td>
								<Check />
							</td>
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Create and Manage Users. Set Admin, categories, ACLs, operations, index access patterns."
								>
									User Management
								</Tooltip>
							</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Login selective access to Arc's dashboard management features."
								>
									Team Collaboration
								</Tooltip>
							</td>
							<td>Dashboard UI</td>
							<td>Dashboard UI</td>
							<td>Dashboard UI</td>
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Set Granular ACLs, time to live, IP based Rate Limits, Restrict by IP Sources and HTTP Referrers."
								>
									Permission Management
								</Tooltip>
							</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Authorize users via JWTs instead of exposing Basic Auth credentials, create user roles and map them to permissions."
								>
									Role Based Access Control
								</Tooltip>
							</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Create secure endpoints that can prevent script injection."
								>
									Search Templates
								</Tooltip>
							</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
						</tr>
						<tr className={HeadingTr}>
							<td>
								Actionable Analytics
								<small>
									Popular Searches, No Result Searches, Popular Filters and
									Results, Click and Conversion Tracking
								</small>
							</td>
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Categorized request logs of all incoming requests, and responses.Useful for auditing / debugging"
								>
									Request Logs
								</Tooltip>
							</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="An enhanced suggestions index auto-populated daily based on the analytics data."
								>
									Enhanced Suggestions
								</Tooltip>
							</td>
							<td>-</td>
							<td>-</td>
							<td>-</td>
						</tr>
						<tr className={HeadingTr}>
							<td>Developer Experience</td>
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Edit Mappings (aka search schema) on the fly."
								>
									Editable Mappings
								</Tooltip>
							</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
						</tr>
						<tr>
							<td>
								<Tooltip placement="rightTop" title="Create and Manage synonyms.">
									Synonyms
								</Tooltip>
							</td>
							<td>Dashboard UI</td>
							<td>Dashboard UI</td>
							<td>Dashboard UI</td>
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Visually build and test search relevancy, and export code."
								>
									Search Preview
								</Tooltip>
							</td>
							<td>Dashboard UI</td>
							<td>Dashboard UI</td>
							<td>Dashboard UI</td>
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Import, Search, Create and Edit Data visually."
								>
									Data Browser
								</Tooltip>
							</td>
							<td>Dashboard UI</td>
							<td>Dashboard UI</td>
							<td>Dashboard UI</td>
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Promote Results, Hide Results based on incoming search queries."
								>
									Query Rules
								</Tooltip>
							</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
							<td>REST API + Dashboard UI</td>
						</tr>
						<tr className={HeadingTr}>
							<td>
								Support and Guidance
								<small>Get premium support and business SLAs</small>
							</td>
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>
								<Tooltip
									placement="rightTop"
									title="Get dedicated onsite support with 1-day SLAs."
								>
									Premium Support
								</Tooltip>
							</td>
							<td>Can be added</td>
							<td>Can be added</td>
							<td>Included</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td />
							<td>
								<PaymentButton
									name="Arc Basic Plan"
									plan={ARC_PLANS.HOSTED_ARC_BASIC}
									disabled={isArcBasic}
									isCurrentPlan={isArcBasic}
									handleToken={this.handleToken}
									subscriptionID={subscriptionID}
								/>
							</td>
							<td>
								<PaymentButton
									name="Arc Standard Plan"
									plan={ARC_PLANS.HOSTED_ARC_STANDARD}
									disabled={isArcStandard}
									isCurrentPlan={isArcStandard}
									handleToken={this.handleToken}
									subscriptionID={subscriptionID}
									btnProps={{
										color: '#FFFFFF',
										backgroundColor: theme.badge.blue,
									}}
								/>
							</td>
							<td>
								<PaymentButton
									name="Arc Enterprise Plan"
									plan={ARC_PLANS.HOSTED_ARC_ENTERPRISE}
									disabled={isArcEnterprise}
									isCurrentPlan={isArcEnterprise}
									handleToken={this.handleToken}
									subscriptionID={subscriptionID}
									btnProps={{
										color: '#FFFFFF',
										backgroundColor: theme.badge.darkBlue,
									}}
								/>
							</td>
						</tr>
					</tfoot>
				</Table>
				<div
					className={showOnLarge}
					css={{
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
						maxWidth: '95%',
						marginRight: 'auto',
						marginLeft: 'auto',
					}}
				>
					<NewPricingCard
						css={{ color: theme.colors.accentText }}
						name="Basic"
						isCurrentPlan={isArcBasic}
						buttonText={isArcBasic ? 'Current Plan' : undefined}
						price={this.getPlan(PRICE_BY_PLANS[ARC_PLANS.HOSTED_ARC_BASIC])}
						stripeName="Arc basic plan"
						plan={ARC_PLANS.HOSTED_ARC_BASIC}
						amount={PRICE_BY_PLANS[ARC_PLANS.HOSTED_ARC_BASIC] * 100}
						token={token => this.handleToken(token, ARC_PLANS.HOSTED_ARC_BASIC)}
						stripeKey={this.stripeKey}
						pricingList={[]}
						subscriptionID={subscriptionID}
					>
						<ListCaption>Security</ListCaption>
						<CheckList
							list={[
								'TLS Security',
								'User Management',
								'Team Collaboration',
								'Pemissions Management',
								'Role Based Access Control',
								'Search Templates',
							]}
						/>
						<ListCaption>Actionable Analytics</ListCaption>
						<CheckList list={['Request Logs', 'Enhanced Suggestions']} />
						<ListCaption>Developer Experience</ListCaption>
						<CheckList
							list={[
								'Editable Mappings',
								'Search Preview',
								'Synonyms',
								'Query Rules',
								'Data Browser',
							]}
						/>
						<ListCaption>Support and Guidance</ListCaption>
						<CheckList list={['Premium support can be added']} />
					</NewPricingCard>
					<NewPricingCard
						css={{ backgroundColor: theme.badge.blue }}
						name="Standard"
						subscriptionID={subscriptionID}
						plan={ARC_PLANS.HOSTED_ARC_STANDARD}
						isCurrentPlan={isArcStandard}
						price={this.getPlan(PRICE_BY_PLANS[ARC_PLANS.HOSTED_ARC_STANDARD])}
						stripeName="Appbase.io Standard Plan"
						amount={PRICE_BY_PLANS[ARC_PLANS.HOSTED_ARC_STANDARD] * 100}
						token={token => this.handleToken(token, ARC_PLANS.HOSTED_ARC_STANDARD)}
						stripeKey={this.stripeKey}
						linkColor="inherit"
						pricingList={[]}
						buttonText={isArcStandard ? 'Unsubscribe' : undefined}
						onClickButton={isArcStandard ? this.showConfirmBox : undefined}
					>
						<ListCaption>Security</ListCaption>
						<CheckList
							list={[
								'TLS Security',
								'User Management',
								'Team Collaboration',
								'Pemissions Management',
								'Role Based Access Control',
								'Search Templates',
							]}
						/>
						<ListCaption>Actionable Analytics</ListCaption>
						<CheckList list={['Request Logs', 'Enhanced Suggestions']} />
						<ListCaption>Developer Experience</ListCaption>
						<CheckList
							list={[
								'Editable Mappings',
								'Search Preview',
								'Synonyms',
								'Query Rules',
								'Data Browser',
							]}
						/>
						<ListCaption>Support and Guidance</ListCaption>
						<CheckList list={['Premium support can be added']} />
					</NewPricingCard>
					<NewPricingCard
						css={{ backgroundColor: theme.badge.darkBlue }}
						name="Enterprise"
						subscriptionID={subscriptionID}
						plan={ARC_PLANS.HOSTED_ARC_ENTERPRISE}
						isCurrentPlan={isArcEnterprise}
						price={this.getPlan(PRICE_BY_PLANS[ARC_PLANS.HOSTED_ARC_ENTERPRISE])}
						stripeName="Arc enterprise plan"
						amount={PRICE_BY_PLANS[ARC_PLANS.HOSTED_ARC_ENTERPRISE] * 100}
						token={token => this.handleToken(token, ARC_PLANS.HOSTED_ARC_ENTERPRISE)}
						stripeKey={this.stripeKey}
						linkColor="inherit"
						pricingList={[]}
						buttonText={isArcEnterprise ? 'Unsubscribe' : undefined}
						onClickButton={isArcEnterprise ? this.showConfirmBox : undefined}
					>
						<ListCaption>Security</ListCaption>
						<CheckList
							list={[
								'TLS Security',
								'User Management',
								'Team Collaboration',
								'Pemissions Management',
								'Role Based Access Control',
								'Search Templates',
							]}
						/>
						<ListCaption>Actionable Analytics</ListCaption>
						<CheckList list={['Request Logs', 'Enhanced Suggestions']} />
						<ListCaption>Developer Experience</ListCaption>
						<CheckList
							list={[
								'Editable Mappings',
								'Search Preview',
								'Synonyms',
								'Query Rules',
								'Data Browser',
							]}
						/>
						<ListCaption>Support and Guidance</ListCaption>
						<CheckList list={['Premium support Included']} />
					</NewPricingCard>
				</div>
			</React.Fragment>
		);
	}
}

HostedArcBilling.defaultProps = {
	isArcBasic: false,
	isArcStandard: false,
	isArcEnterprise: false,
	subscriptionID: '',
};

HostedArcBilling.propTypes = {
	createSubscription: PropTypes.func.isRequired,
	deleteSubscription: PropTypes.func.isRequired,
	fetchAppPlan: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	isSubmitting: PropTypes.bool.isRequired,
	isArcBasic: PropTypes.bool,
	isArcStandard: PropTypes.bool,
	isArcEnterprise: PropTypes.bool,
	errors: PropTypes.array.isRequired,
	subscriptionID: PropTypes.string,
};
const mapStateToProps = (state) => {
	const appPlan = getAppPlanByName(state);
	return {
		isSubmitting: get(state, '$deleteAppSubscription.isFetching'),
		isLoading: get(state, '$createAppSubscription.isFetching'),
		isFreePlan: !get(appPlan, 'isPaid') || get(appPlan, 'trial', false),
		isArcBasic: get(appPlan, 'isArcBasic') && !get(appPlan, 'trial'),
		isArcStandard: get(appPlan, 'isArcStandard') && !get(appPlan, 'trial'),
		isArcEnterprise: get(appPlan, 'isArcEnterprise') && !get(appPlan, 'trial'),
		subscriptionID: get(appPlan, 'subscription_id'),
		errors: [
			get(state, '$createAppSubscription.error'),
			get(state, '$deleteAppSubscription.error'),
		],
	};
};

const mapDispatchToProps = dispatch => ({
	createSubscription: (plan, stripeToken, test) => dispatch(createAppSubscription(plan, stripeToken, test)),
	deleteSubscription: payload => dispatch(deleteAppSubscription(payload)),
	fetchAppPlan: () => dispatch(getAppPlan()),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(HostedArcBilling);
