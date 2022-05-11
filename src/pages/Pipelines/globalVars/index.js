import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Button, Icon, Alert } from 'antd';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../../components/Overlay';
import GlobalVarList from './GlobalVarList';
import CreateModal from './CreateModal';
import { getURL } from '../../../constants/config';
import { isValidPlan } from '../../../batteries/utils';
import { allowedTiers } from '../../../utils/prop-types';
import { compareVersion } from '../../../utils';
import { pipelinesBannerDetails } from '../utils';
import { container } from '../../ResultsPage/styles';

const GlobalVarsPage = ({ tier, featurePipelines, credentials, appVersion }) => {
	const [open, setOpen] = useState(false);
	const [globalVars, setGlobalVars] = useState([]);
	const bannerDetails = pipelinesBannerDetails.globalVars;

	useEffect(() => {
		getGlobalVars();
	}, []);

	const handleClose = () => {
		setOpen(false);
		getGlobalVars();
	};

	const getGlobalVars = () => {
		const ACC_API = getURL();
		fetch(`${ACC_API}/_pipelines/envs`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${btoa(credentials)}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				setGlobalVars(data || []);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	if (compareVersion(appVersion, '8.1.0') === -1)
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
						message="Upgrade appbase.io to v8.1.0 or above for using the ReactiveSearch pipelines env feature"
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
					src="https://imgur.com/EirsyK3.png"
					alt="global_envs"
				/>
			</React.Fragment>
		);
	}

	return (
		<div>
			<Banner {...bannerDetails} onClick={() => window.open(bannerDetails.href)} />
			<div
				className={container}
				style={{
					backgroundColor: '#fff',
					margin: '50px',
				}}
			>
				<Button
					type="primary"
					style={{ position: 'absolute', right: 10, top: 10 }}
					onClick={() => setOpen(true)}
				>
					<Icon type="plus" /> Create New Env
				</Button>
				{globalVars.map((data) => (
					<GlobalVarList
						formData={data}
						key={data.key}
						globalVars={globalVars}
						handleClose={() => handleClose()}
					/>
				))}
			</div>
			<CreateModal
				open={open}
				setOpen={setOpen}
				mode="Create"
				globalVars={globalVars}
				handleClose={() => handleClose()}
			/>
		</div>
	);
};

GlobalVarsPage.propTypes = {
	tier: allowedTiers,
	featurePipelines: PropTypes.bool,
	credentials: PropTypes.string.isRequired,
	appVersion: PropTypes.string,
};

GlobalVarsPage.defaultProps = {
	appVersion: undefined,
	tier: undefined,
	featurePipelines: false,
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		featurePipelines: get(state, '$getAppPlan.results.feature_pipelines', false),
		tier: get(state, '$getAppPlan.results.tier'),
		credentials: username ? `${username}:${password}` : null,
		appVersion: get(state, '$getAppPlan.results.version'),
	};
};

export default connect(mapStateToProps, null)(GlobalVarsPage);
