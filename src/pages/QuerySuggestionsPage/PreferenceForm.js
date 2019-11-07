import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Input, Select, Button } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import Grid from '../../components/CreateCredentials/Grid';
import Ace from '../../batteries/components/SearchSandbox/containers/AceEditor';
import { suggestionsMessages as Messages } from '../../utils/messages';

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

const InputElement = ({
 name, label, toolTipMessage, inputProps, placeholder,
}) => (
	<FieldControl
		name={name}
		render={({
 handler, invalid, touched, hasError, getError,
}) => (
			<Grid
				label={label}
				toolTipMessage={toolTipMessage}
				component={(
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
								{(hasError('required')
									&& `Please enter ${label.toLowerCase()} value.`)
									|| (hasError('min')
										&& `Minimum allowed value for ${label.toLowerCase()} is ${
											getError('min').min
										}.`)
									|| (hasError('max')
										&& `Maximum allowed value for ${label.toLowerCase()} is ${
											getError('max').max
										}.`)}
							</div>
						)}
</div>
)}
			/>
		)}
	/>
);

const PreferenceForm = ({
 control, handleSaveTemplate, isLoading, indices,
}) => (
	<FieldGroup
		control={control}
		strict={false}
		render={({ pristine, invalid: invalidForm }) => (
			<div css={modal}>
				<InputElement
					name="min_count"
					label="Min Count"
					placeholder="Enter min count"
					toolTipMessage={Messages.min_count}
				/>
				<InputElement
					name="number_of_days"
					label="Number of days"
					placeholder="Enter number of days"
					toolTipMessage={Messages.number_of_days}
				/>
				<InputElement
					name="min_hits"
					label="Min Hits"
					placeholder="Enter min hits"
					toolTipMessage={Messages.min_hits}
				/>
				<FieldControl
					name="indices"
					render={({ handler, value }) => {
						const inputHandler = handler();
						return (
							<Grid
								label="Indices"
								toolTipMessage={Messages.indices}
								component={(
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
										{indices.map(index => (
											<Select.Option key={index}>{index}</Select.Option>
										))}
</Select>
)}
							/>
						);
					}}
				/>
				<FieldControl
					name="blacklist"
					render={({ handler }) => {
						const inputHandler = handler();
						return (
							<Grid
								label="Blacklist"
								toolTipMessage={Messages.blacklist}
								component={(
<Select
										placeholder="Enter blacklist queries"
										mode="tags"
										notFoundContent={null}
										style={{ width: '100%' }}
										tokenSeparators={[',']}
										{...inputHandler}
/>
)}
							/>
						);
					}}
				/>
				<FieldControl
					name="external_suggestions"
					render={({ handler }) => {
						const inputHandler = handler();
						return (
							<Grid
								// toolTipMessage={queryMessage}
								toolTipProps={{
									overlayClassName: css`
										width: 500px;
										max-width: 500px;
										.ant-tooltip-inner {
											background-color: #000;
										}
									`,
								}}
								toolTipMessage={Messages.external_suggestions}
								label="External Suggestions"
								component={(
<Ace
										defaultValue=""
										mode="json"
										value={
											typeof inputHandler.value === 'string'
												? inputHandler.value
												: JSON.stringify(inputHandler.value, 0, 2)
										}
										onChange={inputHandler.onChange}
										theme="monokai"
										name="editor-JSON"
										fontSize={16}
										showPrintMargin
										style={{
											width: '100%',
											maxWidth: 800,
											maxHeight: 250,
										}}
										readOnly={inputHandler.disabled}
										showGutter
										highlightActiveLine
										setOptions={{
											showLineNumbers: true,
											tabSize: 2,
										}}
										editorProps={{
											$blockScrolling: true,
										}}
/>
)}
							/>
						);
					}}
				/>
				<Button
					onClick={handleSaveTemplate}
					style={{ float: 'right' }}
					size="large"
					type="primary"
					loading={isLoading}
					disabled={isLoading || invalidForm || pristine}
				>
					Save
				</Button>
			</div>
		)}
	/>
);

PreferenceForm.propTypes = {
	handleSaveTemplate: PropTypes.func.isRequired,
	control: PropTypes.object.isRequired,
	isLoading: PropTypes.bool.isRequired,
	indices: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
	isLoading: get(state, '$saveSuggestionsPreferences.isFetching', false),
});
export default connect(
	mapStateToProps,
	null,
)(PreferenceForm);
