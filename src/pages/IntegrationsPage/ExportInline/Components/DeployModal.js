import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Alert, Icon, Modal, Select } from 'antd';
import { timeDifference, unsafeChars } from '../../utils/index';
import { commitModalStyles } from './styles';
import '../styles.css';

const DeployModal = ({
	open,
	handleOk,
	handleCancel,
	errMsg,
	isLoading,
	setErrMsg,
	uiBuilderName,
	allVersions,
}) => {
	const defaultObj = {
		projectSettings: {
			buildCommand: 'yarn build',
			devCommand: 'yarn dev',
			installCommand: 'yarn',
			outputDirectory: 'build',
			framework: null,
			// build_dir: 'build',
		},
		target: '',
		version_id: '',
	};

	const [deployObj, setDeployObj] = useState(defaultObj);
	const [updatedAt, setUpdatedAt] = useState(0);

	const handleInputChange = (key, val) => {
		setErrMsg('');
		const newDeployObj = { ...deployObj };
		if (key === 'target' || key === 'version_id') {
			setDeployObj({
				...newDeployObj,
				[key]: val,
			});
		} else {
			setDeployObj({
				...newDeployObj,
				projectSettings: {
					...newDeployObj.projectSettings,
					[key]: val,
				},
			});
		}

		// validate url
		if (key === 'site_name') {
			if (val.indexOf(' ') >= 0) {
				setErrMsg('Site Name contains white spaces');
			} else if (unsafeChars.some((i) => val.includes(i)))
				setErrMsg('Site Name has unsafe characters');
			else setErrMsg('');
		}
	};

	const getStatus = (val) => {
		const versionConfig = allVersions.filter((i) => i.version_id === val);
		if (versionConfig.length) {
			const time = timeDifference(
				new Date(),
				new Date(versionConfig[0].updated_at || versionConfig[0].created_at * 1000),
			);
			setUpdatedAt(time);
		} else {
			setUpdatedAt(0);
		}
	};

	function validDomain(str) {
		const pattern = new RegExp(
			'^(https?:\\/\\/)?' + // protocol
				'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
				'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
				'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
				'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
				'(\\#[-a-z\\d_]*)?$', // fragment locator
			'i',
		);
		return !!pattern.test(str);
	}

	// eslint-disable-next-line
	const validateURL = (val) => {
		if (validDomain(val)) {
			setErrMsg('');
		} else setErrMsg('Site Name / domain is invalid');
	};

	return (
		<Modal
			title={<div style={{ fontWeight: 'bold' }}>Deploy {uiBuilderName}</div>}
			visible={open}
			afterClose={() => {
				setDeployObj(defaultObj);
				setErrMsg('');
				setUpdatedAt(0);
			}}
			onOk={() => handleOk(deployObj)}
			onCancel={() => {
				handleCancel();
				setDeployObj(defaultObj);
				setErrMsg('');
			}}
			okText={<>Deploy {isLoading ? <Icon type="loading" /> : null}</>}
			okButtonProps={{
				disabled: errMsg || !deployObj.target,
			}}
		>
			<div css={commitModalStyles}>
				{/* <div className="label-container">Site Name</div> */}
				{/* <Input
					value={deployObj.projectSettings.alias}
					allowClear
					onChange={(e) => handleInputChange('alias', e.target.value)}
					onBlur={(e) => validateURL(e.target.value)}
				/> */}

				<div className="label-container">Environment *</div>
				<Select
					style={{ width: '100%' }}
					defaultValue="staging"
					value={deployObj.target}
					onSelect={(val) => handleInputChange('target', val)}
				>
					<Select.Option value="staging">staging</Select.Option>
					<Select.Option value="production">production</Select.Option>
				</Select>

				<div className="label-container">Version to deploy</div>
				<Select
					style={{ width: '100%' }}
					value={deployObj.version_id}
					optionLabelProp="value"
					onSelect={(val) => {
						handleInputChange('version_id', val);
						getStatus(val);
					}}
				>
					{(allVersions || []).map((data) => (
						<Select.Option value={data.version_id} key={data.version_id}>
							<b>{data.metadata.commit}</b>
							<div>{data.version_id}</div>
						</Select.Option>
					))}
				</Select>

				{/* eslint-disable-next-line */}
				{updatedAt && isNaN(updatedAt) ? <>&nbsp; saved {updatedAt}</> : null}
				<div style={{ height: 'auto', marginTop: 10 }}>
					{errMsg ? (
						<Alert
							message={errMsg}
							type="error"
							showIcon
							icon={<Icon type="exclamation-circle" />}
						/>
					) : null}
				</div>
			</div>
		</Modal>
	);
};

DeployModal.propTypes = {
	open: PropTypes.bool,
	errMsg: PropTypes.string,
	setErrMsg: PropTypes.func,
	handleOk: PropTypes.func.isRequired,
	handleCancel: PropTypes.func.isRequired,
	uiBuilderName: PropTypes.string,
	allVersions: PropTypes.array,
	isLoading: PropTypes.bool,
};

DeployModal.defaultProps = {
	open: false,
	errMsg: '',
	setErrMsg: () => {},
	uiBuilderName: '',
	allVersions: [],
	isLoading: false,
};

export default withRouter(DeployModal);
