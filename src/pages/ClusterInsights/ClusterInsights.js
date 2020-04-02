import React from 'react';
import { Button, Spin } from 'antd';
import Stripe from 'react-stripe-checkout';

import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { container } from '../ResultsPage/styles';
import { getSubscription, updateSubscription } from './api';

class ClusterInsights extends React.Component {
	state = {
		hasSubscribed: false,
		updatingSubscription: false,
		fetchingSubscription: false,
		insight_link: null,
	};

	componentDidMount() {
		this.toggleFetching();
		getSubscription()
			.then(res => {
				this.setState({
					...res,
				});
				this.toggleFetching();
			})
			.catch(e => {
				this.toggleFetching();
			});
	}

	toggleFetching = () => {
		this.setState(state => ({
			fetchingSubscription: !state.fetchingSubscription,
		}));
	};

	toggleUpdating = () => {
		this.setState(state => ({
			updatingSubscription: !state.updatingSubscription,
		}));
	};

	handleToken = token => {
		this.toggleUpdating();
		updateSubscription(token)
			.then(res => {
				this.setState({
					...res,
				});
				this.toggleUpdating();
			})
			.catch(e => {
				this.toggleUpdating();
			});
	};

	render() {
		const {
			hasSubscribed,
			fetchingSubscription,
			updatingSubscription,
			insight_link,
		} = this.state;
		return (
			<React.Fragment>
				<Banner
					title="Curated Insights"
					description="Curated Insights are weekly search insights delievered by the appbase.io team."
					showButton={false}
					renderButtons={() => (
						<React.Fragment>
							<Button
								size="large"
								target="_blank"
								href="https://docs.appbase.io"
								type="primary"
								ghost
							>
								Learn More
							</Button>

							<Stripe
								name="Curated Insights"
								amount={50000}
								token={this.handleToken}
								disabled={hasSubscribed}
								stripeKey="12345"
							>
								<Button
									loading={fetchingSubscription || updatingSubscription}
									disabled={hasSubscribed}
									style={{ marginBottom: 10 }}
									size="large"
									type="primary"
									block
								>
									{hasSubscribed ? 'Subscribed' : ' Subscribe Now'}
								</Button>
							</Stripe>
						</React.Fragment>
					)}
				/>
				{fetchingSubscription ? (
					<div style={{ textAlign: 'center', padding: 50 }}>
						<Spin size="large" />
					</div>
				) : (
					<div className={container}>
						{hasSubscribed && insight_link ? (
							<iframe
								src=""
								height="600px"
								width="100%"
								title="Curated Insights"
								frameBorder="0"
							/>
						) : (
							'Preview Image'
						)}
					</div>
				)}
			</React.Fragment>
		);
	}
}

export default ClusterInsights;
