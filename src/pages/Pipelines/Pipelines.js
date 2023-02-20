import React, { Fragment, useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Layout, Result, Alert, Radio, Select } from 'antd';
import { css } from 'emotion';
import get from 'lodash/get';
import orderBy from 'lodash/orderBy';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import Loader from '../../components/Loader';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { pipelinesBannerDetails } from './utils';
import { getPipelines, getPipelinesUsageStats } from '../../batteries/modules/actions';
import PipelineCard from './components/PipelineCard';
import { isValidPlan } from '../../batteries/utils';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { allowedTiers } from '../../utils/prop-types';
import { compareVersion } from '../../utils';
import { ALLOWED_SLS } from '../../constants';

const pipelinesContainer = css`
	padding: 50px;
	margin-bottom: 70px;

	.filters-container {
		width: 100%;
		padding: 1rem 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}
`;
const { Header } = Layout;

const STATUS_FILTERS_CONSTANT = {
	// All: () => {
	// 	return true;
	// },
	Enabled: (pipeline) => {
		return pipeline.enabled;
	},
	Disabled: (pipeline) => {
		return !pipeline.enabled;
	},
};

const SORT_KEYS_CONSTANTS = {
	Priority: {
		valueFunc: (pipeline) => {
			return pipeline.priority ?? Number.MIN_SAFE_INTEGER;
		},
		order: 'desc',
	},
	'Updated Time': {
		valueFunc: (pipeline) => {
			return pipeline.updated_at || pipeline.created_at || 0;
		},
		order: 'desc',
	},

	// 'Updated Time ⬆️': {
	// 	valueFunc: (pipeline) => {
	// 		return pipeline.updated_at || pipeline.created_at || 0;
	// 	},
	// 	order: 'asc',
	// },
	// 'Priority ⬆️': {
	// 	valueFunc: (pipeline) => {
	// 		return pipeline.priority ?? Number.MIN_SAFE_INTEGER;
	// 	},
	// 	order: 'asc',
	// },
};

const Pipelines = (props) => {
	const {
		isLoading,
		pipelines,
		fetchPipelines,
		tier,
		appVersion,
		featurePipelines,
		fetchUsageStats,
		history,
		backendImage,
	} = props;
	const bannerDetails = pipelinesBannerDetails.allPipelines;
	const [selectedStatus, setSelectedStatus] = useState(Object.keys(STATUS_FILTERS_CONSTANT)[0]);
	const [sortKey, setSortKey] = useState(Object.keys(SORT_KEYS_CONSTANTS)[0]);
	useLayoutEffect(() => {
		if (isValidPlan(tier, featurePipelines)) {
			fetchPipelines();
			fetchUsageStats();
		}
	}, []);

	if (!ALLOWED_SLS.includes(backendImage) && compareVersion(appVersion, '8.0.0') === -1)
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
						message="Upgrade reactivesearch.io to v8.0.0 or above for using the ReactiveSearch pipelines feature"
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
					src="https://i.imgur.com/SUd3WeP.png"
					alt="ReactiveSearch Pipelines"
				/>
			</React.Fragment>
		);
	}
	if (isLoading) {
		return <Loader />;
	}

	return (
		<Fragment>
			<Header style={{ background: 'white', height: 'auto' }}>
				<div
					style={{
						padding: '25px 0px',
						margin: '0 auto',
					}}
				>
					<Row type="flex" justify="space-between" align="middle" gutter={16}>
						<Col lg={18}>
							<h2>ReactiveSearch Pipelines</h2>
							<Row>
								<Col lg={18}>
									<p>
										Pipelines are a set of declarative stages that allow
										creating pre-processing or post-processing flows for
										searching or indexing data.
									</p>
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
							<Link to="/cluster/pipelines/new">
								<Button block type="primary" size="large" rel="noopener noreferrer">
									<PlusOutlined style={{ margin: '0.25rem' }} />
									Create Pipeline
								</Button>
							</Link>
							<Button
								style={{ marginTop: 10 }}
								type="primary"
								ghost
								size="large"
								rel="noopener noreferrer"
								onClick={() => window.open(bannerDetails.href)}
							>
								Read Docs
							</Button>
						</Col>
					</Row>
				</div>
			</Header>
			<div className={pipelinesContainer}>
				<div className="filters-container">
					<Radio.Group
						buttonStyle="solid"
						onChange={({ target: { value } }) => {
							setSelectedStatus(value);
						}}
						value={selectedStatus}
					>
						{Object.keys(STATUS_FILTERS_CONSTANT).map((key) => {
							return (
								<Radio.Button value={key} key={key}>
									{key}
								</Radio.Button>
							);
						})}
					</Radio.Group>

					<div>
						<span>Sort by</span>{' '}
						<Select
							showSearch
							style={{ width: 200 }}
							onChange={(value) => {
								setSortKey(value);
							}}
							value={sortKey}
						>
							{Object.keys(SORT_KEYS_CONSTANTS).map((key) => (
								<Select.Option key={key} value={key}>
									{key}
								</Select.Option>
							))}
						</Select>
					</div>
				</div>
				{pipelines && pipelines.length ? (
					<ErrorToaster>
						<div>
							{orderBy(
								pipelines.filter((item) =>
									STATUS_FILTERS_CONSTANT[selectedStatus](item),
								),
								(a) => {
									return SORT_KEYS_CONSTANTS[sortKey]?.valueFunc(a);
								},
								[SORT_KEYS_CONSTANTS[sortKey]?.order ?? 'desc'],
							).map((item) => (
								<PipelineCard key={item.id} pipeline={item} history={history} />
							))}
						</div>
					</ErrorToaster>
				) : (
					<Result
						title="No Pipelines Present"
						subTitle="Create a new pipeline to get started"
						extra={
							<Link to="/cluster/pipelines/new">
								<Button type="primary">
									<PlusOutlined style={{ margin: '0.25rem' }} />
									Create Pipeline
								</Button>
							</Link>
						}
					/>
				)}
			</div>
		</Fragment>
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
	backendImage: PropTypes.string.isRequired,
};

Pipelines.defaultProps = {
	isLoading: false,
	pipelines: null,
	tier: undefined,
	featurePipelines: false,
	appVersion: undefined,
	history: PropTypes.object,
};

const mapStateToProps = (state) => ({
	isLoading: get(state, '$getAppPipelines.isFetching'),
	pipelines: get(state, '$getAppPipelines.results'),
	tier: get(state, '$getAppPlan.results.tier'),
	featurePipelines: get(state, '$getAppPlan.results.feature_pipelines', false),
	appVersion: get(state, '$getAppPlan.results.version'),
	backendImage: get(state, '$getAppPlan.results.image_type') ?? '',
});

const mapDispatchToProps = (dispatch) => ({
	fetchPipelines: () => dispatch(getPipelines()),
	fetchUsageStats: () => dispatch(getPipelinesUsageStats()),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(Pipelines));
