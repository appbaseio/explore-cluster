/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, message, Popconfirm } from 'antd';
import Stripe from 'react-stripe-checkout';
import { connect } from 'react-redux';
import get from 'lodash/get';

import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { container } from '../ResultsPage/styles';
import { getSubscription, updateSubscription, deleteSubscription } from './api';
import { STRIPE_KEY } from '../../constants';
import InsightLink from './components/InsightLink';
import Loader from '../../components/Loader';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';

class ClusterInsights extends React.Component {
	state = {
		hasSubscribed: false,
		updatingSubscription: false,
		fetchingSubscription: false,
		insight_link: null,
		deletingSubscription: false,
	};

	componentDidMount() {
		this.fetchInsights();
	}

	toggleLoading = (key) => {
		this.setState((state) => ({
			[key]: !state[key],
		}));
	};

	fetchInsights = () => {
		const { credentials } = this.props;
		this.toggleLoading('fetchingSubscription');
		getSubscription(credentials)
			.then((res) => {
				this.setState({
					hasSubscribed: get(res, 'has_subscribed'),
					insight_link: get(res, 'insight_link'),
				});
				this.toggleLoading('fetchingSubscription');
			})
			.catch((e) => {
				message.error(e.message);
				this.toggleLoading('fetchingSubscription');
			});
	};

	handleToken = (token) => {
		this.toggleLoading('updatingSubscription');
		const { credentials } = this.props;
		updateSubscription({ token, credentials })
			.then((res) => {
				message.success(res.message);
				this.toggleLoading('updatingSubscription');
				this.fetchInsights();
			})
			.catch((e) => {
				message.error(e.message);
				this.toggleLoading('updatingSubscription');
			});
	};

	unsubscribe = () => {
		this.toggleLoading('deletingSubscription');
		const { credentials } = this.props;
		deleteSubscription(credentials)
			.then((res) => {
				message.success(res.message);
				this.toggleLoading('deletingSubscription');
				this.fetchInsights();
			})
			.catch((e) => {
				message.error(e.message);
				this.toggleLoading('deletingSubscription');
			});
	};

	render() {
		const {
			hasSubscribed,
			fetchingSubscription,
			updatingSubscription,
			insight_link,
			deletingSubscription,
		} = this.state;
		return (
			<React.Fragment>
				<Banner
					title="Curated Insights"
					description="Curated Insights are weekly search insights delievered by the appbase.io team."
					href="https://docs.appbase.io/docs/analytics/curated-insights/"
					showButton={false}
					renderButtons={() => (
						<React.Fragment>
							<Button
								size="large"
								target="_blank"
								href="https://docs.appbase.io/docs/analytics/curated-insights/"
								type="primary"
								ghost
							>
								Learn More
							</Button>

							{hasSubscribed ? (
								<Popconfirm
									title={
										<div>
											Are you sure you want to unsubscribe
											<br />
											from Curated Insights?
										</div>
									}
									onConfirm={this.unsubscribe}
									okText="Yes"
									cancelText="No"
									placement="bottom"
								>
									<Button
										type="danger"
										style={{ marginBottom: 10 }}
										size="large"
										loading={deletingSubscription}
										ghost
									>
										Unsubscribe
									</Button>
								</Popconfirm>
							) : (
								<Stripe
									name="Curated Insights"
									amount={50000}
									token={this.handleToken}
									stripeKey={STRIPE_KEY.LIVE}
								>
									<Button
										loading={fetchingSubscription || updatingSubscription}
										style={{ marginBottom: 10 }}
										size="large"
										type="primary"
										block
									>
										Subscribe Now
									</Button>
								</Stripe>
							)}
						</React.Fragment>
					)}
				/>
				{fetchingSubscription ? (
					<div className={container} style={{ minHeight: 600 }}>
						<Loader />
					</div>
				) : (
					<div className={container}>
						<ErrorToaster>
							<InsightLink
								hasSubscribed={hasSubscribed}
								insight_link={insight_link}
							/>
						</ErrorToaster>
					</div>
				)}
			</React.Fragment>
		);
	}
}

ClusterInsights.propTypes = {
	credentials: PropTypes.string.isRequired,
};

ClusterInsights.defaultProps = {};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: `${username}:${password}`,
	};
};

export default withErrorToaster(connect(mapStateToProps)(ClusterInsights));
