import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Input, Select, Button, Switch } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import Grid from '../../components/CreateCredentials/Grid';
import { cacheMessages as Messages } from '../../utils/messages';

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

const InputElement = ({ name, label, toolTipMessage, inputProps, placeholder }) => (
	<FieldControl
		name={name}
		render={({ handler, invalid, touched, hasError, getError }) => (
			<Grid
				label={label}
				toolTipMessage={toolTipMessage}
				component={
					<div style={{ width: '100%' }}>
						<div>
							<Input
								className={touched && invalid ? 'input-error' : null}
								placeholder={placeholder}
								type="number"
								{...handler()}
								{...inputProps}
							/>
						</div>

						{touched && invalid && (
							<div className="error">
								{(hasError('required') &&
									`Please enter ${label.toLowerCase()} value.`) ||
									(hasError('min') &&
										`Minimum allowed value for ${label.toLowerCase()} is ${
											getError('min').min
										}.`) ||
									(hasError('max') &&
										`Maximum allowed value for ${label.toLowerCase()} is ${
											getError('max').max
										}.`)}
							</div>
						)}
					</div>
				}
			/>
		)}
	/>
);

InputElement.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	toolTipMessage: PropTypes.any,
	inputProps: PropTypes.object,
	placeholder: PropTypes.string,
};

InputElement.defaultProps = {
	toolTipMessage: undefined,
	inputProps: {},
	placeholder: undefined,
};

const PreferenceForm = ({ control, handleSaveTemplate, isLoading, apps }) => {
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
				<div css={modal}>
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
											{indices.map((index) => (
												<Select.Option key={index}>{index}</Select.Option>
											))}
										</Select>
									}
								/>
							);
						}}
					/>
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
	apps: PropTypes.object,
};

PreferenceForm.defaultProps = {
	apps: {},
};

const mapStateToProps = (state) => ({
	isLoading: get(state, '$saveCachePreferences.isFetching', false),
	appName: get(state, '$getCurrentApp.name'),
	apps: get(state, 'apps.data'),
});
export default connect(mapStateToProps, null)(PreferenceForm);
