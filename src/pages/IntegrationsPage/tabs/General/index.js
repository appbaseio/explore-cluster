import React, { useContext } from 'react';
import { Select, Form, Icon } from 'antd';
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
										You've persisted code changes via Code Editor. Making
										further changes through the no-code onfiguirator will
										overwrite your code changes.
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
