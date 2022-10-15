import React, { useContext } from 'react';
import { Select, Form, Icon, Popover } from 'antd';
import { bool, object } from 'prop-types';
import get from 'lodash/get';
import keys from 'lodash/keys';
import { connect } from 'react-redux';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { FormContext } from '../../utils';
import TextInput from '../../../../components/Form/Input';
import CredentialsModal from '../../Credentials/CredentialsModal';

const General = ({ apps, isRecommendation }) => {
	const form = useContext(FormContext);
	const filteredApps = keys(apps).filter((app) => !app.startsWith('.'));

	return (
		<FieldGroup control={form}>
			{() => (
				<div>
					<div css={{ maxWidth: 500 }}>
						<div css={{ display: 'grid', gridGap: 5 }}>
							<TextInput
								name="name"
								label="Name"
								inputProps={{
									placeholder: `${
										isRecommendation
											? 'Enter Recommendation UI name'
											: 'Enter Search UI name'
									}`,
								}}
								formItemProps={{
									style: {
										margin: 0,
										padding: 0,
									},
								}}
							/>
							<FieldControl strict={false} name="pipeline">
								{({ handler }) => (
									<Form.Item
										style={{
											margin: 0,
											padding: 0,
										}}
										required
										label="Main Pipeline"
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
													<Select.Option key={k}>{k}</Select.Option>
												))}
										</Select>
									</Form.Item>
								)}
							</FieldControl>

							<TextInput
								name="description"
								label="Description"
								inputProps={{
									placeholder: `${
										isRecommendation
											? 'Describe your Recommendation UI (optional)'
											: 'Describe your search UI (optional)'
									}`,
								}}
								formItemProps={{
									style: {
										margin: 0,
										padding: 0,
									},
								}}
							/>
							<FieldGroup control={form.get('exportSettings')}>
								{() => (
									<div>
										<div
											style={{
												margin: '10px 0px',
												color: 'rgba(0, 0, 0, 0.85)',
											}}
										>
											<span>
												API Credentials
												<Popover
													content={
														<div>
															API credentials allow secure UI access
															to the reactivesearch.io cluster. Check
															docs at{' '}
															<a
																target="blank"
																href="https://docs.appbase.io/docs/security/credentials/"
															>
																here
															</a>
															.
														</div>
													}
												>
													<Icon
														type="info-circle"
														style={{ marginLeft: '5px' }}
													/>
												</Popover>
											</span>
										</div>
										<FieldControl name="credentials" strict={false}>
											{({ value, onChange }) => (
												<CredentialsModal
													value={value}
													onChange={onChange}
												/>
											)}
										</FieldControl>
									</div>
								)}
							</FieldGroup>
						</div>
					</div>
				</div>
			)}
		</FieldGroup>
	);
};

General.defaultProps = {
	apps: {},
	isRecommendation: false,
	preferences: {},
};

General.propTypes = {
	apps: object,
	isRecommendation: bool,
	preferences: object,
};

const mapStateToProps = (state) => ({
	apps: get(state, 'apps.data'),
});

export default connect(mapStateToProps, null)(General);
