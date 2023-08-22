/* eslint-disable camelcase */
/* eslint-disable no-bitwise */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Col, Row, Layout, Alert, Spin, message } from 'antd';
import { css } from 'emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import moment from 'moment';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import { getAppAnalyticsSummary, setFilterValue } from '../../batteries/modules/actions';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { isValidPlan } from '../../batteries/utils';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { allowedTiers } from '../../utils/prop-types';
import { compareVersion } from '../../utils';
import { aIInsightsBannerDetails } from './utils';
import Container from '../../components/Container';
import { dateRanges, getAIInsights } from '../../batteries/components/analytics/utils';
import Filter from '../../batteries/components/analytics/components/Filter';
import { ALLOWED_SLS } from '../../constants';
import SummaryCard from '../../batteries/components/analytics/components/Summary/SummaryCard';
import SearchVolumeChart from '../../batteries/components/shared/Chart/SearchVolume';
import { getAppAnalyticsSummaryByName } from '../../batteries/modules/selectors';
import SessionDetailsTable from './components/SessionDetailsTable';

const insightsContainer = css`
	margin-top: 2rem;
	min-height: 50vh;
	padding: 50px;
	margin-bottom: 70px;
	background: white;
	.field-wrapper {
		&:first-child {
			width: 50%;
			min-width: 150px;
		}
		height: 32px;

		align-items: center;
		flex-wrap: nowrap;

		& > div:first-child {
			flex: 54%;
			& > div > span {
				white-space: nowrap;
			}
		}
	}

	.charts-container {
		flex-wrap: wrap;
		gap: 4rem;
		margin-top: 2rem;
		position: relative;

		h1 {
			font-weight: 600 !important;
		}

		.chart-placeholder {
			position: relative;

			span {
				position: absolute;
				z-index: 2;
				height: 100%;
				width: 100%;
				font-size: 20px;
				backdrop-filter: blur(2px);
				display: flex;
				align-items: center;
				justify-content: center;
				text-align: center;
			}
		}

		.charts-placeholder {
			position: absolute;
			height: 100%;
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			backdrop-filter: blur(1px);
			z-index: 3;
			span {
				font-size: 3rem;
				color: black;
				text-align: center;
				position: relative;
				top: -64px;
			}
		}
	}
`;

const cardContainer = css`
	padding: 10px;
`;
const filterId = 'a_i__insights_page';
const { Header } = Layout;

const allowedDateRanges = ['This week', 'Last Week', 'Last day', 'Last 7 days', 'Last 30 days'];

const finalDateRangesObject = {};
allowedDateRanges.forEach((rangeLabel) => {
	finalDateRangesObject[rangeLabel] = dateRanges[rangeLabel];
});

const Pipelines = (props) => {
	const {
		featureAI,
		tier,
		appVersion,
		filters,
		selectFilterValue,
		backendImage,
		fetchAppAnalyticsSummary,
		totalSearches,
		isSummaryLoading,
	} = props;
	const bannerDetails = aIInsightsBannerDetails;
	const [analyticsData, setAnalyticsData] = useState(null);

	const {
		total_invocations,
		total_sessions,
		useful = [],
		session_histogram = [],
	} = analyticsData ?? {};
	const [loadingState, setLoadingState] = useState(true);

	const getQueryParams = useCallback(() => {
		const paramObject = {};
		let dateRange;
		if (!filters) {
			dateRange = [dateRanges['Last 30 days'].from, dateRanges['Last 30 days'].to];
		} else {
			dateRange = [filters.from, filters.to];
		}
		if (Array.isArray(dateRange) && dateRange.length === 2) {
			paramObject.from_timestamp = moment.unix(new Date(dateRange[0])).format('X');
			paramObject.to_timestamp = moment.unix(new Date(dateRange[1])).format('X');
		}

		return paramObject;
	}, [filters]);

	const fetchAIInsights = async () => {
		try {
			setLoadingState(true);
			const data = await getAIInsights(getQueryParams());
			setAnalyticsData(data);
		} catch (error) {
			message.error('There was an error fetching the AI Insights!');
			throw error;
		} finally {
			setLoadingState(false);
		}
	};

	useEffect(() => {
		if (isValidPlan(tier, featureAI)) {
			// fetch insights
			fetchAIInsights();
			// fetch summary
			fetchAppAnalyticsSummary();
		}
		selectFilterValue(filterId, 'from', dateRanges['Last 30 days'].from);
		selectFilterValue(filterId, 'to', dateRanges['Last 30 days'].to);
	}, []);

	useEffect(() => {
		if (filters && filters.from && filters.to) {
			// do something
			// fetch insights
			fetchAIInsights();
			// fetch summary
			fetchAppAnalyticsSummary();
		}
	}, [filters]);

	if (!ALLOWED_SLS.includes(backendImage) && compareVersion(appVersion, '8.12.0') === -1)
		return (
			<React.Fragment>
				<Banner {...bannerDetails} onClick={() => window.open(bannerDetails.href)} />

				<div
					style={{
						display: 'flex',
						height: '100%',
						width: '100%',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Alert
						type="warning"
						message="Upgrade reactivesearch.io to v8.12.0 or above for using the ReactiveSearch AI insights feature"
						showIcon
						style={{ marginBottom: 10, height: 'max-content' }}
					/>
				</div>
			</React.Fragment>
		);

	if (!isValidPlan(tier, featureAI)) {
		return (
			<React.Fragment>
				<Banner {...bannerDetails} onClick={() => window.open(bannerDetails.href)} />
				<Overlay
					style={{
						maxWidth: '70%',
					}}
					src="https://i.imgur.com/pHi3P8T.png"
					alt="ReactiveSearch AI Insights"
				/>
			</React.Fragment>
		);
	}

	return (
		<ErrorToaster>
			<Header style={{ background: 'white', height: 'auto' }}>
				<div
					style={{
						padding: '25px 0px',
						margin: '0 auto',
					}}
				>
					<Row type="flex" justify="space-between" align="middle" gutter={16}>
						<Col lg={18}>
							<h2>Insights for ReactiveSearch AI</h2>
							<Row>
								<Col lg={18}>
									<p>Track analytics for AI.</p>
								</Col>
							</Row>
						</Col>
						<Col
							lg={6}
							css={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Button
								style={{ marginTop: 10 }}
								type="primary"
								ghost
								size="large"
								rel="noopener noreferrer"
								onClick={() => window.open(bannerDetails.href)}
								icon={<InfoCircleOutlined />}
							>
								Read Docs
							</Button>
						</Col>
					</Row>
				</div>
			</Header>
			<Container css={insightsContainer}>
				<Filter
					hideCustomEvents
					hideInsightsButton
					filterId={filterId}
					dateFilterProps={{
						dateRanges: finalDateRangesObject,
					}}
				/>

				<Spin spinning={loadingState || isSummaryLoading} size="large">
					<Row gutter={8} className={cardContainer}>
						<Col sm={24} xs={24} xl={6}>
							<SummaryCard
								style={{
									borderTop: '2px solid #000',
									height: '100%',
								}}
								title="Total Searches"
								label={totalSearches}
								value={totalSearches}
								showComparisonStats={false}
							/>
						</Col>{' '}
						<Col sm={24} xs={24} xl={6}>
							<SummaryCard
								style={{
									borderTop: '2px solid #000',
									height: '100%',
									marginBottom: '0',
								}}
								title="Total Invocations"
								label={total_invocations ?? '-'}
								value={total_invocations ?? '-'}
								showComparisonStats={false}
								toolTipMessage="Total times an AI Answer is invoked across all searches"
							/>
						</Col>{' '}
						<Col xl={12} md={24} sm={24} xs={24}>
							<Row gutter={8}>
								<Col span={24}>
									<SummaryCard
										title="Total Sessions"
										style={{
											borderTop: '2px solid #eb2f96',
											background: '#fff0f6',
										}}
										label={total_sessions ?? '-'}
										value={total_sessions ?? '-'}
										showComparisonStats={false}
										hidePrevStats
									/>
								</Col>
								<Col sm={24} xs={24} xl={12}>
									<SummaryCard
										title="Useful"
										style={{
											background: '#fff0f6',
											height: '100%',
											marginBottom: '0',
										}}
										label={
											(useful ?? []).find((i) => i.key_as_string === 'true')
												?.count ?? '-'
										}
										showComparisonStats={false}
										value={
											(useful ?? []).find((i) => i.key_as_string === 'true')
												?.count ?? '-'
										}
										comparisonValue={false}
										hidePrevStats
										toolTipMessage="% of sessions marked as useful: eval(Useful*100/Total Sessions)"
									/>
								</Col>
								<Col sm={24} xs={24} xl={12}>
									<SummaryCard
										title="Not Useful"
										style={{
											background: '#fff0f6',
											height: '100%',
											marginBottom: '0',
										}}
										label={
											(useful ?? []).find((i) => i.key_as_string === 'false')
												?.count ?? '-'
										}
										showComparisonStats={false}
										value={
											(useful ?? []).find((i) => i.key_as_string === 'false')
												?.count ?? '-'
										}
										comparisonValue={false}
										hidePrevStats
										toolTipMessage="% of sessions marked as not useful: eval(Not Useful*100/Total Sessions)"
									/>
								</Col>
							</Row>
						</Col>
					</Row>
					<SearchVolumeChart
						height={300}
						data={session_histogram}
						title="Daily AI Sessions"
					/>
					<SessionDetailsTable filters={filters} />
				</Spin>
			</Container>
		</ErrorToaster>
	);
};

Pipelines.propTypes = {
	featureAI: PropTypes.bool,
	tier: allowedTiers,
	appVersion: PropTypes.string,
	history: PropTypes.object,
	filters: PropTypes.object,
	selectFilterValue: PropTypes.func.isRequired,
	backendImage: PropTypes.string.isRequired,
	fetchAppAnalyticsSummary: PropTypes.func.isRequired,
	totalSearches: PropTypes.number.isRequired,
	isSummaryLoading: PropTypes.bool.isRequired,
};

Pipelines.defaultProps = {
	tier: undefined,
	featureAI: false,
	appVersion: undefined,
	history: {},
	filters: null,
};

const mapStateToProps = (state) => {
	const appSummary = getAppAnalyticsSummaryByName(state);

	return {
		totalSearches: get(appSummary, 'summary.total_searches', 0),
		tier: get(state, '$getAppPlan.results.tier'),
		featureAI: get(state, '$getAppPlan.results.feature_openai', false),
		appVersion: get(state, '$getAppPlan.results.version'),
		filters: get(state, `$getSelectedFilters.${filterId}`),
		backendImage: get(state, '$getAppPlan.results.image_type') ?? '',
		isSummaryLoading: get(state, '$getAppAnalyticsSummary.isFetching'),
	};
};

const mapDispatchToProps = (dispatch) => ({
	selectFilterValue: (filterIdParam, filterKey, filterValue) =>
		dispatch(setFilterValue(filterIdParam, filterKey, filterValue)),
	fetchAppAnalyticsSummary: (appName) => dispatch(getAppAnalyticsSummary(appName, filterId)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(Pipelines));
