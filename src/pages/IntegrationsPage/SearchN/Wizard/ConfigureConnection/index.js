import React, { useEffect, useState } from 'react';
import { Button, Select, Form, Tag, Tooltip } from 'antd';
import { array, func, object } from 'prop-types';
import orderBy from 'lodash/orderBy';
import get from 'lodash/get';
import { connect } from 'react-redux';
import moment from 'moment';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { createPermission, getPermission } from '../../../../../batteries/modules/actions';
import ErrorToaster from '../../../../../batteries/components/shared/ErrorToaster';
import CreateCredentials from '../../../../../components/CreateCredentials';

import { configureConnectionStyles, suggestionStyles } from '../styles';

const ConfigureConnection = ({
	tabsValidated,
	setTabsValidated,
	apps,
	permissions,
	handleCreatePermission,
	fetchPermissions,
}) => {
	const [showForm, setShowForm] = useState(false);
	const [currentPermissionInfo, setCurrentPermissionInfo] = useState(undefined);
	const [mode, setMode] = useState('create');

	useEffect(() => {
		fetchPermissions();
	}, []);

	// eslint-disable-next-line
	const handleSubmit = (form, username) => {
		newPermission(form.mappedValues);
	};

	const newPermission = (request) => {
		handleCreatePermission(undefined, request).then(({ payload }) => {
			if (payload) {
				handleCancel();
				fetchPermissions();
			}
		});
	};

	const handleCancel = () => {
		setShowForm(false);
		setMode('create');
	};

	const filteredApps = Object.keys(apps).filter((app) => !app.startsWith('.'));
	const sortedByUpdatedAt = orderBy(
		permissions,
		(a) => {
			const timestamp = a.updated_at || a.created_at;
			const timeInMilliSecondsSinceEpoch = new Date(timestamp).valueOf();
			return timeInMilliSecondsSinceEpoch;
		},
		['desc'],
	);

	return (
		<div css={configureConnectionStyles}>
			<div className="description-container">
				Configure the data source and default security for your search app.
			</div>
			<div className="field-container">
				<div className="heading">Pipeline</div>
				<div className="field-description">
					A search engine backend is configured using a pipeline. You can choose an
					existing pipeline, you can also change or configure this later.
				</div>
				<FieldControl name="pipeline">
					{({ value, onChange }) => (
						<Form.Item
							style={{
								margin: 0,
								padding: 0,
							}}
							required
						>
							<Select
								value={value || undefined}
								showSearch
								placeholder="Choose your pipeline"
								style={{
									minWidth: 300,
								}}
								onSelect={(val) => {
									onChange(val);
									setTabsValidated({
										...tabsValidated,
										tab2: true,
									});
								}}
							>
								{(filteredApps || [])
									.filter((k) => !k.includes('metricbeat'))
									.map((k) => (
										<Select.Option key={k}>{k}</Select.Option>
									))}
							</Select>
						</Form.Item>
					)}
				</FieldControl>
			</div>
			<div className="field-container">
				<div className="heading">Default Security</div>
				<div className="field-description">
					Configure the default security that your app will use.
				</div>

				<FieldGroup name="exportSettings" strict={false}>
					{() => (
						<div className="button-container">
							<FieldControl name="credentials" strict={false}>
								{({ value, onChange }) => (
									<>
										<Button
											icon="plus"
											type="primary"
											onClick={() => {
												setMode('create');
												setShowForm(true);
											}}
										>
											Create an API credential
										</Button>
										<>OR</>
										<Select
											value={value || undefined}
											showSearch
											placeholder="Choose an existing API credential"
											style={{
												minWidth: 500,
											}}
											optionLabelProp="value"
											onSelect={(val) => {
												onChange(val);
											}}
											optionFilterProp="children"
											filterOption={(input, option) =>
												option.props.title
													.toLowerCase()
													.indexOf(input.toLowerCase()) >= 0
											}
										>
											{sortedByUpdatedAt.map((permission) => {
												const timestamp =
													permission.updated_at || permission.created_at;
												const timeInSecondsSinceEpoch =
													new Date(timestamp).valueOf() / 1000;

												return (
													<Select.Option
														key={`${permission.username}-${permission.password}`}
														value={`${permission.username}:${permission.password}`}
														title={permission.description}
													>
														<div css={suggestionStyles}>
															<div className="row-data">
																<div
																	className="overflow"
																	style={{
																		maxWidth: '400px',
																		textOverflow: 'ellipsis',
																		overflow: 'hidden',
																		whiteSpace: 'no-wrap',
																	}}
																>
																	<Tooltip
																		title={
																			permission.description
																		}
																	>
																		{permission.description}
																	</Tooltip>
																</div>
																<Tag>{permission.ops[0]}</Tag>
															</div>
															<div className="row-data">
																<Button
																	type="link"
																	style={{ padding: 0 }}
																	onClick={() => {
																		setMode('view');
																		setShowForm(true);
																		setCurrentPermissionInfo(
																			permission,
																		);
																	}}
																>
																	View access details
																</Button>
																<>
																	{moment
																		.unix(
																			timeInSecondsSinceEpoch,
																		)
																		.format(
																			'ddd DD MMM, hh:mm A',
																		) || 'NA'}
																</>
															</div>
														</div>
													</Select.Option>
												);
											})}
										</Select>
									</>
								)}
							</FieldControl>
						</div>
					)}
				</FieldGroup>
			</div>

			<ErrorToaster inline>
				<CreateCredentials
					titleText={mode === 'create' ? 'Create Credentials' : 'View Access Details'}
					onSubmit={handleSubmit}
					show={showForm}
					handleCancel={() => handleCancel()}
					initialValues={currentPermissionInfo}
					readOnly={mode !== 'create'}
				/>
			</ErrorToaster>
		</div>
		// 	)}
		// </FieldGroup>
	);
};

ConfigureConnection.defaultProps = {
	apps: {},
	tabsValidated: {},
	setTabsValidated: () => {},
};

ConfigureConnection.propTypes = {
	apps: object,
	tabsValidated: object,
	permissions: array.isRequired,
	handleCreatePermission: func.isRequired,
	fetchPermissions: func.isRequired,
	setTabsValidated: func,
};

const mapStateToProps = (state) => {
	const appPermissions = get(state, '$getAppPermissions.results.default');
	return {
		apps: get(state, 'apps.data'),
		permissions: get(appPermissions, 'results', []),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchPermissions: (appName) => dispatch(getPermission(appName)),
	handleCreatePermission: (appName, payload) => dispatch(createPermission(appName, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConfigureConnection);
