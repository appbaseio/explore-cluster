import React, { useState } from 'react';
import { Checkbox, Col, Form, Icon, Input, message, Modal, notification, Row, Tooltip } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { flatten, get, isEmpty, map } from 'lodash';
import { cloneApp } from '../../utils';
import { validateAppName } from '../../utils/helper';
import { getSettings, putSettings, setCurrentApp } from '../../batteries/modules/actions';
import { appendApp } from '../../actions';
import { isValidPlan } from '../../batteries/utils';
import { allowedTiers } from '../../utils/prop-types';

const centerAligned = css`
	display: flex;
	align-items: center;
`;

const radioStyle = css`
	display: block;
	height: 30px;
	line-height: 30px;
`;

const CloneIndex = (props) => {
	const { handleCancel, index, existingApps, history, tier, featureSearchRelevancy } = props;
	const [destIndex, setDestIndex] = useState('');
	const [action, setAction] = useState(['settings.mappings', 'data']);
	const [loading, setLoading] = useState(false);
	const [exists, setExists] = useState(false);

	function resetValues() {
		setLoading(false);
		setDestIndex('');
	}

	const handleSubmit = () => {
		const isValid = validateAppName(destIndex);
		if (!isValid) {
			notification.error({
				message: 'Invalid Index Name',
			});
			return;
		}
		setLoading(true);
		const actions = flatten(map(action, (item) => item.split('.')));
		let hasSearchRelevancy;
		if (actions.includes('search_relevancy')) {
			hasSearchRelevancy = true;
		}
		cloneApp(index, destIndex, { action: actions })
			.then(async () => {
				const { getSettingsAction, updateSettingsAction, addApp, updateCurrentApp } = props;
				if (hasSearchRelevancy && isValidPlan(tier, featureSearchRelevancy)) {
					const res = await getSettingsAction(index);
					if (res && res.payload) {
						await updateSettingsAction(destIndex, res.payload);
					}
				}
				message.success(`${destIndex} successfully cloned from ${index}`);
				resetValues();
				addApp({ [destIndex]: {} });
				updateCurrentApp(destIndex);
				history.replace(`/app/${destIndex}/overview`);
			})
			.catch((e) => {
				message.error(e.message);
				resetValues();
			});
	};

	function handleInputChange(e) {
		setDestIndex(e.target.value);
		setExists(existingApps.includes(e.target.value));
	}

	const featureSearchRelevance = isValidPlan(tier, featureSearchRelevancy);

	const searchRelevancyCheckbox = (
		<Checkbox
			disabled={!featureSearchRelevance}
			className={radioStyle}
			value="search_relevancy"
		>
			Copy Search Relevancy Settings
		</Checkbox>
	);

	const copySynoynmsCheckbox = (
		<Checkbox disabled={!featureSearchRelevance} className={radioStyle} value="synonyms">
			Copy Synonyms
		</Checkbox>
	);

	return (
		<Modal
			title={`Clone Index ${index}`}
			visible
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText="Clone"
			confirmLoading={loading}
			okButtonProps={{ disabled: !destIndex || exists || isEmpty(action) }}
		>
			<Row className={centerAligned}>
				<Col style={{ marginBottom: exists ? '20px' : '1px' }} span={8}>
					Destination Index{' '}
					<Tooltip title="Destination Index should be a new index name that doesn't already exist in the cluster.">
						<Icon style={{ cursor: 'pointer' }} type="info-circle" />
					</Tooltip>
				</Col>
				<Col span={16}>
					<Form.Item
						validateStatus={exists ? 'error' : null}
						help={exists ? 'An index with that name already exists' : ''}
						style={{ marginBottom: 0 }}
					>
						<Input
							value={destIndex}
							onChange={handleInputChange}
							placeholder="Destination Index"
						/>
					</Form.Item>
				</Col>
			</Row>
			<Row style={{ paddingTop: '35px' }}>
				<Checkbox.Group value={action} onChange={setAction}>
					<div>
						<Checkbox className={radioStyle} value="settings.mappings">
							Clone Settings and Mappings
						</Checkbox>
					</div>
					<div>
						<Checkbox className={radioStyle} value="data">
							Copy Index Data
						</Checkbox>
					</div>

					<div>
						{featureSearchRelevance ? (
							searchRelevancyCheckbox
						) : (
							<Tooltip title="This feature is only available on selected plans.">
								{searchRelevancyCheckbox}
							</Tooltip>
						)}
					</div>
					<div>
						{featureSearchRelevance ? (
							copySynoynmsCheckbox
						) : (
							<Tooltip title="This feature is only available on selected plans.">
								{copySynoynmsCheckbox}
							</Tooltip>
						)}
					</div>
				</Checkbox.Group>
			</Row>
		</Modal>
	);
};

CloneIndex.propTypes = {
	index: PropTypes.string.isRequired,
	handleCancel: PropTypes.func,
	existingApps: PropTypes.array,
	getSettingsAction: PropTypes.func.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	addApp: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
	tier: allowedTiers.isRequired,
	featureSearchRelevancy: PropTypes.bool,
	updateCurrentApp: PropTypes.func.isRequired,
};

CloneIndex.defaultProps = {
	handleCancel: () => {},
	existingApps: [],
	featureSearchRelevancy: false,
};

const mapStateToProps = (state) => ({
	existingApps: Object.keys(state.apps.data || {}),
	tier: get(state, '$getAppPlan.results.tier'),
	featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
});

const mapDispatchToProps = (dispatch) => ({
	getSettingsAction: (name) => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	addApp: (appName) => dispatch(appendApp(appName)),
	updateCurrentApp: (appName) => dispatch(setCurrentApp(appName)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CloneIndex));
