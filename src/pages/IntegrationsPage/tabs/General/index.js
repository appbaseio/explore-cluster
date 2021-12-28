import React, { useContext } from 'react';
import { Select, Form } from 'antd';
import { object } from 'prop-types';
import get from 'lodash/get';
import keys from 'lodash/keys';
import { connect } from 'react-redux';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { FormContext } from '../../utils';
import TextInput from '../../../../components/Form/Input';

const General = ({ apps }) => {
	const form = useContext(FormContext);
	const filteredApps = keys(apps).filter((app) => !app.startsWith('.'));
	return (
		<FieldGroup control={form}>
			{() => (
				<div css={{ maxWidth: 500 }}>
					<div css={{ display: 'grid', gridGap: 5 }}>
						<TextInput
							name="name"
							label="Name"
							inputProps={{
								placeholder: 'Enter preference name',
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
								placeholder: 'Describe preference',
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
			)}
		</FieldGroup>
	);
};

General.defaultProps = {
	apps: {},
};

General.propTypes = {
	apps: object,
};

const mapStateToProps = (state) => ({
	apps: get(state, 'apps.data'),
});

export default connect(mapStateToProps, null)(General);
