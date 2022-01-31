import React, { useContext } from 'react';
import { Select, Form, Icon, Input, Popover } from 'antd';
import { bool, object } from 'prop-types';
import get from 'lodash/get';
import keys from 'lodash/keys';
import { connect } from 'react-redux';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { FormContext } from '../../utils';
import TextInput from '../../../../components/Form/Input';

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
							<div>
								<div style={{ margin: '10px 0px', color: 'rgba(0, 0, 0, 0.85)' }}>
									<span>
										API Credentials
										<Popover
											content={
												<div>
													API credentials allow secure UI access to the
													appbase.io cluster. Check docs at{' '}
													<a
														target="blank"
														href="https://docs.appbase.io/docs/security/credentials/"
													>
														here
													</a>
													. <br />
													You can get the API credentials from{' '}
													<a href="credentials">API Credentials</a> page
													under <strong>Access Control</strong>.
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
								<Input
									placeholder="Enter API credentials"
									value={form.get('exportSettings').get('credentials').value}
									onChange={(e) => {
										form.get('exportSettings')
											.get('credentials')
											.setValue(e.target.value);
									}}
								/>
							</div>
						</div>
					</div>
					<FieldControl strict={false} name="hasEdited">
						{({ handler }) =>
							handler().value && (
								<div
									style={{
										border: '1px solid rgb(219 210 210 / 65%)',
										margin: 10,
										padding: 20,
										display: 'flex',
										alignItems: 'center',
										gap: 20,
									}}
								>
									<Icon
										type="warning"
										theme="filled"
										style={{ color: '#f7c325', fontSize: 40 }}
									/>
									<p style={{ margin: 0 }}>
										{' '}
										{/* eslint-disable-next-line */}
										You've persisted code changes via code editor. Making
										further changes through the no-code configurator will these
										code changes.
									</p>
								</div>
							)
						}
					</FieldControl>
				</div>
			)}
		</FieldGroup>
	);
};

General.defaultProps = {
	apps: {},
	isRecommendation: false,
};

General.propTypes = {
	apps: object,
	isRecommendation: bool,
};

const mapStateToProps = (state) => ({
	apps: get(state, 'apps.data'),
});

export default connect(mapStateToProps, null)(General);
