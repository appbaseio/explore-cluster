import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';
import { css } from 'emotion';
import Overlay from '../../components/Overlay';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import RequestLogs from '../../batteries/components/analytics/components/RequestLogs';
import { isValidPlan } from '../../batteries/utils';
import { compareVersion } from '../../utils';
import { allowedTiers } from '../../utils/prop-types';
import { ALLOWED_SLS } from '../../constants';

const CSS = css`
	header {
		width: 100%;
		background: white;
		padding: 1.5rem;

		h3 {
			margin-top: 3rem;
			margin-bottom: 0;
		}
	}

	.cta-container {
		display: flex;
		button:last-child {
			margin-left: auto;
			span {
				text-decoration: underline;
				text-underline-offset: 2px;
			}
		}
	}
`;

const bannerDetails = {
	title: 'Pipeline Logs',
	description: 'Pipeline logs to glean insights.',
	buttonText: 'Read Docs',
	href: 'https://docs.reactivesearch.io/docs/search/pipelines/',
};

const PipelineLogsWrapper = ({
	appVersion,
	tier,
	featurePipelines,
	pipelineId,
	history,
	backendImage,
}) => {
	if (!ALLOWED_SLS.includes(backendImage) && compareVersion(appVersion, '7.58.0') === -1)
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
	return (
		<React.Fragment>
			<Container css={CSS}>
				<header>
					<div className="cta-container">
						<Button
							onClick={() => {
								history.push(`/cluster/pipelines/`);
							}}
						>
							<ArrowLeftOutlined /> Pipelines
						</Button>
						<Button
							type="link"
							onClick={() => {
								history.push(`/cluster/pipelines/${pipelineId}`);
							}}
						>
							Edit Pipeline
						</Button>
					</div>
					<h3>
						Viewing Logs for pipeline <b>{pipelineId}</b>
					</h3>
				</header>
				<RequestLogs pipelineLogsMode pipelineId={pipelineId} />
			</Container>
		</React.Fragment>
	);
};
PipelineLogsWrapper.defaultProps = {
	tier: undefined,
	featurePipelines: false,
	appVersion: undefined,
	pipelineId: '',
	history: {},
};

PipelineLogsWrapper.propTypes = {
	featurePipelines: PropTypes.bool,
	tier: allowedTiers,
	appVersion: PropTypes.string,
	pipelineId: PropTypes.string,
	history: PropTypes.object,
	backendImage: PropTypes.string.isRequired,
};

const mapStateToProps = (state, props) => {
	const pipelineId = get(props.match, 'params.id');
	return {
		tier: get(state, '$getAppPlan.results.tier'),
		featurePipelines: get(state, '$getAppPlan.results.feature_pipelines', false),
		appVersion: get(state, '$getAppPlan.results.version'),
		pipelineId,
		backendImage: get(state, '$getAppPlan.results.image_type') ?? '',
	};
};
export default connect(mapStateToProps)(PipelineLogsWrapper);
