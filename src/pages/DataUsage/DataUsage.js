/* eslint-disable no-bitwise */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Col, Row, Alert, Spin, Layout } from 'antd';
import { css } from 'emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';

import { LineChart, XAxis, YAxis, Tooltip, Legend, Line, Label } from 'recharts';

import moment from 'moment';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import Loader from '../../components/Loader';

import ErrorToaster from '../../batteries/components/shared/ErrorToaster';

import Banner from '../../batteries/components/shared/UpgradePlan/Banner';

import { compareVersion } from '../../utils';
import { dataUsageBannerDetails } from './utils';
import Container from '../../components/Container';
import Flex from '../../batteries/components/shared/Flex';
import { getDataUsage } from '../../batteries/modules/actions/billing';
import { setFilterValue } from '../../batteries/modules/actions';
import { dateRanges } from '../../batteries/components/analytics/utils';
import Filter from '../../batteries/components/analytics/components/Filter';

const dataUsageContainer = css`
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
		justify-content: center;

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

	.fallback-alert {
		margin: auto;
		margin-top: 5rem;
	}
`;
const { Header } = Layout;
const filterId = 'data_usage_page';
const finalDateRangesObject = {};
const allowedDateRanges = [
	'Last 30 minutes',
	'This week',
	'Last Week',
	'Last day',
	'Last 7 days',
	'Last 30 days',
];
allowedDateRanges.forEach((rangeLabel) => {
	finalDateRangesObject[rangeLabel] = dateRanges[rangeLabel];
});
const DataUsage = (props) => {
	const { isLoading, dataUsage, fetchDataUsage, appVersion, selectFilterValue, filters } = props;
	const bannerDetails = dataUsageBannerDetails;

	const [loadingState, setLoadingState] = useState(true);

	const normalizeData = (rawDataArray) => {
		return rawDataArray.map((item) => {
			const dataItem = {};
			dataItem.dateFormatted = moment(item.timestamp).format('Do MMM');

			dataItem.usage = Number((item.usage / 1024).toFixed(2));
			return dataItem;
		});
	};

	const getQueryParams = useCallback(() => {
		const paramObject = {};
		let dateRange;
		if (!filters) {
			dateRange = [dateRanges['Last 30 days'].from, dateRanges['Last 30 days'].to];
		} else {
			dateRange = [filters.from, filters.to];
		}
		if (Array.isArray(dateRange) && dateRange.length === 2) {
			paramObject.from_timestamp = moment.unix(new Date(dateRange[0])).format('X') / 1000;
			paramObject.to_timestamp = moment.unix(new Date(dateRange[1])).format('X') / 1000;
		}

		return paramObject;
	}, [filters]);
	useEffect(() => {
		selectFilterValue(filterId, 'from', dateRanges['Last 30 days'].from);
		selectFilterValue(filterId, 'to', dateRanges['Last 30 days'].to);
	}, []);

	useEffect(() => {
		if (filters && filters.from && filters.to) {
			fetchDataUsage(getQueryParams());
		}
	}, [filters]);

	useEffect(() => {
		if (loadingState !== isLoading) {
			setLoadingState(isLoading);
		}
	}, [isLoading]);

	if (compareVersion(appVersion, '8.0.0') === -1)
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
						message="Upgrade reactivesearch.io to v8.0.0 or above for using the ReactiveSearch data usage feature"
						showIcon
						style={{ marginBottom: 10, height: 'max-content' }}
					/>
				</div>
			</React.Fragment>
		);

	if (isLoading) {
		return <Loader />;
	}

	const renderChart = () => {
		return (
			<Flex className="charts-container">
				<LineChart
					width={window.innerWidth - 400}
					height={window.innerHeight - 300}
					data={normalizeData(dataUsage)}
					margin={{
						top: 5,
						bottom: 5,
						right: 10,
					}}
				>
					<XAxis dataKey="dateFormatted" />
					<YAxis
						dataKey="usage"
						label={
							<Label
								style={{
									textAnchor: 'middle',
								}}
								angle={270}
								value="Usage (MB)"
							/>
						}
						dx={5}
					/>
					<Tooltip
						formatter={(value) => {
							return (
								<span
									style={{
										float: 'right',
										marginLeft: '5px',
									}}
								>
									{value} MB
								</span>
							);
						}}
					/>
					<Legend
						formatter={() => {
							return 'Data Usage';
						}}
						verticalAlign="top"
						align="right"
						margin={{ top: 5, right: 0, left: 'auto', bottom: 20 }}
					/>

					<Line type="monotone" dataKey="usage" stroke="#82ca9d" />
				</LineChart>
			</Flex>
		);
	};

	return (
		<ErrorToaster>
			<Header style={{ background: 'white', height: 'auto' }}>
				<div
					className={{
						padding: '25px 0px',
						margin: '0 auto',
					}}
				>
					<Row type="flex" justify="space-between" align="middle" gutter={16}>
						<Col lg={18}>
							<h2>Data Usage</h2>
							<Row>
								<Col lg={18}>
									<p>Track data usage for upto last 30 days</p>
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
			<Container css={dataUsageContainer}>
				<Filter
					hideCustomEvents
					hideInsightsButton
					filterId={filterId}
					dateFilterProps={{
						dateRanges: finalDateRangesObject,
					}}
				/>
				<Spin spinning={loadingState} size="large">
					{(dataUsage ?? []).length ? (
						renderChart()
					) : (
						<Alert
							className="fallback-alert"
							message="Data not available!"
							description="Looks like your data usage is NIL"
							showIcon
							type="warning"
						/>
					)}
				</Spin>
			</Container>
		</ErrorToaster>
	);
};

DataUsage.propTypes = {
	isLoading: PropTypes.bool,
	dataUsage: PropTypes.array,
	fetchDataUsage: PropTypes.func.isRequired,
	appVersion: PropTypes.string,
	history: PropTypes.object,
	filters: PropTypes.object,
	selectFilterValue: PropTypes.func.isRequired,
};

DataUsage.defaultProps = {
	isLoading: false,
	dataUsage: null,
	appVersion: undefined,
	history: {},
	filters: {},
};

const mapStateToProps = (state) => {
	const isLoading =
		get(state, '$getDataUsage.isFetching') || get(state, '$getAppPlan.isFetching');
	return {
		isLoading,
		dataUsage: get(state, '$getDataUsage.results'),
		appVersion: get(state, '$getAppPlan.results.version'),
		usageStats: get(state, '$getPipelinesUsageStats.results')?.pipelines ?? [],
		filters: get(state, `$getSelectedFilters.${filterId}`),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchDataUsage: (queryParams) => dispatch(getDataUsage(queryParams)),
	selectFilterValue: (filterIdParam, filterKey, filterValue) =>
		dispatch(setFilterValue(filterIdParam, filterKey, filterValue)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(DataUsage));
