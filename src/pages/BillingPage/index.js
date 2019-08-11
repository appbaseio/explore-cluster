import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import { Card, Row } from 'antd';
import { connect } from 'react-redux';
import Container from '../../components/Container';
import BannerHeader from '../../components/Banner/Header';
import PricingTable from '../../components/PricingTable';
import Grid from '../../components/CreateCredentials/Grid';
import Flex from '../../batteries/components/shared/Flex';
import { getAppPlanByName } from '../../batteries/modules/selectors';

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

const Billing = ({
 plan, isOnTrial, planValidity, nodeCount,
}) => (
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

Billing.defaultProps = {
	nodeCount: undefined,
};

Billing.propTypes = {
	plan: PropTypes.string.isRequired,
	planValidity: PropTypes.number.isRequired,
	isOnTrial: PropTypes.bool.isRequired,
	nodeCount: PropTypes.number,
};

const mapStateToProps = (state) => {
	const appPlan = getAppPlanByName(state);
	return {
		plan: get(appPlan, 'tier') === 'arc-basic' ? 'Basic' : 'Free',
		planValidity: get(appPlan, 'tier_validity'),
		nodeCount: get(appPlan, 'node_count'),
		isOnTrial: get(appPlan, 'trial'),
	};
};

export default connect(mapStateToProps)(Billing);
