import React, { Fragment, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Icon, Row, Layout, Result, Alert, message, notification } from 'antd';
import { css } from 'emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import Loader from '../../components/Loader';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import DNDWrapper from '../../components/DNDWrapper';
import { bannerDetails } from './utils';
import {
	getPipelines,
	getPipelinesUsageStats,
	reorderPipelines,
} from '../../batteries/modules/actions';
import PipelineCard from './components/PipelineCard';
import { isValidPlan } from '../../batteries/utils';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { allowedTiers } from '../../utils/prop-types';
import { compareVersion } from '../../utils';

const pipelinesContainer = css`
	padding: 50px;
	margin-bottom: 70px;
`;
const { Header } = Layout;
const Pipelines = (props) => {
	const {
		isLoading,
		pipelines,
		fetchPipelines,
		reorderPipeline,
		tier,
		appVersion,
		featurePipelines,
		fetchUsageStats,
		history,
	} = props;

	useLayoutEffect(() => {
		if (isValidPlan(tier, featurePipelines)) {
			fetchPipelines();
			fetchUsageStats();
		}
	}, []);

	const onDragEnd = (result) => {
		const pipelineToReorder = pipelines.find(
			(pipeline) => pipeline.priority === result.source.index,
		);

		let priority;

		if (result.source.index < result.destination.index) {
			// dropping at nextELem + 1
			priority = result.destination.index + 1;
		} else if (result.destination.index === 1) {
			priority = result.destination.index;
		} else {
			priority = result.destination.index - 1;
		}
		reorderPipeline({
			id: pipelineToReorder.id,
			priority,
		}).then((res) => {
			if (res && res.error) {
				notification.error({
					message: 'Error',
					description: get(res.error, 'message'),
				});
			} else {
				message.success(
					`Pipeline re-ordered successfully from ${pipelineToReorder.priority} to ${priority}`,
				);
			}
		});
	};

	if (compareVersion(appVersion, '7.58.0') === -1)
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
						message="Upgrade appbase.io to v7.58.0 or above for using the pipeline features"
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
					alt="Pipelines"
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
					css={{
						padding: '25px 0px',
						margin: '0 auto',
					}}
				>
					<Row type="flex" justify="space-between" align="middle" gutter={16}>
						<Col lg={18}>
							<h2>Pipelines</h2>
							<Row>
								<Col lg={18}>
									<p>
										Pipelines let you create pre and post-processing stages for
										searching and indexing data.
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
									<Icon type="plus" />
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
			<div css={pipelinesContainer}>
				{' '}
				{pipelines && pipelines.length ? (
					<ErrorToaster>
						<div>
							<DNDWrapper
								onDragEnd={onDragEnd}
								items={(pipelines || []).sort((a, b) => a.priority - b.priority)}
								dropId="PIPELINES"
								indexKey="priority"
								idKey="id"
							>
								{({ item, dragProvided, dragSnapshot }) => (
									<PipelineCard
										dragProvided={dragProvided}
										dragSnapshot={dragSnapshot}
										pipeline={item}
										index={item.priority}
										history={history}
									/>
								)}
							</DNDWrapper>
						</div>
					</ErrorToaster>
				) : (
					<Result
						title="No Pipelines Present"
						subTitle="Create a new pipeline to get started"
						extra={
							<Link to="/cluster/pipelines/new">
								<Button type="primary">
									<Icon type="plus" />
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
	reorderPipeline: PropTypes.func.isRequired,
	tier: allowedTiers,
	appVersion: PropTypes.string,
	fetchUsageStats: PropTypes.func.isRequired,
	history: PropTypes.object,
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
});

const mapDispatchToProps = (dispatch) => ({
	fetchPipelines: () => dispatch(getPipelines()),
	reorderPipeline: (payload) => dispatch(reorderPipelines(payload)),
	fetchUsageStats: () => dispatch(getPipelinesUsageStats()),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(Pipelines));
