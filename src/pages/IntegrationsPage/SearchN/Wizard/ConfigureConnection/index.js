import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Select, Tag, Tooltip } from 'antd';
import { array, func, object, string } from 'prop-types';
import orderBy from 'lodash/orderBy';
import get from 'lodash/get';
import { connect } from 'react-redux';
import moment from 'moment';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { createPermission, getPermission } from '../../../../../batteries/modules/actions';
import ErrorToaster from '../../../../../batteries/components/shared/ErrorToaster';
import CreateCredentials from '../../../../../components/CreateCredentials';
import { configureConnectionStyles, suggestionStyles } from '../styles';
import EndpointDropdown from '../../../Endpoint/EndpointDropdown';
import { BACKENDS } from '../../../../../batteries/utils';

const ConfigureConnection = ({
	tabsValidated,
	setTabsValidated,
	permissions,
	handleCreatePermission,
	fetchPermissions,
	control,
	backend,
	formValue,
}) => {
	const [showForm, setShowForm] = useState(false);
	const [currentPermissionInfo, setCurrentPermissionInfo] = useState(undefined);
	const [mode, setMode] = useState('create');

	useEffect(() => {
		fetchPermissions();
	}, []);

	useEffect(() => {
		if (
			!tabsValidated.tab2 &&
			formValue.app &&
			backend === BACKENDS.FUSION.name &&
			formValue.exportSettings.credentials
		) {
			setTabsValidated({
				...tabsValidated,
				tab2: true,
			});
		}
	}, [formValue?.app, formValue.exportSettings]);

	useEffect(() => {
		if (
			!tabsValidated.tab2 &&
			formValue.pipeline &&
			backend !== BACKENDS.FUSION.name &&
			formValue.exportSettings.credentials
		) {
			setTabsValidated({
				...tabsValidated,
				tab2: true,
			});
		}
	}, [formValue?.pipeline, formValue.exportSettings]);

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
		<div className={configureConnectionStyles}>
			<div className="description-container">
				Configure the data source and default security for your search app.
			</div>
			<div className="field-container">
				<div className="heading">Pipeline</div>
				<div className="field-description">
					A search engine backend is configured using a pipeline. You can choose an
					existing pipeline, you can also change or configure this later.
				</div>
				<EndpointDropdown form={control} formValue={formValue} isWizard />
			</div>
			<div className="field-container">
				<div className="heading">
					<span className="required-color">*</span> Default Security
				</div>
				<div className="field-description">
					Configure the default security that Search UI will use for connecting to the
					ReactiveSearch API server.
				</div>

				<FieldGroup name="exportSettings" strict={false}>
					{() => (
						<div className="button-container">
							<FieldControl name="credentials" strict={false}>
								{({ value, onChange }) => (
									<>
										<Button
											icon={<PlusOutlined />}
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
												control
													.get('headers')
													.setValue(
														`{"Authorization":"Basic ${btoa(
															val || '',
														)}"}`,
													);
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
														<div className={suggestionStyles}>
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
																<Tag>
																	{permission.ops[0]}{' '}
																	{permission.ops[1]
																		? `& ${permission.ops[1]}`
																		: ''}
																</Tag>
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
					backend={backend}
				/>
			</ErrorToaster>
		</div>
	);
};

ConfigureConnection.defaultProps = {
	tabsValidated: {},
	setTabsValidated: () => {},
	backend: BACKENDS.ELASTICSEARCH.name,
	formValue: {},
};

ConfigureConnection.propTypes = {
	tabsValidated: object,
	permissions: array.isRequired,
	handleCreatePermission: func.isRequired,
	fetchPermissions: func.isRequired,
	setTabsValidated: func,
	control: object.isRequired,
	backend: string,
	formValue: object,
};

const mapStateToProps = (state) => {
	const appPermissions = get(state, '$getAppPermissions.results.default');
	const backend = get(state, '$getAppPlan.results.backend');
	return {
		permissions: get(appPermissions, 'results', []),
		backend,
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchPermissions: (appName) => dispatch(getPermission(appName)),
	handleCreatePermission: (appName, payload) => dispatch(createPermission(appName, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConfigureConnection);
