import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Input, Select, Button, Affix, Checkbox, Icon, Popover } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import keys from 'lodash/keys';
import Grid from '../../../components/CreateCredentials/Grid';
import Ace from '../../../batteries/components/SearchSandbox/containers/AceEditor';
import { suggestionsMessages as Messages } from '../../../utils/messages';
import SearchPreviewSwitcher from '../../../components/SearchPreviewSwitcher';
import styles from '../styles';

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
const content = (message) => {
	return <div>{message}</div>;
};

const InputElement = ({ name, label, toolTipMessage, inputProps, placeholder }) => (
	<FieldControl
		name={name}
		render={({ handler, invalid, touched, hasError, getError }) => (
			<Grid
				label={
					<p css={styles.labelContainer}>
						{label}
						<Popover content={content(toolTipMessage)} css={styles.iconContainer}>
							<Icon type="info-circle" />
						</Popover>
					</p>
				}
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

class PreferenceForm extends React.Component {
	state = { visible: false };

	toggleVisibility = () => {
		this.setState((prevState) => ({
			visible: !prevState.visible,
		}));
	};

	onAppSelect = (app) => {
		this.setState({ app, visible: true });
	};

	render() {
		const { control, handleSaveTemplate, isLoading, indices, apps } = this.props;
		const { visible, app } = this.state;
		const filteredApps = keys(apps).filter((appName) => !appName.startsWith('.'));
		return (
			<FieldGroup
				control={control}
				strict={false}
				render={({ pristine, invalid: invalidForm }) => (
					<div css={modal}>
						<FieldControl
							name="indices"
							render={({ handler, value }) => {
								const inputHandler = handler();
								return (
									<Grid
										label={
											<p css={styles.labelContainer}>
												Indices
												<Popover
													content={content(Messages.indices)}
													css={styles.iconContainer}
												>
													<Icon type="info-circle" />
												</Popover>
											</p>
										}
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
						<InputElement
							name="numberOfDays"
							label="Number of days"
							placeholder="Enter number of days"
							toolTipMessage={Messages.numberOfDays}
						/>
						<InputElement
							name="minCount"
							label="Min Count"
							placeholder="Enter min count"
							toolTipMessage={Messages.minCount}
						/>
						<InputElement
							name="minHits"
							label="Min Hits"
							placeholder="Enter min hits"
							toolTipMessage={Messages.minHits}
						/>
						<InputElement
							name="minCharacters"
							label="Min Characters"
							placeholder="Enter min characters"
							toolTipMessage={Messages.minCharacters}
						/>
						<FieldControl
							name="transformDiacritics"
							render={({ handler }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Transform Diacritics
											<Popover
												content={content(Messages.transformDiacritics)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<div style={{ width: '100%' }}>
											<div>
												<Checkbox {...handler('checkbox')} />
											</div>
										</div>
									}
								/>
							)}
						/>
						<InputElement
							name="size"
							label="Size"
							placeholder="Enter size of popular suggestions"
							toolTipMessage={Messages.size}
						/>
						<FieldControl
							name="blacklist"
							render={({ handler }) => {
								const inputHandler = handler();
								return (
									<Grid
										label={
											<p css={styles.labelContainer}>
												Blacklist
												<Popover
													content={content(Messages.blacklist)}
													css={styles.iconContainer}
												>
													<Icon type="info-circle" />
												</Popover>
											</p>
										}
										component={
											<Select
												placeholder="Enter blacklist queries"
												mode="tags"
												notFoundContent={null}
												style={{ width: '100%' }}
												tokenSeparators={[',']}
												{...inputHandler}
											/>
										}
									/>
								);
							}}
						/>
						<FieldControl
							name="externalSuggestions"
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
										label={
											<p css={styles.labelContainer}>
												External Suggestions
												<Popover
													content={content(Messages.externalSuggestions)}
													css={styles.iconContainer}
												>
													<Icon type="info-circle" />
												</Popover>
											</p>
										}
										component={
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
										}
									/>
								);
							}}
						/>
						<Affix offsetBottom={0}>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									padding: 20,
									background: 'white',
								}}
							>
								<SearchPreviewSwitcher
									filteredApps={filteredApps}
									onSelect={this.onAppSelect}
									onCancel={this.toggleVisibility}
									visible={visible}
									app={app}
								/>
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
						</Affix>
					</div>
				)}
			/>
		);
	}
}

PreferenceForm.propTypes = {
	handleSaveTemplate: PropTypes.func.isRequired,
	control: PropTypes.object.isRequired,
	isLoading: PropTypes.bool.isRequired,
	indices: PropTypes.array.isRequired,
	apps: PropTypes.object,
};

PreferenceForm.defaultProps = {
	apps: {},
};

const mapStateToProps = (state) => ({
	isLoading: get(state, '$saveSuggestionsPreferences.isFetching', false),
	appName: get(state, '$getCurrentApp.name'),
	apps: get(state, 'apps.data'),
});
export default connect(mapStateToProps, null)(PreferenceForm);
