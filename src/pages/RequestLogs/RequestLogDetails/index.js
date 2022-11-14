import React, { useEffect, useState } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { notification } from 'antd';
import Overlay from '../../../components/Overlay';
import Container from '../../../components/Container';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import RequestDetails from '../../../batteries/components/analytics/components/RequestLogs/RequestDetails';
import {
	getRequestLogDetails,
	isValidJSONFormat,
} from '../../../batteries/components/analytics/utils';
import { parseData } from '../../../batteries/components/analytics/components/RequestLogs';

const bannerMessagesAnalytics = {
	free: {
		title: 'Log Details',
		description: '',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	bootstrap: {
		title: 'Log Details',
		description: '',
		buttonText: 'Read More',
		href: 'https://docs.reactivesearch.io',
	},
	growth: {
		title: 'Log Details',
		description: '',
		buttonText: 'Read More',
		href: 'https://docs.reactivesearch.io',
	},
};

const RequestLogDetailsWrapper = ({ appName, isPaidUser, logId, history }) => {
	const [logDetails, setLogDetails] = useState(null);

	useEffect(() => {
		getRequestLogDetails(logId)
			.then((res) => {
				if (res.code === 404) {
					notification.error({
						message:
							'Log detail route has a behavior change, we recommending upgrading appbase.io server to v7.58.0',
					});
					setTimeout(() => {
						window.location.href = `/cluster${
							appName ? `/${appName}` : ''
						}/request-logs`;
					}, 2000);
				}

				setLogDetails(res);
			})
			.catch(() => {
				notification.error({
					message:
						'Log detail route has a behavior change, we recommending upgrading appbase.io server to v7.58.0',
				});
				setTimeout(() => {
					window.location.href = `/cluster${appName ? `/${appName}` : ''}/request-logs`;
				}, 2000);
			});
	}, []);
	return (
		<React.Fragment>
			{isPaidUser ? (
				<React.Fragment>
					<Banner
						goBackText="Request logs"
						showGoBack
						showButton={false}
						onClickGoBack={() =>
							history.push(`/cluster/${appName ? `${appName}/` : ''}request-logs`)
						}
					/>
					<Container>
						{logDetails && (
							<RequestDetails
								show
								handleCancel={() => {}}
								headers={get(logDetails, 'request.header', {})}
								request={
									isValidJSONFormat(get(logDetails, 'request.body'))
										? parseData(get(logDetails, 'request.body')) || {}
										: get(logDetails, 'request.body')
								}
								response={parseData(get(logDetails, 'response')) || {}}
								time={get(logDetails, 'timestamp', '')}
								method={get(logDetails, 'request.method', '')}
								url={get(logDetails, 'request.uri', '')}
								ip={get(logDetails, 'request.header.X-Forwarded-For[0]')}
								status={get(logDetails, 'response.code', '')}
								processingTime={get(logDetails, 'response.timetaken', '')}
								responseChanges={get(logDetails, 'responseChanges', [])}
								requestChanges={get(logDetails, 'requestChanges', [])}
								responseBody={get(logDetails, 'response.body', '')}
							/>
						)}
					</Container>
				</React.Fragment>
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesAnalytics.free} />

					<Overlay
						style={{
							maxWidth: '100%',
						}}
						lockSectionStyle={{
							marginTop: '10%',
						}}
						src="/static/images/analytics/LastOperations.png"
						alt="request logs"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};

RequestLogDetailsWrapper.defaultProps = { appName: '' };

RequestLogDetailsWrapper.propTypes = {
	appName: PropTypes.string,
	isPaidUser: PropTypes.bool.isRequired,
	logId: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => {
	const logId = get(props.match, 'params.logId');
	return {
		appName: get(state, '$getCurrentApp.name'),
		isPaidUser: get(state, '$getAppPlan.results.isPaid'),
		logId,
	};
};
export default connect(mapStateToProps)(RequestLogDetailsWrapper);
