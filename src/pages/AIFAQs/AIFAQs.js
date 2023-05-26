/* eslint-disable no-bitwise */
import React, { useState } from 'react';
import { bool, func, object, string } from 'prop-types';
import { DownloadOutlined, InfoCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Col, Row, Layout, Alert } from 'antd';
import { css } from 'emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { allowedTiers } from '../../utils/prop-types';
import { compareVersion } from '../../utils';
import { AIFAQsBannerDetails } from './utils';
import Container from '../../components/Container';
import { ALLOWED_SLS } from '../../constants';
import { features, isValidPlan } from '../../batteries/utils';
import { getAIFAQs, putAIFAQ } from '../../batteries/modules/actions/AI';
import AIFAQCards from './components/AIFAQCards';
import SaveAIFAQModal from './components/SaveAIFAQModal';

const AIFAQsContainer = css`
	margin-top: 2rem;
	min-height: 50vh;
	padding: 50px;
	margin-bottom: 70px;
	background: white;
	padding-top: 25px;
`;

const { Header } = Layout;

const AIFAQsComponent = (props) => {
	const { appVersion, backendImage, featureAI, tier, isAIFAQsLoading, AIFAQs } = props;
	const bannerDetails = AIFAQsBannerDetails;
	const [showFAQModal, setShowFAQModal] = useState(false);

	const handleJSONExport = () => {
		if (isAIFAQsLoading) return;

		// Convert AIFAQs data to JSON string
		const jsonData = JSON.stringify(AIFAQs, null, 4);

		// Create a Blob with the JSON data
		const blob = new Blob([jsonData], { type: 'application/json' });

		// Create a temporary anchor element to trigger the download
		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(blob);
		downloadLink.download = 'faqs.json';

		// Append the anchor element to the document body
		document.body.appendChild(downloadLink);

		// Trigger the download
		downloadLink.click();

		// Clean up the temporary anchor element
		document.body.removeChild(downloadLink);
	};

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
						flexDirection: 'column',
					}}
				>
					<Alert
						type="warning"
						message="Upgrade reactivesearch.io to v8.12.0 or above for using the ReactiveSearch AI FAQs feature"
						showIcon
						style={{ marginBottom: 10, height: 'max-content' }}
					/>
					<img
						style={{
							width: '90%',
						}}
						src="https://i.imgur.com/oqwt4zd.png"
						alt="ReactiveSearch AI FAQs"
					/>
				</div>
			</React.Fragment>
		);

	if (!isValidPlan(tier, featureAI, features.AI)) {
		return (
			<React.Fragment>
				<Banner {...bannerDetails} onClick={() => window.open(bannerDetails.href)} />
				<Overlay
					style={{
						maxWidth: '70%',
					}}
					src="https://i.imgur.com/oqwt4zd.png"
					alt="ReactiveSearch AI FAQs"
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
						<Col lg={21}>
							<h2>AI FAQs</h2>
							<Row>
								<Col lg={18}>
									<p>Manage your AI FAQs</p>
								</Col>
							</Row>
						</Col>
						<Col
							lg={3}
							css={{
								display: 'flex',
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: '10px',
								justifyContent: 'flex-end',
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
			<Container css={AIFAQsContainer}>
				<Button
					style={{ marginTop: 10, float: 'right' }}
					type="default"
					size="large"
					onClick={handleJSONExport}
					icon={<DownloadOutlined />}
					disabled={isAIFAQsLoading}
				>
					Export as JSON
				</Button>
				<Button
					style={{ marginTop: 10, float: 'right', marginRight: '1rem' }}
					type="primary"
					size="large"
					onClick={() => setShowFAQModal(true)}
					icon={<PlusCircleOutlined />}
				>
					Add FAQ
				</Button>
				<AIFAQCards />
			</Container>
			{showFAQModal && (
				<SaveAIFAQModal
					visible={showFAQModal}
					onClose={() => setShowFAQModal(false)}
					onSaveFAQ={() => {
						setShowFAQModal(false);
					}}
				/>
			)}
		</ErrorToaster>
	);
};

AIFAQsComponent.propTypes = {
	tier: allowedTiers,
	appVersion: string,
	history: object,
	backendImage: string.isRequired,
	featureAI: bool.isRequired,
	saveFAQ: func.isRequired,
	isCreatingAIFAQs: bool.isRequired,
	AIFAQs: object.isRequired,
	isAIFAQsLoading: bool.isRequired,
};

AIFAQsComponent.defaultProps = {
	tier: undefined,
	appVersion: undefined,
	history: {},
};

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	appVersion: get(state, '$getAppPlan.results.version'),
	isCreatingAIFAQs: get(state, '$getAIReducer.faqs.isCreating', false),
	isAIFAQsLoading: get(state, '$getAIReducer.faqs.isFetching', false),
	featureAI: get(state, '$getAppPlan.results.feature_openai', false),
	AIFAQs: get(state, '$getAIReducer.faqs.data', null),
});

const mapDispatchToProps = (dispatch) => ({
	fetchAIFAQs: () => dispatch(getAIFAQs()),
	saveFAQ: (id, payload) => dispatch(putAIFAQ(id, payload)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(AIFAQsComponent));
