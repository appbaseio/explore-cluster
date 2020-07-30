import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Container from '../../components/Container';
import Overlay from '../../components/Overlay';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import SearchPerformance from '../../batteries/components/analytics/components/SearchLatency';
import RequestLogs from '../../batteries/components/analytics/components/RequestLogs';
import { getUrlParams } from '../../batteries/utils/helpers';
import { getAppSearchLatencyByName } from '../../batteries/modules/selectors';
import VersionController from '../../batteries/components/shared/VersionController';

const bannerMessagesAnalytics = {
	free: {
		title: 'Unlock the ROI impact of your search',
		description:
			'Get a paid plan to see actionable analytics on search volume, popular searches, no results, track clicks and conversions.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	bootstrap: {
		title: 'Get search latency analytics with Growth plan',
		description:
			'By upgrading to the Growth plan, you can drill down into the performance of your search.',
		buttonText: 'Upgrade To Growth',
		href: 'billing',
	},
	growth: {
		title: 'Search Latency',
		description:
			'Understand the performance of your search. Learn how to make the most of search latency insights.',
		buttonText: 'Read Docs',
		href: 'https://docs.appbase.io/docs/analytics/Overview/#search-latency',
	},
};

const filterId = 'search_latency_page';

class SearchLatencyWrapper extends React.Component {
	constructor(props) {
		super(props);
		const urlParams = getUrlParams(window.location.search);
		this.state = {
			startLatency: get(urlParams, 'start_latency'),
			endLatency: get(urlParams, 'end_latency'),
		};
	}

	componentDidMount() {
		const urlParams = getUrlParams(window.location.search);
		if (get(urlParams, 'redirect_to') === 'logs') {
			this.scrollToLogs(true);
		}
	}

	componentDidUpdate(prevProps) {
		const { filters } = this.props;
		if (filters !== prevProps.filters) {
			// eslint-disable-next-line
			this.setState({
				startLatency: undefined,
				endLatency: undefined,
			});
		}
	}

	scrollToLogs = (isEnd = false) => {
		window.scrollTo({
			top: isEnd ? document.body.scrollHeight : 600,
			behavior: 'smooth',
		});
	};

	handleClickBar = (payload) => {
		const startLatency = payload.key;
		const endLatency = startLatency + 10;
		this.setState(
			{
				startLatency,
				endLatency,
			},
			this.scrollToLogs,
		);
		// Just Update the URL
		const newURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}?start_latency=${startLatency}&end_latency=${endLatency}&redirect_to=logs`;

		if (window.history && window.history.pushState) {
			window.history.pushState({ path: newURL }, '', newURL);
		}
	};

	render() {
		const { plan, isGrowth, searchLatency, filters } = this.props;
		const filteredLatency = searchLatency.filter((l) => l.count > 0);
		const { startLatency, endLatency } = this.state;
		let minLatency = 0;
		let maxLatency = 0;
		if (filteredLatency && filteredLatency.length) {
			minLatency = get(filteredLatency, '[0].key');
			maxLatency = get(filteredLatency[filteredLatency.length - 1], 'key');
		}
		const title = (
			<span>
				Search Request Details for{' '}
				<b>
					{startLatency !== undefined ? startLatency : minLatency}
					ms
				</b>{' '}
				-{' '}
				<b>
					{endLatency !== undefined ? endLatency : maxLatency}
					ms
				</b>{' '}
				interval
			</span>
		);
		return (
			<React.Fragment>
				{isGrowth ? (
					<React.Fragment>
						{bannerMessagesAnalytics[plan] && (
							<Banner {...bannerMessagesAnalytics[plan]} />
						)}
						<Container>
							<SearchPerformance
								style={{ height: 506 }}
								filterId={filterId}
								onClickBar={this.handleClickBar}
							/>
							<div
								style={{
									marginTop: 20,
									position: 'relative',
								}}
							>
								<VersionController title={title} version="7.30.0">
									<RequestLogs
										title={title}
										hideRefreshButton
										displayFilter={false}
										displaySearchLogs
										startLatency={startLatency}
										endLatency={endLatency}
										startDate={get(filters, 'from')}
										endDate={get(filters, 'to')}
									/>
								</VersionController>
							</div>
						</Container>
					</React.Fragment>
				) : (
					<React.Fragment>
						<Banner {...bannerMessagesAnalytics[plan]} />
						<Overlay
							style={{
								maxWidth: '100%',
							}}
							lockSectionStyle={{
								marginTop: '15%',
							}}
							src="/static/images/analytics/SearchLatency.png"
							alt="search latency"
						/>
					</React.Fragment>
				)}
			</React.Fragment>
		);
	}
}
SearchLatencyWrapper.defaultProps = {
	filters: undefined,
};
SearchLatencyWrapper.propTypes = {
	plan: PropTypes.string.isRequired,
	isGrowth: PropTypes.bool.isRequired,
	searchLatency: PropTypes.array.isRequired,
	filters: PropTypes.object,
};

const mapStateToProps = (state) => ({
	plan: get(state, '$getAppPlan.results.plan'),
	isGrowth: get(state, '$getAppPlan.results.isPaid'),
	searchLatency: get(getAppSearchLatencyByName(state), 'latencies', []),
	filters: get(state, `$getSelectedFilters.${filterId}`),
});
export default connect(mapStateToProps)(SearchLatencyWrapper);
