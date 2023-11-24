import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Select, Button, Switch, Input, Typography } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import Grid from '../../components/CreateCredentials/Grid';
import { cacheMessages as Messages } from '../../utils/messages';
import InputElement from '../../components/InputElement';

const calculateValue = (value) => {
	const index = value.indexOf('*');
	if (index > -1) {
		if (index === 0 && value.length !== 1) {
			value.splice(index, 1);
			return value;
		}
		return ['*'];
	}
	return value;
};

const modal = css`
	max-width: 800px;
	margin: 20px auto;
	background-color: #fff;
	padding: 50px 70px;
	width: 100%;
	.error {
		color: tomato;
		padding: 5px 0;
	}
	.input-error {
		border-color: tomato;
	}
`;

// Function to validate Redis address format
const validateRedisAddress = (value) => {
	const pattern = /^([^:]+)(:\d+)?$/; // Regex pattern to match "host" or "host:port"
	return pattern.test(value) || value === '';
};

const PreferenceForm = ({
	control,
	handleSaveTemplate,
	showRedisGroup,
	isLoading,
	apps,
	isSLS,
}) => {
	const indices = useMemo(
		() =>
			Object.keys(apps || {})
				.sort()
				.filter((i) => !i.startsWith('.')),
		[apps],
	);
	return (
		<FieldGroup
			control={control}
			strict={false}
			render={({ pristine, invalid: invalidForm }) => (
				<div className={modal}>
					<FieldControl
						name="enable_cache"
						render={({ handler }) => (
							<Grid
								label="Enable Caching"
								component={<Switch {...handler('checkbox')} />}
							/>
						)}
					/>
					<InputElement
						name="max_duration"
						label="Cache Duration"
						toolTipMessage={Messages.max_duration}
						inputProps={{
							style: {
								width: '200px',
							},
							addonAfter: 'Seconds',
						}}
					/>
					<InputElement
						name="max_size"
						label="Memory Limit"
						toolTipMessage={Messages.max_size}
						inputProps={{
							style: {
								width: '200px',
							},
							addonAfter: 'MB',
						}}
					/>
					<FieldControl
						name="indices"
						render={({ handler, value }) => {
							const inputHandler = handler();
							return (
								<Grid
									label="Indices"
									toolTipMessage={Messages.indices}
									component={
										<Select
											placeholder="Enter indices"
											mode="tags"
											style={{ width: '100%' }}
											tokenSeparators={[',']}
											value={value}
											{...inputHandler}
											onChange={(val) => {
												inputHandler.onChange(calculateValue(val));
											}}
										>
											<Select.Option value="*">All (*)</Select.Option>
											{indices
												.filter((i) => !i.startsWith('metricbeat'))
												.map((index) => (
													<Select.Option key={index}>
														{index}
													</Select.Option>
												))}
										</Select>
									}
								/>
							);
						}}
					/>
					{showRedisGroup && !isSLS && (
						<div
							style={{
								backgroundColor: 'rgb(245, 245, 245)',
								padding: '10px 20px',
								borderRadius: '4px',
							}}
						>
							<Typography.Title level={5} style={{ marginBottom: '20px' }}>
								Configure dedicated cache with Redis{' '}
								<span
									style={{
										backgroundColor: '#f5f5f5',
										fontFamily: 'monospace',
										fontSize: '12px',
										fontWeight: 'normal',
										padding: '2px 8px',
										marginLeft: '10px',
										borderRadius: '4px',
										border: '1px solid #dcdcdc',
									}}
								>
									New since v8.20.0
								</span>
							</Typography.Title>
							<FieldControl
								name="addr"
								render={({ handler, touched, hasError }) => (
									<Grid
										label="Redis Address"
										toolTipMessage={Messages.redisAddr}
										component={
											<Input
												{...handler()}
												name="addr"
												autoComplete="off"
												placeholder="localhost:6379"
												style={{ width: '100%' }}
												// Add validation status based on the touched state and if there's an error
												status={touched && hasError('format') && 'error'}
												// Helper text to show when there's an error
												help={
													touched &&
													hasError('format') &&
													'Invalid address format.'
												}
											/>
										}
									/>
								)}
								validators={{
									// Validate format only if the addr is not empty
									format: (value) => !value || validateRedisAddress(value),
								}}
							/>
							{/* Redis Password Input */}
							<InputElement
								name="redis-password"
								label="Redis Password"
								autoComplete="off"
								inputProps={{
									type: 'password',
									style: {
										width: '100%',
									},
									placeholder: 'Password (optional)',
								}}
							/>
							{/* Redis Database Input */}
							<InputElement
								name="database"
								label="Redis Database"
								inputProps={{
									type: 'number',
									style: {
										width: '100%',
									},
									placeholder: 'Database (default: 0)',
									min: 0, // Assuming Redis database index starts at 0
								}}
							/>
						</div>
					)}
					{showRedisGroup && isSLS && (
						<div
							style={{
								borderRadius: '4px',
							}}
						>
							<FieldControl
								name="addr"
								render={({ handler, touched, hasError }) => (
									<Grid
										label="Redis Address *"
										toolTipMessage={Messages.redisAddr}
										component={
											<Input
												{...handler()}
												name="addr"
												autoComplete="off"
												placeholder="my-cloud-redis:6379"
												style={{ width: '100%' }}
												// Add validation status based on the touched state and if there's an error
												status={touched && hasError('format') && 'error'}
												// Helper text to show when there's an error
												help={
													touched &&
													hasError('format') &&
													'Invalid address format.'
												}
											/>
										}
									/>
								)}
								validators={{
									// Validate format only if the addr is not empty
									format: (value) => !value || validateRedisAddress(value),
								}}
							/>
							{/* Redis Password Input */}
							<InputElement
								name="redis-password"
								label="Redis Password"
								autoComplete="off"
								inputProps={{
									type: 'password',
									style: {
										width: '100%',
									},
									placeholder: 'Password (optional)',
								}}
							/>
							{/* Redis Database Input */}
							<InputElement
								name="database"
								label="Redis Database"
								inputProps={{
									type: 'number',
									style: {
										width: '100%',
									},
									placeholder: 'Database (default: 0)',
									min: 0, // Assuming Redis database index starts at 0
								}}
							/>
						</div>
					)}
					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							padding: 20,
							background: 'white',
						}}
					>
						<Button
							onClick={handleSaveTemplate}
							size="large"
							type="primary"
							loading={isLoading}
							disabled={isLoading || invalidForm || pristine}
						>
							Save
						</Button>
					</div>
				</div>
			)}
		/>
	);
};

PreferenceForm.propTypes = {
	handleSaveTemplate: PropTypes.func.isRequired,
	control: PropTypes.object.isRequired,
	isLoading: PropTypes.bool.isRequired,
	showRedisGroup: PropTypes.bool,
	isSLS: PropTypes.bool.isRequired,
	apps: PropTypes.object,
};

PreferenceForm.defaultProps = {
	apps: {},
	showRedisGroup: false,
};

const mapStateToProps = (state) => ({
	isLoading: get(state, '$saveCachePreferences.isFetching', false),
	appName: get(state, '$getCurrentApp.name'),
	apps: get(state, 'apps.data'),
});
export default connect(mapStateToProps, null)(PreferenceForm);
