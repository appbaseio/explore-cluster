import React, { useEffect, useState } from 'react';
import { string, bool } from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Spin, Form } from 'antd';
import Overlay from '../../../../components/Overlay';
import { features, isValidPlan } from '../../../../batteries/utils';
import { addDomain, getDomainStatus, getAllDomains } from '../../utils/domain-apis';
import { domainSettingsTabStyles } from './styles';
import DomainList from './DomainList';
import {
	getDeploymentStatus,
	deployUiBuilder,
	getAllVersions,
} from '../../utils/sandpack-generator';
import DeployModal from '../../ExportInline/Components/DeployModal';

const isValidDomain = require('is-valid-domain');

const DomainSettingsTab = ({ preferenceId, tier, featureUIBuilderPremium }) => {
	const [errorMsg, setErrorMsg] = useState('');
	const [domainsData, setDomainsData] = useState([]);
	const [domainStatus, setDomainStatus] = useState({ name: '', status: '' });
	const [deploymentStatus, setDeploymentStatus] = useState({});
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [allVersions, setAllVersions] = useState([]);
	const [value, setValue] = useState('');
	let myInterval = null;

	useEffect(() => {
		fetchAllDomains();
		fetchDeploymentStatus();
		fetchAllVersions();
	}, []);

	const handleErrorMessage = (val) => {
		setErrorMsg(val);
	};

	const saveDomain = (domain) => {
		if (!isValidDomain(domain)) {
			handleErrorMessage('Entered domain name is not valid');
		} else {
			// eslint-disable-next-line
			handleErrorMessage('');
			// api call to add domain
			addDomain(preferenceId, { name: domain })
				.then((res) => res.json())
				.then((res) => {
					if (res.error) {
						handleErrorMessage(res.error.message);
					} else {
						setDomainsData([res, ...domainsData]);
						fetchDomainStatus(res.name, 'initial');
					}
				})
				.catch((err) => {
					console.error('Error to add domain', err);
					handleErrorMessage(err?.error.message);
				});
		}
	};

	const fetchDomainStatus = (name) => {
		getDomainStatus(preferenceId, name)
			.then((res) => res.json())
			.then((res) => {
				if (res.error) {
					setDomainStatus({
						name,
						status: res,
					});
				} else {
					setDomainStatus({ name: '', status: '' });
					const newDomainsData = domainsData.filter((data) => data.name !== res.name);
					setDomainsData([res, ...newDomainsData]);
				}
			})
			.catch((err) => {
				console.error('Error to fetch domain status', err);
				handleErrorMessage(err?.error.message);
			});
	};

	const fetchAllDomains = () => {
		getAllDomains(preferenceId)
			.then((res) => res.json())
			.then((res) => {
				if (!res.error) setDomainsData(res.domains || []);
			})
			.catch((err) => {
				console.error('Error to fetch all domains', err);
			});
	};
	if (!isValidPlan(tier, featureUIBuilderPremium, features.UI_BUILDER_PREMIUM)) {
		return (
			<React.Fragment>
				<Overlay
					style={{
						maxWidth: '70%',
					}}
					lockSectionStyle={{
						marginTop: '10%',
					}}
					src="https://i.imgur.com/86swNZ3.png"
					alt="integrations"
					btnProps={{
						href: '/cluster/billing',
					}}
				/>
			</React.Fragment>
		);
	}

	const fetchDeploymentStatus = () => {
		getDeploymentStatus(preferenceId)
			.then((res) => {
				const state = res.status || res.state;
				if (state === 'ERROR' || state === 'READY' || state === 'CANCELED') {
					clearInterval(myInterval);
					setIsLoading(false);
				}
				setDeploymentStatus({ ...res, state, status: state });
			})
			.catch((err) => {
				console.error(err);
				setDeploymentStatus({ status: 'Not deployed', state: 'Not deployed' });
				// setErrMsg(err);
			});
	};

	const handleDeploy = (body) => {
		if (body.version_id === '') {
			// eslint-disable-next-line
			delete body.version_id;
		}
		deployUiBuilder(preferenceId, body)
			.then(() => {
				setOpen(false);
				myInterval = setInterval(() => fetchDeploymentStatus(), 7000);
				fetchAllDomains();
			})
			.catch((err) => {
				console.error(err);
				setIsLoading(false);
				if (err.message) handleErrorMessage(err.message);
				else handleErrorMessage('Error in deployment');
			});
	};

	const fetchAllVersions = () => {
		getAllVersions(preferenceId)
			.then((res) => {
				setAllVersions(res.versions);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const handleCancel = () => {
		setOpen(false);
		handleErrorMessage('');
		setIsLoading(false);
	};

	const DeployComponent = () => {
		if (deploymentStatus.status === 'Not deployed')
			return (
				<Form.Item>
					<div className="deployment-status-container">
						<span role="img" aria-label="warning" className="warning-icon">
							⚠️
						</span>
						You need to create a deployment for the search UI before adding a custom
						domain
					</div>
					<Button
						type="primary"
						style={{ float: 'right' }}
						onClick={() => setOpen(true)}
						loading={isLoading}
					>
						Deploy
					</Button>
				</Form.Item>
			);

		return <Spin />;
	};
	return (
		<div className={domainSettingsTabStyles}>
			<div className="input-container">
				<Form>
					{deploymentStatus && deploymentStatus.status !== 'Not deployed' ? (
						<Form.Item label="Add Domain">
							<Input
								value={value}
								placeholder="Enter a valid domain. Eg: my-search-ui.awesome.com"
								style={{
									width: 500,
								}}
								onPressEnter={(e) => {
									saveDomain(e.target.value);
									setValue(e.target.value);
								}}
								onChange={(e) => {
									setValue(e.target.value);
								}}
								suffix={
									<PlusOutlined
										className="add-icon"
										onClick={() => saveDomain(value)}
									/>
								}
							/>
						</Form.Item>
					) : (
						<DeployComponent />
					)}
				</Form>
			</div>
			{errorMsg ? (
				<div style={{ height: 60, marginTop: 10 }}>
					<Alert
						message={errorMsg}
						type="error"
						showIcon
						icon={<ExclamationCircleOutlined />}
					/>
				</div>
			) : null}
			{domainsData.map((domain) => (
				<DomainList
					domain={domain}
					getDomainStatus={fetchDomainStatus}
					value={value}
					domainStatus={domainStatus}
					preferenceId={preferenceId}
					fetchAllDomains={fetchAllDomains}
				/>
			))}
			<DeployModal
				errMsg={errorMsg}
				setErrMsg={setErrorMsg}
				open={open}
				handleOk={(deployObj) => {
					setIsLoading(true);
					handleDeploy(deployObj);
				}}
				isLoading={isLoading}
				handleCancel={handleCancel}
				allVersions={allVersions}
				deploymentStatus={deploymentStatus}
			/>
		</div>
	);
};

DomainSettingsTab.defaultProps = {
	preferenceId: '',
	featureUIBuilderPremium: false,
};

DomainSettingsTab.propTypes = {
	preferenceId: string,
	tier: string.isRequired,
	featureUIBuilderPremium: bool,
};

const mapStateToProps = (state) => {
	return {
		tier: get(state, '$getAppPlan.results.tier'),
		featureUIBuilderPremium: get(state, '$getAppPlan.results.feature_uibuilder_premium', false),
	};
};

export default connect(mapStateToProps, null)(DomainSettingsTab);
