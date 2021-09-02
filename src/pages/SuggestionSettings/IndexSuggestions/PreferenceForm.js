import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Input, Select, Button, Affix, Switch, Popover, Icon } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import keys from 'lodash/keys';
import Grid from '../../../components/CreateCredentials/Grid';
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
						<FieldControl
							name="showDistinctSuggestions"
							render={({ handler }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Show Distinct Suggestions
											<Popover
												content={content(Messages.showDistinctSuggestions)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={<Switch {...handler('checkbox')} />}
								/>
							)}
						/>
						<FieldControl
							name="enable_predictive_suggestions"
							render={({ handler }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Enable Predictive Suggestions
											<Popover
												content={content(
													Messages.enable_predictive_suggestions,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={<Switch {...handler('checkbox')} />}
								/>
							)}
						/>
						<InputElement
							name="max_predicted_words"
							label="Max Predicted Words"
							placeholder="Enter max predicted words"
							toolTipMessage={Messages.max_predicted_words}
						/>
						<FieldControl
							name="applyStopwords"
							render={({ handler }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Apply Default Stopwords
											<Popover
												content={content(Messages.applyStopwords)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={<Switch {...handler('checkbox')} />}
								/>
							)}
						/>
						{/* <Input.TextArea
							placeholder="Add comma separated stopwords"
							value={customStopwords.join(', ')}
							onChange={(e) =>
								this.handleChange('customStopwords', e.target.value)
							}
						/> */}
						<InputElement
							name="customStopwords"
							label="Set Custom Stopwords"
							placeholder="Add comma separated stopwords"
							toolTipMessage={Messages.customStopwords}
						/>
						<FieldControl
							name="enableSynonyms"
							render={({ handler }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Enable Synonyms
											<Popover
												content={content(Messages.enableSynonyms)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={<Switch {...handler('checkbox')} />}
								/>
							)}
						/>
						{/* Category Fields */}
						<InputElement
							name="size"
							label="Size"
							placeholder="Enter size of index suggestions"
							toolTipMessage={Messages.size}
						/>
						{/* <FieldControl
							strict={false}
							name="includeFields"
							render={({ handler,value }) => {
								const inputHandler = handler();
								const uniqueMappings = {};
								return (
									<Grid
										label={
											<span >
												Include
											</span>
										}
										toolTipMessage={Messages.include}
										component={
											<Select
												placeholder="Select field value"
												mode="multiple"
												notFoundContent={null}
												style={{
													width: '100%',
												}}
												tokenSeparators={[',']}
												{...inputHandler}
												value={inputHandler.value || []}
												onChange={(value) => {
													inputHandler.onChange(
														calculateValue(value),
													);
												}}
											>
												<Option key="*">
													* (Include all fields)
												</Option>
												{this.isApp
													? mappings.map((v) => {
															if (
																!(
																	excludedFields ||
																	[]
																).includes(v)
															) {
																return (
																	<Option
																		key={v}
																		title={
																			v
																		}
																	>
																		{v}
																	</Option>
																);
															}
															return null;
														})
													: Object.keys(
															filteredMappings,
														).map((i) =>
															filteredMappings[
																i
															].map((v) => {
																// duplicate keys cause re-rendering issues
																if (
																	uniqueMappings[
																		v
																	]
																) {
																	return null;
																}
																uniqueMappings[
																	v
																] = true;
																if (
																	!(
																		excludedFields ||
																		[]
																	).includes(
																		v,
																	)
																) {
																	return (
																		<Option
																			key={
																				v
																			}
																			value={
																				v
																			}
																			title={
																				v
																			}
																		>
																			{v}
																			<span
																				css={
																					styles.fieldBadge
																				}
																			>
																				{
																					i
																				}
																			</span>
																		</Option>
																	);
																}
																return null;
															}),
														)}
											</Select>
										}
									/>
								);
							}}
						/> */}
						{/* <FieldControl
							strict={false}
							name="excludeFields"
							render={({ handler }) => {
								const inputHandler = handler();
								const includedFields = this.form.get(
									'includeFields',
								).value;
								const uniqueMappings = {};
								return (
									<Grid
										label={
											<span css={styles.subHeader}>
												Exclude
											</span>
										}
										toolTipMessage={Messages.exclude}
										component={
											<Select
												placeholder="Select field value"
												mode="multiple"
												notFoundContent={null}
												style={{ width: '100%' }}
												{...inputHandler}
												value={inputHandler.value || []}
												onChange={(value) => {
													inputHandler.onChange(
														calculateValue(value),
													);
												}}
											>
												<Option key="*">
													* (Exclude all fields)
												</Option>
												{this.isApp
													? mappings.map((v) => {
															if (
																!(
																	includedFields ||
																	[]
																).includes(v)
															) {
																return (
																	<Option
																		key={v}
																		title={
																			v
																		}
																	>
																		{v}
																	</Option>
																);
															}
															return null;
														})
													: Object.keys(
															filteredMappings,
														).map((i) =>
															filteredMappings[
																i
															].map((v) => {
																// duplicate keys cause re-rendering issues
																if (
																	uniqueMappings[
																		v
																	]
																) {
																	return null;
																}
																uniqueMappings[
																	v
																] = true;
																if (
																	!(
																		includedFields ||
																		[]
																	).includes(
																		v,
																	)
																) {
																	return (
																		<Option
																			key={
																				v
																			}
																			title={
																				v
																			}
																		>
																			{v}
																			<span
																				css={
																					styles.fieldBadge
																				}
																			>
																				{
																					i
																				}
																			</span>
																		</Option>
																	);
																}
																return null;
															}),
														)}
											</Select>
										}
									/>
								);
							}}
						/> */}
						{/* customQuery */}

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
