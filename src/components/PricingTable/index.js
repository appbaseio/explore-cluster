import React, { Component } from 'react';
import styled, { css } from 'react-emotion';
import { connect } from 'react-redux';
import { CheckOutlined } from '@ant-design/icons';
import { Tooltip, Modal, Button, Input, notification } from 'antd';
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
import PaymentButton, { styles as paymentButtonStyles } from './PaymentButton';

const CheckList = ({ list }) =>
	list.map((item) => (
		<li key={item}>
			<CheckOutlined
				css={{ marginRight: '6px', fontWeight: 'strong' }}
				width="15"
				height="15"
			/>{' '}
			{item}
		</li>
	));

const hideOnLarge = css`
	${media.ipadPro(css`
		display: none;
	`)};
	width: 90%;
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
		color: #232e44;
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

class PricingTable extends Component {
	constructor(props) {
		super(props);

		this.state = {
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
					title: 'Activation code sent successfully',
					message,
				});
			}
		});
	};

	cancelConfirmBox = () => {
		const { onToggleUnsubscribeModal } = this.props;
		onToggleUnsubscribeModal();
	};

	getPlan = (value) => `$${value}`;

	render() {
		const {
			//  growth, active,
			showOtpModal,
			message,
			resending,
			otp,
		} = this.state;
		const {
			isArcBasic,
			isArcStandard,
			isSubmitting,
			isLoading,
			isArcEnterprise,
			subscriptionID,
			showUnsubscribeModal,
			onToggleUnsubscribeModal,
			isOSS,
		} = this.props;
		if (isLoading) {
			return <Loader show message="Updating Plan... Please wait!" />;
		}
		return (
			<React.Fragment>
				<Modal
					title="Cancel Subscription"
					open={showOtpModal}
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
				{showUnsubscribeModal && (
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
									{this.getPlan(PRICE_BY_PLANS[ARC_PLANS.ARC_BASIC])}
									<br />
									<small style={{ fontWeight: 700 }}>/month</small>
								</Price>
								<Caption>Works with 1 Elasticsearch node</Caption>
							</td>
							<td>
								<Title>STANDARD PLAN</Title>
								<Price>
									{this.getPlan(PRICE_BY_PLANS[ARC_PLANS.ARC_STANDARD])}
									<br />
									<small style={{ fontWeight: 700 }}>/month</small>
								</Price>
								<Caption style={{ color: 'white' }}>
									Works with upto 3 Elasticsearch nodes.
								</Caption>
							</td>

							<td>
								<Title>ENTERPRISE PLAN</Title>
								<Price>
									{this.getPlan(PRICE_BY_PLANS[ARC_PLANS.ARC_ENTERPRISE])}
									<br />
									<small style={{ fontWeight: 700 }}>/month</small>
								</Price>
								<Caption style={{ color: 'white' }}>
									Works with upto 10 Elasticsearch nodes.
								</Caption>
							</td>
						</tr>
					</thead>
					<tbody>
						<tr className={HeadingTr}>
							<td>
								Developer Experience
								<small>Tools to enhance your Elasticsearch experience.</small>
							</td>
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>
								<span data-tip="GUI and CLI based import tools for CSV, JSON, Elasticsearch, SQL, MongoDB based data sources.">
									Data Import
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
								Up to 1 GB / import
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
								Up to 1 GB / import
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
								No limits
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Categorized API logs of all incoming requests and responses.Useful for auditing and debugging purposes.">
									API Logs
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
								Up to 10,000 logs
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
								Up to 10,000 logs
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
								Up to 1,000,000 logs
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Perform CRUD operations on your Elasticsearch data visually.">
									Data Browser
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅
								</span>
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Build and test search relevancy with no code. Export code.">
									Search Preview
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅
								</span>
							</td>
						</tr>
						<tr className={HeadingTr}>
							<td>
								Actionable Analytics
								<small>
									See search, clicks, conversions stats. Drill down. Get
									actionable insights.
								</small>
							</td>
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>
								<span data-tip="Search Analytics UIs show search analytics data: popular searches, no results searches, popular filters, popular results.">
									Search Analytics
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
								Up to 30 days
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
								Up to 30 days
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
								Up to 90 days
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Click Analytics UIs show click analytics data in addition to the search analytics data.">
									Click Analytics
								</span>
							</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
								Up to 30 days
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
								Up to 90 days
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="A popular suggestions index is populated daily based on what end users are searching for.">
									Popular Suggestions
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Actionable insights to improve search engagement and performance.">
									Search Insights
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Track any custom events important to you and filter by them across all APIs and via dashboard UIs.">
									Custom Events
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Access the search and click analytics data via REST APIs.">
									Analytics API
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr className={HeadingTr}>
							<td>
								Search Relevancy
								<small>
									Configure search relevancy via a control plane and APIs.
								</small>
							</td>
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>
								<span data-tip="Index your search data in over 39 languages, set stop words and stemming settings.">
									Language Settings
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Set and update search fields, weights, typo tolerance settings and more via dashboard in realtime.">
									Search Settings
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Set and update global aggregation settings via dashboard in realtime.">
									Aggregation Settings
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Set and update global result settings via dashboard in realtime.">
									Result Settings
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Set or update shards and replica settings for your search indexes.">
									Index Settings
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Add/update/delete fields, use-case and data types within your search schema.">
									Schema
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Create and manage synonyms via dashboard. Have them reflected in search in realtime.">
									Synonyms
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Extend search relevancy with query rules tailored to your business use-case.">
									Query Rules
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Extend search behavior with user-defined functions.">
									Functions
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Perform search relevancy actions via REST APIs">
									Search Relevancy API
								</span>
							</td>
							<td>-</td>
							<td>-</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr className={HeadingTr}>
							<td>
								Access Control
								<small>
									Set fine-grained access control policies for your search.
								</small>
							</td>
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>
								<span data-tip="Encrypt and serve all requests over HTTPS.">
									TLS Security
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>

							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Create and manage dashboard access for your team via user management portal.">
									User Management
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Set granular ACLs, time to live, IP based rate limits, and restrict access by IP sources and HTTP Referers.">
									API Credentials
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>
						<tr>
							<td>
								<span data-tip="Integrate with identity providers via SSO. Authorize your users via JWTs instead of exposing Basic Auth credentials.">
									Role Based Access Control
								</span>
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
							<td>
								<span role="img" aria-label="check" style={{ marginRight: '3px' }}>
									✅{' '}
								</span>{' '}
							</td>
						</tr>

						<tr className={HeadingTr}>
							<td>
								Curated Insights
								<small>
									Get curated insights on your search engagement and performance
									from our team.
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
									title="Get dedicated onsite support with 1-day SLAs."
								>
									Curated Insights
								</Tooltip>
							</td>
							<td>Can be added</td>
							<td>Can be added</td>
							<td>Can be added</td>
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
								{!isOSS ? (
									<PaymentButton
										name="Appbase.io Basic Plan"
										plan={ARC_PLANS.ARC_BASIC}
										isCurrentPlan={isArcBasic}
										handleToken={this.handleToken}
										subscriptionID={subscriptionID}
										handleUnsubscribe={onToggleUnsubscribeModal}
									/>
								) : (
									<a
										href="https://www.appbase.io/pricing"
										target="_blank"
										rel="noopener noreferrer"
									>
										<Button
											css={paymentButtonStyles(
												theme.colors.accentText,
												theme.colors.accent,
											)}
										>
											Subscribe
										</Button>
									</a>
								)}
							</td>
							<td>
								{!isOSS ? (
									<PaymentButton
										name="Appbase.io Standard Plan"
										plan={ARC_PLANS.ARC_STANDARD}
										isCurrentPlan={isArcStandard}
										handleToken={this.handleToken}
										subscriptionID={subscriptionID}
										btnProps={{
											color: '#FFFFFF',
											backgroundColor: theme.badge.blue,
										}}
										handleUnsubscribe={onToggleUnsubscribeModal}
									/>
								) : (
									<a
										href="https://www.appbase.io/pricing"
										target="_blank"
										rel="noopener noreferrer"
									>
										<Button
											css={paymentButtonStyles('#FFFFFF', theme.badge.blue)}
										>
											Subscribe
										</Button>
									</a>
								)}
							</td>
							<td>
								{!isOSS ? (
									<PaymentButton
										name="Appbase.io Enterprise Plan"
										plan={ARC_PLANS.ARC_ENTERPRISE}
										isCurrentPlan={isArcEnterprise}
										handleToken={this.handleToken}
										subscriptionID={subscriptionID}
										btnProps={{
											color: '#FFFFFF',
											backgroundColor: theme.badge.darkBlue,
										}}
										handleUnsubscribe={onToggleUnsubscribeModal}
									/>
								) : (
									<a
										href="https://www.appbase.io/pricing"
										target="_blank"
										rel="noopener noreferrer"
									>
										<Button
											css={paymentButtonStyles(
												'#FFFFFF',
												theme.badge.darkBlue,
											)}
										>
											Subscribe
										</Button>
									</a>
								)}
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
						subscriptionID={subscriptionID}
						isCurrentPlan={isArcBasic}
						buttonText={isArcBasic ? 'Unsubscribe' : undefined}
						onClickButton={onToggleUnsubscribeModal}
						price={this.getPlan(PRICE_BY_PLANS[ARC_PLANS.ARC_BASIC])}
						stripeName="Appbase.io basic plan"
						plan={ARC_PLANS.ARC_BASIC}
						amount={PRICE_BY_PLANS[ARC_PLANS.ARC_BASIC] * 100}
						token={(token) => this.handleToken(token, ARC_PLANS.ARC_BASIC)}
						stripeKey={this.stripeKey}
						pricingList={[]}
					>
						<ListCaption style={{ color: theme.colors.footer }}>
							Developer Experience
						</ListCaption>
						<CheckList
							list={['Data Import', 'API Logs', 'Data Browser', 'Search Preview']}
						/>
						<ListCaption style={{ color: theme.colors.footer }}>
							Actionable Analytics
						</ListCaption>
						<CheckList list={['Search Analytics', 'Click Analytics']} />
						<ListCaption style={{ color: theme.colors.footer }}>
							Search Relevancy
						</ListCaption>
						<CheckList list={['Index Settings', 'Schema']} />
						<ListCaption style={{ color: theme.colors.footer }}>Security</ListCaption>
						<CheckList
							list={[
								'TLS Security',
								'User Management',
								'API Credentials',
								'Role Based Access Control',
							]}
						/>
						<ListCaption style={{ color: theme.colors.footer }}>
							Curated Insights
						</ListCaption>
						<CheckList list={['Curated insights can be added']} />
						<ListCaption style={{ color: theme.colors.footer }}>
							Support and Guidance
						</ListCaption>
						<CheckList list={['Premium support can be added']} />
					</NewPricingCard>
					<NewPricingCard
						css={{ backgroundColor: theme.badge.blue }}
						name="Standard"
						subscriptionID={subscriptionID}
						plan={ARC_PLANS.ARC_STANDARD}
						isCurrentPlan={isArcStandard}
						price={this.getPlan(PRICE_BY_PLANS[ARC_PLANS.ARC_STANDARD])}
						stripeName="Appbase.io Standard Plan"
						amount={PRICE_BY_PLANS[ARC_PLANS.ARC_STANDARD] * 100}
						token={(token) => this.handleToken(token, ARC_PLANS.ARC_STANDARD)}
						stripeKey={this.stripeKey}
						linkColor="inherit"
						pricingList={[]}
						buttonText={isArcStandard ? 'Unsubscribe' : undefined}
						onClickButton={onToggleUnsubscribeModal}
					>
						<ListCaption style={{ color: theme.colors.footer }}>
							Developer Experience
						</ListCaption>
						<CheckList
							list={['Data Import', 'API Logs', 'Data Browser', 'Search Preview']}
						/>
						<ListCaption style={{ color: theme.colors.footer }}>
							Actionable Analytics
						</ListCaption>
						<CheckList list={['Search Analytics', 'Click Analytics']} />
						<ListCaption style={{ color: theme.colors.footer }}>
							Search Relevancy
						</ListCaption>
						<CheckList list={['Index Settings', 'Schema']} />
						<ListCaption style={{ color: theme.colors.footer }}>Security</ListCaption>
						<CheckList
							list={[
								'TLS Security',
								'User Management',
								'API Credentials',
								'Role Based Access Control',
							]}
						/>
						<ListCaption style={{ color: theme.colors.footer }}>
							Curated Insights
						</ListCaption>
						<CheckList list={['Curated insights can be added']} />
						<ListCaption style={{ color: theme.colors.footer }}>
							Support and Guidance
						</ListCaption>
						<CheckList list={['Premium support can be added']} />
					</NewPricingCard>
					<NewPricingCard
						css={{ backgroundColor: theme.badge.darkBlue }}
						name="Enterprise"
						subscriptionID={subscriptionID}
						plan={ARC_PLANS.ARC_ENTERPRISE}
						isCurrentPlan={isArcEnterprise}
						price={this.getPlan(PRICE_BY_PLANS[ARC_PLANS.ARC_ENTERPRISE])}
						stripeName="Appbase.io enterprise plan"
						amount={PRICE_BY_PLANS[ARC_PLANS.ARC_ENTERPRISE] * 100}
						token={(token) => this.handleToken(token, ARC_PLANS.ARC_ENTERPRISE)}
						stripeKey={this.stripeKey}
						linkColor="inherit"
						pricingList={[]}
						buttonText={isArcEnterprise ? 'Unsubscribe' : undefined}
						onClickButton={onToggleUnsubscribeModal}
					>
						<ListCaption style={{ color: theme.colors.footer }}>
							Developer Experience
						</ListCaption>
						<CheckList
							list={['Data Import', 'API Logs', 'Data Browser', 'Search Preview']}
						/>
						<ListCaption style={{ color: theme.colors.footer }}>
							Actionable Analytics
						</ListCaption>
						<CheckList
							list={[
								'Search Analytics',
								'Click Analytics',
								'Popular Suggestions',
								'Search Insights',
								'Custom Events',
								'Analytics API',
							]}
						/>
						<ListCaption style={{ color: theme.colors.footer }}>
							Search Relevancy
						</ListCaption>
						<CheckList
							list={[
								'Language Settings',
								'Search Settings',
								'Aggregation Settings',
								'Result Settings',
								'Index Settings',
								'Schema',
								'Synonyms',
								'Query Rules',
								'Functions',
								'Search Relevancy API',
							]}
						/>
						<ListCaption style={{ color: theme.colors.footer }}>Security</ListCaption>
						<CheckList
							list={[
								'TLS Security',
								'User Management',
								'API Credentials',
								'Role Based Access Control',
							]}
						/>
						<ListCaption style={{ color: theme.colors.footer }}>
							Curated Insights
						</ListCaption>
						<CheckList list={['Curated insights can be added']} />
						<ListCaption style={{ color: theme.colors.footer }}>
							Support and Guidance
						</ListCaption>
						<CheckList list={['Premium support can be added']} />
					</NewPricingCard>
				</div>
			</React.Fragment>
		);
	}
}

PricingTable.defaultProps = {
	isArcBasic: false,
	isArcStandard: false,
	isArcEnterprise: false,
	subscriptionID: '',
	showUnsubscribeModal: false,
	isOSS: false,
};

PricingTable.propTypes = {
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
	onToggleUnsubscribeModal: PropTypes.func.isRequired,
	showUnsubscribeModal: PropTypes.bool,
	isOSS: PropTypes.bool,
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

const mapDispatchToProps = (dispatch) => ({
	createSubscription: (plan, stripeToken, test) =>
		dispatch(createAppSubscription(plan, stripeToken, test)),
	deleteSubscription: (payload) => dispatch(deleteAppSubscription(payload)),
	fetchAppPlan: () => dispatch(getAppPlan()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PricingTable);
