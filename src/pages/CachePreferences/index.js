import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { css } from 'emotion';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { isValidPlan } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import VersionController from '../../batteries/components/shared/VersionController';
import Main from './Main';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const main = css`
	.actionBtn {
		position: absolute;
		right: 50px;
	}
`;

const bannerDetails = {
	title: 'Build ⚡️ fast search for your end users with reactivesearch.io cache',
	description: "Tailor reactivesearch.io's caching preferences based on your search use-case",
	buttonText: 'Read Docs',
	icon: 'info-circle',
	href: 'https://docs.reactivesearch.io/docs/speed/cache-management/',
};

class CachePreferences extends React.Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Cache Preferences',
			category: 'Speed',
			label: 'visit',
			value: null,
		});
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Cache Preferences',
			label: 'cache-preferences-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	render() {
		const { tier, featureCache } = this.props;
		if (!isValidPlan(tier, featureCache)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<Overlay
						style={{
							maxWidth: '90%',
						}}
						lockSectionStyle={{
							marginTop: '20%',
						}}
						src="https://i.imgur.com/gZLnGBl.png"
						alt="cache preferences"
					/>
				</React.Fragment>
			);
		}
		return (
			<React.Fragment>
				<Banner {...bannerDetails} />
				<Container className={main}>
					<VersionController version="7.42.0">
						<Main />
					</VersionController>
				</Container>
			</React.Fragment>
		);
	}
}

CachePreferences.propTypes = {
	tier: PropTypes.string.isRequired,
	featureCache: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	featureCache: get(state, '$getAppPlan.results.feature_cache', false),
});

export default connect(mapStateToProps, null)(CachePreferences);
