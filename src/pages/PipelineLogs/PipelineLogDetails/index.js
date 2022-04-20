import React, { useEffect, useState } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert } from 'antd';
import Overlay from '../../../components/Overlay';
import Container from '../../../components/Container';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import { isValidPlan } from '../../../batteries/utils';
import { compareVersion } from '../../../utils';
import { allowedTiers } from '../../../utils/prop-types';
import RequestDetails from '../../../batteries/components/analytics/components/RequestLogs/RequestDetails';
import { getPipelineLogDetails } from '../../../batteries/components/analytics/utils';
import { isJson } from '../../../components/ScriptConsole/utils';
import { parseData } from '../../../batteries/components/analytics/components/RequestLogs';

const bannerDetails = {
	title: 'Log Details',
	description: 'Log details',
	buttonText: 'Read Docs',
	icon: 'info-circle',
	href: 'https://docs.appbase.io/docs/search/pipelines/',
};

const PipelineLogDetailsWrapper = ({
	appVersion,
	tier,
	featurePipelines,
	logId,
	history,
	pipelineId,
}) => {
	const [logDetails, setLogDetails] = useState(null);
	useEffect(() => {
		getPipelineLogDetails(logId)
			.then((res) => {
				if (res.code === 404) {
					history.push(`/cluster/pipelines/${pipelineId}`);
				}

				setLogDetails(res);
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

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

	return (
		<React.Fragment>
			<Banner
				goBackText="Pipeline logs"
				showGoBack
				showButton={false}
				onClickGoBack={() => history.push(`/cluster/pipelines/${pipelineId}/logs`)}
				title=""
			/>
			<Container>
				{logDetails && (
					<RequestDetails
						handleCancel={() => {}}
						headers={get(logDetails, 'request.headers', {})}
						request={
							isJson(get(logDetails, 'request.body'))
								? parseData(get(logDetails, 'request.body')) || {}
								: get(logDetails, 'request.body')
						}
						response={parseData(get(logDetails, 'response')) || {}}
						time={get(logDetails, 'timestamp', '')}
						method={get(logDetails, 'request.method', '')}
						url={get(logDetails, 'request.uri', '')}
						ip={get(logDetails, 'request.headers.X-Forwarded-For[0]')}
						status={get(logDetails, 'response.code', '')}
						processingTime={get(logDetails, 'response.timetaken', '')}
						responseChanges={[]}
						requestChanges={get(logDetails, 'stageChanges', [])}
						latency={get(logDetails, 'took', [])}
						pipelineMode
						context={JSON.parse(get(logDetails, 'context', {}))}
					/>
				)}
			</Container>
		</React.Fragment>
	);
};
PipelineLogDetailsWrapper.defaultProps = {
	tier: undefined,
	featurePipelines: false,
	appVersion: undefined,
	logId: '',
	history: {},
	pipelineId: '',
};

PipelineLogDetailsWrapper.propTypes = {
	featurePipelines: PropTypes.bool,
	tier: allowedTiers,
	appVersion: PropTypes.string,
	logId: PropTypes.string,
	pipelineId: PropTypes.string,
	history: PropTypes.object,
};

const mapStateToProps = (state, props) => {
	const logId = get(props.match, 'params.logId');
	const pipelineId = get(props.match, 'params.id');
	return {
		tier: get(state, '$getAppPlan.results.tier'),
		featurePipelines: get(state, '$getAppPlan.results.feature_pipelines', false),
		appVersion: get(state, '$getAppPlan.results.version'),
		logId,
		pipelineId,
	};
};
export default connect(mapStateToProps)(PipelineLogDetailsWrapper);
