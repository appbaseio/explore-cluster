/* eslint-disable no-bitwise */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Row, Layout, Alert, Select, Typography, Tooltip, Spin, Badge } from 'antd';
import { css } from 'emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { FieldControl, FieldGroup, FormBuilder, Validators } from 'react-reactive-form';
import { Legend, Line, LineChart, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';
import moment from 'moment';
import { orderBy } from 'lodash';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import Loader from '../../components/Loader';
import {
	getPipelines,
	getPipelinesUsageStats,
	getPipelineVersions,
	setFilterValue,
} from '../../batteries/modules/actions';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { isValidPlan } from '../../batteries/utils';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { allowedTiers } from '../../utils/prop-types';
import { compareVersion } from '../../utils';
import { pipelinesInsightsBannerDetails } from './utils';
import Container from '../../components/Container';
import Flex from '../../batteries/components/shared/Flex';
import Grid from '../../components/CreateCredentials/Grid';
import {
	dateRanges,
	getPipelinesAvgTimeTakenInsights,
	getPipelinesAvgTimeTakenPerVersion,
	getPipelinesErrorRateInsights,
	getPipelinesErrorRateInsightsPerVersion,
} from '../../batteries/components/analytics/utils';
import Filter from '../../batteries/components/analytics/components/Filter';

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
const badgeCss = css`
	p {
		line-height: 20px;
		font-size: 12px;
	}
`;

const chartsCss = css`
	svg.recharts-surface {
		overflow: visible;
	}
`;
const filterId = 'pipelines_insights_page';
const { Header } = Layout;

const allowedDateRanges = [
	'Last 30 minutes',
	'This week',
	'Last Week',
	'Last day',
	'Last 7 days',
	'Last 30 days',
];

const finalDateRangesObject = {};
allowedDateRanges.forEach((rangeLabel) => {
	finalDateRangesObject[rangeLabel] = dateRanges[rangeLabel];
});
// https://lowcode.life/generating-unique-contrasting-colors-in-javascript/
function getUniqueColor(n) {
	const rgb = [0, 0, 0];
	for (let i = 0; i < 24; i += 1) {
		rgb[i % 3] <<= 1;
		rgb[i % 3] |= n & 0x01;
		// eslint-disable-next-line no-param-reassign
		n >>= 1;
	}
	return `#${rgb.reduce((a, c) => (c > 0x0f ? c.toString(16) : `0${c.toString(16)}`) + a, '')}`;
}

const Pipelines = (props) => {
	const {
		isLoading,
		pipelines,
		fetchPipelines,
		tier,
		appVersion,
		featurePipelines,
		fetchPipelineVersions,
		usageStats,
		fetchUsageStats,
		filters,
		selectFilterValue,
	} = props;
	const bannerDetails = pipelinesInsightsBannerDetails;
	const [avgTimeInsights, setAvgTimeInsights] = useState([]);
	const [avgTimeInsightsPerVersion, setAvgTimeInsightsPerVersion] = useState([]);
	const [errorRateInsights, setErrorRateInsights] = useState([]);
	const [errorRateInsightsPerVersion, setErrorRateInsightsPerVersion] = useState([]);
	const [loadingState, setLoadingState] = useState(isLoading);
	const chartWrapperRef = useRef(null);
	const form = useRef(
		FormBuilder.group({
			pipeline: ['', Validators.required], // id of the selected pipeline
			version: ['', Validators.required],
		}),
	);

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

	const fetchAvgTimeInsights = (pipelineId) => {
		setLoadingState(true);
		getPipelinesAvgTimeTakenInsights(pipelineId, getQueryParams())
			.then((res) => {
				setAvgTimeInsights(
					res.map((item) => {
						const dataItem = {};
						dataItem.dateFormatted = moment(item.key).format('Do MMM');

						item.version_histogram.forEach((versionItem) => {
							dataItem[`v${versionItem.key}`] = Math.ceil(versionItem.value ?? 0);
						});
						return dataItem;
					}),
				);
			})
			.catch((e) => {
				// eslint-disable-next-line no-console
				console.log('e', e, e.stack);
				setAvgTimeInsights([]);
			})
			.finally(() => {
				setLoadingState(false);
			});
	};

	const fetchErrorInsights = (pipelineId) => {
		setLoadingState(true);
		getPipelinesErrorRateInsights(pipelineId, getQueryParams())
			.then((res) => {
				setErrorRateInsights(
					res.map((item) => {
						const dataItem = {};
						dataItem.dateFormatted = moment(item.key).format('Do MMM');

						item.version_histogram.forEach((versionItem) => {
							dataItem[`v${versionItem.key}`] = (versionItem.value ?? 0).toFixed(2);
						});
						return dataItem;
					}),
				);
			})
			.catch((e) => {
				// eslint-disable-next-line no-console
				console.log('e', e, e.stack);
				setErrorRateInsights([]);
			})
			.finally(() => {
				setLoadingState(false);
			});
	};

	const fetchAvgTimeInsightsForVersion = (pipelineId, versionId) => {
		setLoadingState(true);
		getPipelinesAvgTimeTakenPerVersion(pipelineId, versionId, getQueryParams())
			.then((res) => {
				setAvgTimeInsightsPerVersion(
					res.map((item) => {
						const dataItem = {};
						dataItem.dateFormatted = moment(item.key).format('Do MMM');

						item.stage_histogram.forEach((versionItem) => {
							dataItem[versionItem.key] = Math.ceil(versionItem.value || 0);
						});
						return dataItem;
					}),
				);
			})
			.catch((e) => {
				// eslint-disable-next-line no-console
				console.log('e', e, e.stack);
				setAvgTimeInsightsPerVersion([]);
			})
			.finally(() => {
				setLoadingState(false);
			});
	};

	const fetchErrorInsightsForVersion = (pipelineId, versionId) => {
		setLoadingState(true);
		getPipelinesErrorRateInsightsPerVersion(pipelineId, versionId, getQueryParams())
			.then((res) => {
				setErrorRateInsightsPerVersion(
					res.map((item) => {
						const dataItem = {};
						dataItem.dateFormatted = moment(item.key).format('Do MMM');

						item.stage_histogram.forEach((versionItem) => {
							dataItem[versionItem.key] = (versionItem.value || 0).toFixed(2);
						});
						return dataItem;
					}),
				);
			})
			.catch((e) => {
				// eslint-disable-next-line no-console
				console.log('e', e, e.stack);
				setErrorRateInsightsPerVersion([]);
			})
			.finally(() => {
				setLoadingState(false);
			});
	};

	const makePipelineRelatedCalls = () => {
		const pipelineId = form.current.get('pipeline').value;
		if (!pipelineId) return;
		// fetch versions for selected pipeline
		fetchPipelineVersions(pipelineId);

		// fetch avg time taken insights
		fetchAvgTimeInsights(pipelineId);

		// fetch error-rate insights
		fetchErrorInsights(pipelineId);
	};

	const makePipelineVersionRelatedCalls = () => {
		const pipelineId = form.current.get('pipeline').value;
		const versionId = form.current.get('version').value;
		if (!pipelineId || !versionId) return;
		// call version specific endpoint for time taken insights
		fetchAvgTimeInsightsForVersion(pipelineId, versionId);
		// call version specific endpoint for error rate
		fetchErrorInsightsForVersion(pipelineId, versionId);
	};
	useEffect(() => {
		if (isValidPlan(tier, featurePipelines)) {
			fetchPipelines();
			fetchUsageStats();
		}
		selectFilterValue(filterId, 'from', dateRanges['Last 30 days'].from);
		selectFilterValue(filterId, 'to', dateRanges['Last 30 days'].to);
		const pipelineListenerCb = (value) => {
			if (value) {
				// reset version form control
				form.current.get('version').reset();
				makePipelineRelatedCalls();
			}
		};

		form.current.get('pipeline').valueChanges.subscribe(pipelineListenerCb);

		const versionListenerCb = (value) => {
			if (value) {
				makePipelineVersionRelatedCalls();
			}
		};

		form.current.get('version').valueChanges.subscribe(versionListenerCb);

		return () => {
			form.current.get('pipeline').valueChanges.unsubscribe(pipelineListenerCb);
			form.current.get('version').valueChanges.unsubscribe(versionListenerCb);
		};
	}, []);

	useEffect(() => {
		if (filters && filters.from && filters.to) {
			makePipelineRelatedCalls();
			makePipelineVersionRelatedCalls();
		}
	}, [filters]);

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
						message="Upgrade reactivesearch.io to v8.0.0 or above for using the ReactiveSearch pipelines insights feature"
						showIcon
						style={{ marginBottom: 10, height: 'max-content' }}
					/>
				</div>
			</React.Fragment>
		);

	if (!isValidPlan(tier, featurePipelines)) {
		return (
			<React.Fragment>
				<Banner {...bannerDetails} onClick={() => window.open(bannerDetails.href)} />
				<Overlay
					style={{
						maxWidth: '70%',
					}}
					src="https://i.imgur.com/J4Hjdsl.png"
					alt="ReactiveSearch Pipelines Insights"
				/>
			</React.Fragment>
		);
	}
	if (isLoading) {
		return <Loader />;
	}

	const renderCharts = () => {
		const selectedPipelineId = form.current.get('pipeline').value;
		const selectedVersionId = form.current.get('version').value;

		return (
			<>
				{!selectedPipelineId && (
					<div className="charts-placeholder">
						<span>Select a pipeline from the dropdown to see insights.</span>
					</div>
				)}
				{[
					{
						title: 'Average Time Taken (ms)',
						dataArray: avgTimeInsights,
						xAxisDataKey: 'dateFormatted',
						versionRequired: false,
						valueSuffix: 'ms',
					},
					{
						title: 'Average Time Taken By Stages (ms)',
						dataArray: avgTimeInsightsPerVersion,
						xAxisDataKey: 'dateFormatted',
						versionRequired: true,
						valueSuffix: 'ms',
					},
					{
						title: 'Error Rate (%)',
						dataArray: errorRateInsights,
						xAxisDataKey: 'dateFormatted',
						versionRequired: false,
						valueSuffix: '%',
					},
					{
						title: 'Error Rate By Stages (%)',
						dataArray: errorRateInsightsPerVersion,
						xAxisDataKey: 'dateFormatted',
						versionRequired: true,
						valueSuffix: '%',
					},
				].map(({ title, dataArray, xAxisDataKey, versionRequired, valueSuffix }) => {
					let ChartComponent;
					if (!Array.isArray(dataArray) || !dataArray.length) {
						let placeholderText = !selectedPipelineId
							? ''
							: `Select pipeline ${
									versionRequired ? 'version ' : ' '
							  }to see ${title} - insights.`;

						// version selected but couldn't get results
						if (selectedVersionId) {
							placeholderText = `${title} - insights not available.`;
						}
						ChartComponent = () => (
							<div className="chart-placeholder">
								<span>{placeholderText}</span>
								<img
									src="https://i.imgur.com/5utvKki.png"
									alt="Chart img placeholder"
								/>
							</div>
						);
					} else {
						let yDomainMax = 100;
						dataArray.forEach((dataObj, index) => {
							Object.keys(dataObj).forEach((key) => {
								if (key !== xAxisDataKey) {
									const yAxisValue = Number(dataArray[index][key]);
									if (yDomainMax < yAxisValue) {
										yDomainMax = yAxisValue;
									}
								}
							});
						});
						ChartComponent = () => (
							<LineChart
								height={350}
								width={chartWrapperRef.current.offsetWidth}
								data={dataArray}
								margin={{
									top: 0,
									bottom: 5,
									right: 10,
								}}
								className={chartsCss}
							>
								<Legend
									verticalAlign="top"
									align="right"
									margin={{ top: 5, right: 0, left: 'auto', bottom: 20 }}
								/>
								<XAxis
									dataKey={xAxisDataKey}
									angle={25}
									interval={0}
									dy={10}
									minTickGap={-300}
								/>
								<YAxis domain={[0, yDomainMax]} />
								<ChartTooltip
									separator=""
									formatter={(value) => {
										return (
											<span
												style={{
													float: 'right',
													marginLeft: '5px',
												}}
											>
												{value}
												{valueSuffix}
											</span>
										);
									}}
								/>

								{Object.keys(dataArray[0] ?? {}).map((key, index) => {
									if (key === xAxisDataKey) {
										return null;
									}
									return (
										<Line
											type="monotone"
											dataKey={key}
											stroke={getUniqueColor(index)}
										/>
									);
								})}
							</LineChart>
						);
					}

					return (
						<div
							key={title}
							ref={(ref) => {
								chartWrapperRef.current = ref;
							}}
							id="chart-wrapper"
							style={{ width: '100%' }}
						>
							<h1>{title}</h1> <ChartComponent />
						</div>
					);
				})}
			</>
		);
	};
	const getCreatedUpdatedStats = (pipeline) => {
		const stats = {};
		if (pipeline.updated_at) {
			stats.title = (
				<div>
					<p>{moment.unix(pipeline.updated_at).format('ddd D MMM, hh:mm A')}</p>
				</div>
			);
			stats.difftime = `Updated ${moment.unix(pipeline.updated_at).stdFromNow()}`;
			return stats;
		}
		if (pipeline.created_at) {
			stats.title = (
				<div>
					<p>{moment.unix(pipeline.created_at).format('ddd D MMM, hh:mm A')}</p>
				</div>
			);
			stats.difftime = `Created ${moment.unix(pipeline.created_at).stdFromNow()}`;
			return stats;
		}
		return stats;
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
							<h2>Insights for ReactiveSearch Pipelines</h2>
							<Row>
								<Col lg={18}>
									<p>Track analytics for pipelines.</p>
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
								icon="info-circle"
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
				<FieldGroup
					strict={false}
					control={form.current}
					render={() => {
						return (
							<Flex style={{ gap: '2rem', flexWrap: 'wrap' }}>
								<FieldControl
									strict={false}
									name="pipeline"
									render={({ handler }) => {
										const inputHandler = handler();
										return (
											<Grid
												className="field-wrapper"
												label="Choose a pipeline"
												toolTipMessage="Choose a pipeline to check insights"
												component={
													<Select
														showSearch
														filterOption={(input, option) => {
															return option.props.label.props.title
																.toLowerCase()
																.includes(input.toLowerCase());
														}}
														placeholder="Choose a pipeline"
														mode="default"
														style={{
															width: '100%',
															maxWidth: '400px',
														}}
														{...inputHandler}
														optionLabelProp="label"
													>
														{orderBy(
															pipelines || [],
															(a) => {
																return (
																	a.updated_at ||
																	a.created_at ||
																	0
																);
															},
															['desc'],
														).map((pipeline) => {
															const {
																/* eslint-disable camelcase */
																description,
																id,
																_version_description,
															} = pipeline;
															const text =
																description ||
																_version_description ||
																`Pipeline with id - ${id}`;
															const usageStatsForPipeline =
																usageStats.find(
																	(item) =>
																		item.key === pipeline.id,
																);
															return (
																<Select.Option
																	key={id}
																	label={
																		<Tooltip title={text}>
																			{text}
																		</Tooltip>
																	}
																>
																	<Tooltip title={text}>
																		{text}
																	</Tooltip>
																	<Flex
																		justifyContent="space-between"
																		alignItems="center"
																		style={{
																			width: '100%',
																			marginTop: '5px',
																			fontSize: '12px',
																		}}
																	>
																		<Tooltip
																			title={
																				getCreatedUpdatedStats(
																					pipeline,
																				).title
																			}
																		>
																			{
																				getCreatedUpdatedStats(
																					pipeline,
																				).difftime
																			}
																		</Tooltip>
																		<Tooltip
																			title={
																				usageStatsForPipeline?.count >
																				0
																					? `Used ${
																							usageStatsForPipeline?.count
																					  } times in last ${30} days`
																					: 'Not used in the last 30 days'
																			}
																		>
																			<Badge
																				count={
																					usageStatsForPipeline?.count ??
																					'-'
																				}
																				style={{
																					backgroundColor:
																						'#fff',
																					color: '#1890ff',
																					boxShadow:
																						'0 0 0 1px #1890ff inset',
																				}}
																				className={badgeCss}
																			/>
																		</Tooltip>
																	</Flex>
																</Select.Option>
															);
														})}
													</Select>
												}
											/>
										);
									}}
								/>
								<FieldControl
									strict={false}
									name="version"
									render={({ handler }) => {
										const inputHandler = handler();
										const chosenPipeline = pipelines.find(
											(item) =>
												item.id === form.current.get('pipeline').value,
										);
										if (!inputHandler.value) {
											if (chosenPipeline?.versions) {
												inputHandler.onChange(
													(chosenPipeline?.versions.find(
														(version) => version.is_live,
													))._version,
												);
											}
										}
										return (
											<Grid
												className="field-wrapper"
												label="Choose a version"
												toolTipMessage="Choose a pipeline version to check insights"
												component={
													<Select
														placeholder="Choose a version"
														mode="default"
														style={{
															width: '150px',
														}}
														{...inputHandler}
														disabled={!chosenPipeline}
														optionLabelProp="label"
														key={inputHandler.value}
													>
														{(chosenPipeline?.versions || []).map(
															({
																_version_description,
																_version,
															}) => {
																const text = `v${_version}
																			${_version_description ? ` - ${_version_description}` : ''}`;
																return (
																	<Select.Option
																		key={_version}
																		value={_version}
																		label={text}
																	>
																		<Tooltip title={text}>
																			<Typography.Text
																				ellipsis
																			>
																				{text}
																			</Typography.Text>
																		</Tooltip>
																	</Select.Option>
																	/* eslint-enable camelcase */
																);
															},
														)}
													</Select>
												}
											/>
										);
									}}
								/>
							</Flex>
						);
					}}
				/>
				<Spin spinning={loadingState} size="large">
					<Flex className="charts-container">{renderCharts()}</Flex>
				</Spin>
			</Container>
		</ErrorToaster>
	);
};

Pipelines.propTypes = {
	isLoading: PropTypes.bool,
	featurePipelines: PropTypes.bool,
	pipelines: PropTypes.array,
	fetchPipelines: PropTypes.func.isRequired,
	tier: allowedTiers,
	appVersion: PropTypes.string,
	fetchUsageStats: PropTypes.func.isRequired,
	history: PropTypes.object,
	fetchPipelineVersions: PropTypes.func.isRequired,
	usageStats: PropTypes.array.isRequired,
	filters: PropTypes.object,
	selectFilterValue: PropTypes.func.isRequired,
};

Pipelines.defaultProps = {
	isLoading: false,
	pipelines: null,
	tier: undefined,
	featurePipelines: false,
	appVersion: undefined,
	history: {},
	filters: null,
};

const mapStateToProps = (state) => ({
	isLoading: get(state, '$getAppPipelines.isFetching'),
	pipelines: get(state, '$getAppPipelines.results'),
	tier: get(state, '$getAppPlan.results.tier'),
	featurePipelines: get(state, '$getAppPlan.results.feature_pipelines', false),
	appVersion: get(state, '$getAppPlan.results.version'),
	usageStats: get(state, '$getPipelinesUsageStats.results')?.pipelines ?? [],
	filters: get(state, `$getSelectedFilters.${filterId}`),
});

const mapDispatchToProps = (dispatch) => ({
	fetchPipelines: () => dispatch(getPipelines()),
	fetchPipelineVersions: (id) => dispatch(getPipelineVersions(id)),
	fetchUsageStats: () => dispatch(getPipelinesUsageStats()),
	selectFilterValue: (filterIdParam, filterKey, filterValue) =>
		dispatch(setFilterValue(filterIdParam, filterKey, filterValue)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(Pipelines));
