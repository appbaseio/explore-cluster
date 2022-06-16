import React, { useEffect, useState } from 'react';
import { Alert, Form, Icon, Input } from 'antd';
import { string } from 'prop-types';
import { addDomain, getDomainStatus, getAllDomains } from '../../utils/index';
import { domainSettingsTabStyles } from './styles';
import DomainList from './DomainList';

const isValidDomain = require('is-valid-domain');

const DomainSettingsTab = ({ preferenceId }) => {
	const [errorMsg, setErrorMsg] = useState('');
	const [domainsData, setDomainsData] = useState([]);
	const [domainStatus, setDomainStatus] = useState({ name: '', status: '' });
	const [value, setValue] = useState('');

	useEffect(() => {
		fetchAllDomains();
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
	console.log(domainsData);
	return (
		<div css={domainSettingsTabStyles}>
			<div className="input-container">
				<Form>
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
								<Icon
									type="plus"
									className="add-icon"
									onClick={() => saveDomain(value)}
								/>
							}
						/>
					</Form.Item>
				</Form>
			</div>
			{errorMsg ? (
				<div style={{ height: 60, marginTop: 10 }}>
					<Alert
						message={errorMsg}
						type="error"
						showIcon
						icon={<Icon type="exclamation-circle" />}
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
		</div>
	);
};

DomainSettingsTab.defaultProps = {
	preferenceId: '',
};

DomainSettingsTab.propTypes = {
	preferenceId: string,
};

export default DomainSettingsTab;
