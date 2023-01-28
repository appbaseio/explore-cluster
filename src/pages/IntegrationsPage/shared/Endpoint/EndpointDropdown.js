import React, { useState, useEffect } from 'react';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Select, Tag, Tooltip, Form } from 'antd';
import { array, bool, func, object, string } from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import get from 'lodash/get';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import EndpointModal from './EndpointModal';
import FusionFields from '../tabs/General/FusionFields';
import Flex from '../../../../batteries/components/shared/Flex';
import { endpointConfigStyles } from './styles';
import { BACKENDS } from '../../../../batteries/utils';
import { getPipelines } from '../../../../batteries/modules/actions';

const EndpointDropdown = ({
	pipelines,
	apps,
	formValue,
	form,
	fetchPipelines,
	backend,
	isPageLevel,
	endpointControl,
	isWizard,
}) => {
	const [filteredApps, setFilteredApps] = useState([]);
	const [customFields, setCustomFields] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const isFusion = backend === BACKENDS.FUSION.name;

	useEffect(() => {
		if (!pipelines.length) fetchPipelines();
	}, []);

	useEffect(() => {
		fetchAllApps();
	}, [apps]);

	const fetchAllApps = () => {
		setFilteredApps(Object.keys(apps || {}).filter((app) => !app.startsWith('.')));
	};

	const handlePipelineSelection = (pipeline) => {
		if (backend === BACKENDS.MONGODB.name) {
			const pipelineInfo = apps[pipeline];
			form.get('db').setValue(pipelineInfo.database);
			form.get('collection').setValue(pipelineInfo.collection);
		}
	};

	const getURL = (value) => {
		if (value && value.url) {
			return value.url;
		}
		if (isWizard) return '';

		if (backend === BACKENDS.MONGODB.name) return `/_mongodb/_reactivesearch`;

		if (value && value.pipeline) {
			return `/${value.pipeline}/_reactivesearch`;
		}
		return `/_fusion/_reactivesearch`;
	};

	const getMethod = () => {
		if (isWizard) return '';
		if (formValue && formValue.method && formValue.pipeline) return formValue.method;

		return 'POST';
	};

	const renderFusionFields = () => {
		return isPageLevel ? (
			<FieldGroup name="fusionSettings" strict={false}>
				{({ value: val }) => (
					<FusionFields
						filteredApps={filteredApps}
						control={val}
						styles={{ display: 'flex' }}
					/>
				)}
			</FieldGroup>
		) : (
			<FusionFields
				filteredApps={filteredApps}
				control={formValue}
				styles={{ display: 'flex' }}
			/>
		);
	};

	let pipelineRoutes = [];
	pipelines.forEach((pipeline) => {
		(pipeline.routes || []).forEach((data) => {
			pipelineRoutes = [...pipelineRoutes, { route: data, ...pipeline }];
		});
	});
	const method = getMethod();
	const url = getURL(formValue);
	const exportSettings = form.get('exportSettings') ? form.get('exportSettings').value : {};

	return (
		<div style={{ marginTop: 20 }} className={endpointConfigStyles}>
			<span style={{ margin: '5px 0px', display: 'block' }}>
				<>Configure Data Endpoint</>

				<Tooltip title="Data Endpoint is where you specify how the search UI fetches data.">
					<InfoCircleOutlined style={{ marginLeft: 5 }} />
				</Tooltip>
			</span>
			<div className="row-data">
				{isFusion ? (
					renderFusionFields()
				) : (
					<Form layout="vertical" style={{ display: 'flex', gap: 10, width: '100%' }}>
						<FieldControl strict={false} name={isPageLevel ? 'index' : 'pipeline'}>
							{({ handler }) => (
								<Form.Item
									style={{
										margin: 0,
										padding: 0,
										width: '30%',
									}}
									required
									label="Pipeline"
								>
									<Select
										{...handler()}
										value={handler().value || undefined}
										showSearch
										placeholder="Select an Index"
										style={{
											minWidth: 300,
										}}
									>
										{(filteredApps || [])
											.filter((k) => !k.includes('metricbeat'))
											.map((k) => (
												<Select.Option key={k}>
													<div
														onClick={() => {
															if (isWizard) {
																form.get('method').setValue('POST');
																if (
																	backend ===
																	BACKENDS.MONGODB.name
																)
																	form.get('url').setValue(
																		`/_mongodb/_reactivesearch`,
																	);
																else
																	form.get('url').setValue(
																		`/${k}/_reactivesearch`,
																	);
																form.get('headers').setValue(
																	`{"Authorization":"Basic ${btoa(
																		exportSettings.credentials ||
																			'',
																	)}"}`,
																);
															}
															handlePipelineSelection(k);
														}}
													>
														{backend === BACKENDS.MONGODB.name ? (
															<>
																<div>{apps[k].index}</div>
																<div>
																	{apps[k].database}.
																	{apps[k].collection}
																</div>
															</>
														) : (
															k
														)}
													</div>
												</Select.Option>
											))}
									</Select>
								</Form.Item>
							)}
						</FieldControl>
						<Form.Item
							required
							style={{
								margin: 0,
								padding: 0,
								width: '80%',
							}}
							label="Endpoint"
						>
							<Select
								showSearch
								placeholder="Select an Index"
								className="endpoint-dropdown"
								value={`${method} ${url}`}
								notFoundContent={
									<Button onClick={() => setShowForm(true)}>
										<PlusOutlined /> Enter your own endpoint
									</Button>
								}
							>
								{(pipelineRoutes || []).map((k, idx) => {
									const timestamp = k.updated_at || k.created_at;

									return (
										<Select.Option
											// eslint-disable-next-line
											key={`${k.route.path}-${k.id}-${idx}`}
											className={endpointConfigStyles}
										>
											<div
												onClick={() => {
													if (isPageLevel) {
														endpointControl
															.get('method')
															.setValue(k.route.method);
														endpointControl
															.get('url')
															.setValue(k.route.path);
														endpointControl
															.get('headers')
															.setValue(
																`{"Authorization":"Basic ${btoa(
																	exportSettings.credentials ||
																		'',
																)}"}`,
															);
													} else {
														form.get('method').setValue(k.route.method);
														form.get('url').setValue(k.route.path);
														form.get('headers').setValue(
															`{"Authorization":"Basic ${btoa(
																exportSettings.credentials || '',
															)}"}`,
														);
													}
												}}
											>
												<Flex justifyContent="space-between">
													<div className="overflow description-overflow">
														{k.route.method}&nbsp;
														<Tooltip title={k.route.path}>
															{k.route.path}
														</Tooltip>
													</div>
													<Tag>pipeline</Tag>
												</Flex>
												<Flex justifyContent="space-between">
													<div className="overflow description-overflow">
														<Tooltip title={k.description}>
															{k.description}
														</Tooltip>
													</div>
													<div>
														{moment
															.unix(timestamp)
															.format('ddd DD MMM, hh:mm A') || 'NA'}
													</div>
												</Flex>
											</div>
										</Select.Option>
									);
								})}
								{backend !== BACKENDS.MONGODB.name ? (
									(filteredApps || [])
										.filter((k) => !k.includes('metricbeat'))
										.map((k) => (
											<Select.Option
												key={`/${k}/_reactivesearch`}
												className={endpointConfigStyles}
											>
												<Flex
													justifyContent="space-between"
													onClick={() => {
														if (isPageLevel) {
															endpointControl
																.get('method')
																.setValue('POST');
															endpointControl
																.get('url')
																.setValue(`/${k}/_reactivesearch`);
															endpointControl
																.get('headers')
																.setValue(
																	`{"Authorization":"Basic ${btoa(
																		exportSettings.credentials ||
																			'',
																	)}"}`,
																);
														} else {
															form.get('method').setValue('POST');
															form.get('url').setValue(
																`/${k}/_reactivesearch`,
															);
															form.get('headers').setValue(
																`{"Authorization":"Basic ${btoa(
																	exportSettings.credentials ||
																		'',
																)}"}`,
															);
														}
													}}
												>
													<div className="overflow description-overflow">
														<Tooltip
															title={`POST /${k}/_reactivesearch`}
														/>
														POST /{k}/_reactivesearch
													</div>
													<Tag>index</Tag>
												</Flex>
											</Select.Option>
										))
								) : (
									<></>
								)}
								{(customFields || []).map((k, idx) => (
									<Select.Option
										// eslint-disable-next-line
										key={`${k.url}-${idx}`}
										className={endpointConfigStyles}
									>
										<div
											className="overflow description-overflow"
											onClick={() => {
												if (isPageLevel) {
													endpointControl
														.get('method')
														.setValue(k.method);
													endpointControl.get('url').setValue(k.path);
												} else {
													form.get('method').setValue(k.method);
													form.get('url').setValue(k.url);
												}
											}}
										>
											{k.method} &nbsp;
											<Tooltip title={k.url}>{k.url}</Tooltip>
										</div>
									</Select.Option>
								))}
								<Select.Option key="custom">
									<div onClick={() => setShowForm(true)}>
										<PlusOutlined /> Enter your own endpoint
									</div>
								</Select.Option>
							</Select>
						</Form.Item>
					</Form>
				)}
			</div>
			{isPageLevel ? (
				<FieldGroup name="endpoint" strict={false}>
					{(controls) => (
						<EndpointModal
							showForm={showForm}
							setShowForm={setShowForm}
							control={controls}
							setCustomFields={setCustomFields}
							customFields={customFields}
						/>
					)}
				</FieldGroup>
			) : (
				<EndpointModal
					showForm={showForm}
					setShowForm={setShowForm}
					control={form}
					setCustomFields={setCustomFields}
					customFields={customFields}
				/>
			)}
		</div>
	);
};

EndpointDropdown.defaultProps = {
	apps: {},
	pipelines: [],
	formValue: {},
	form: {},
	backend: BACKENDS.ELASTICSEARCH.name,
	isPageLevel: false,
	endpointControl: {},
	isWizard: false,
};

EndpointDropdown.propTypes = {
	apps: object,
	pipelines: array,
	fetchPipelines: func.isRequired,
	formValue: object,
	form: object,
	backend: string,
	isPageLevel: bool,
	endpointControl: object,
	isWizard: bool,
};

const mapStateToProps = (state) => ({
	apps: get(state, 'apps.data'),
	backend: get(state, '$getAppPlan.results.backend'),
	pipelines: get(state, '$getAppPipelines.results'),
});

const mapDispatchToProps = (dispatch) => ({
	fetchPipelines: () => dispatch(getPipelines(false)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EndpointDropdown);
