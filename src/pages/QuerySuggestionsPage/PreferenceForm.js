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
	.input-error {
		border-color: tomato;
	}
`;

const PreferenceForm = ({ control, handleSaveTemplate, isLoading }) => (
	<FieldGroup
		control={control}
		strict={false}
		render={() => (
			<div css={modal}>
				<FieldControl
					name="min_count"
					render={({ handler }) => (
						<Grid
							label="Min Count"
							toolTipMessage={Messages.min_count}
							component={
								<Input placeholder="Enter min count" type="number" {...handler()} />
							}
						/>
					)}
				/>
				<FieldControl
					name="number_of_days"
					render={({ handler }) => (
						<Grid
							label="Number of days"
							toolTipMessage={Messages.number_of_days}
							component={(
<Input
									placeholder="Enter number of days"
									type="number"
									{...handler()}
/>
)}
						/>
					)}
				/>
				<FieldControl
					name="min_hits"
					render={({ handler }) => (
						<Grid
							label="Min Hits"
							toolTipMessage={Messages.min_hits}
							component={
								<Input placeholder="Enter min hits" type="number" {...handler()} />
							}
						/>
					)}
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
/>
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
};

const mapStateToProps = state => ({
	isLoading: get(state, '$saveSuggestionsPreferences.isFetching', false),
});
export default connect(
	mapStateToProps,
	null,
)(PreferenceForm);
