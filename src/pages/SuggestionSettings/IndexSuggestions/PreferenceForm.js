import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Input, Select, Button, Affix, Switch, Popover, Icon, Form } from 'antd';
import { css } from 'react-emotion';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import keys from 'lodash/keys';
import {
	setLocalRelevancyState,
	getAppMappings,
	getDefaultSettings,
	getSettings,
	getAppStoredQueries,
} from '../../../batteries/modules/actions';
import { getTraversedMappingsByAppName } from '../../../batteries/modules/selectors';
import Grid from '../../../components/CreateCredentials/Grid';
import { removeWhiteSpaces } from '../../../utils';
import { suggestionsMessages as Messages } from '../../../utils/messages';
import SearchPreviewSwitcher from '../../../components/SearchPreviewSwitcher';
import MappingWrapper from '../../../components/MappingsWrapper/MappingsWrapper';
import styles from '../styles';
import conversionMap from '../../../utils/conversionMap';
import ReviewAndSave from '../../../components/ReviewAndSave';

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

const getDisabled = (value) => {
	if (Array.isArray(value)) return value[0] === '*';
	return false;
};

const InputElement = ({ name, label, toolTipMessage, inputProps, placeholder, onChange }) => (
	<FieldControl
		name={name}
		render={({ handler, invalid, touched, hasError, getError, value }) => (
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
								value={value}
								onChange={e => {
									onChange(e.target.value);
								}}
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
	state = { visible: false, aggregationField: undefined, customQueryField: '' };

	componentDidMount() {
		const {
			appName,
			getSettingsAction,
			getDefaultSettingsAction,
			defaultSettings,
			settings,
			localRelevancy,
			fetchStoredQueries,
		} = this.props;

		fetchStoredQueries();
		if (settings && !localRelevancy) {
			this.init({ ...settings });
		} else {
			getSettingsAction(appName);
		}
		if (!defaultSettings) getDefaultSettingsAction();
		this.getMappings();
	}

	toggleVisibility = () => {
		this.setState((prevState) => ({
			visible: !prevState.visible,
		}));
	};

	onAppSelect = (app) => {
		this.setState({ app, visible: true });
	};

	handleChange = (key, val, dataKey) => {
		const { appName, localRelevancy, updateLocalRelevancy } = this.props;
		let value = val;
		if (key === 'customStopwords') {
			value = val.split(',').map((i) => removeWhiteSpaces(i));
		}

		if (localRelevancy) {
			updateLocalRelevancy(appName, {
				...localRelevancy,
				[dataKey]: {
					...get(localRelevancy, dataKey),
					[key]: value,
				},
			});
		}
	};

	handleAggregationsChange = (name, value) => {
		const { localRelevancy, updateLocalRelevancy, appName } = this.props;
		updateLocalRelevancy(appName, {
			...localRelevancy,
			aggregations: {
				...get(localRelevancy, `aggregations`, {}),
				[name]: value,
			},
		});
	};

	init = (settings) => {
		const { appName, updateLocalRelevancy, localRelevancy } = this.props;
		if (!localRelevancy) {
			updateLocalRelevancy(appName, { ...settings });
		}
	};

	getMappings() {
		const { appName, fetchMappings, credentials, mappings } = this.props;
		if (credentials && get(mappings, 'length') === 0) {
			// Fetch Mappings if permissions are present
			fetchMappings(appName, credentials);
		}
	}

	updateToAggsField = ({ path, flattenType }) => {
		const { localRelevancy } = this.props;
		const { dataField } = get(localRelevancy, `aggregations`);
		const pathVal = get(flattenType, path) === 'text' ? `${path}.keyword` : path;

		const aggType = 'term';
		this.setState({ aggregationField: path });
		// this.handleAggregationsChange('dataField', { ...dataField, [pathVal]: aggType });
		this.handleChange('categoryField', path, 'indexSuggestions');
	};

	getAggsField = ({ flattenUsecase: usecases, flattenType: types }) => {
		const { localRelevancy } = this.props;
		const { dataField } = get(localRelevancy, `aggregations`);

		if (usecases && types) {
			const newAggsFields = Object.keys(types).reduce((agg, field) => {
				if (types[field] === 'text') {
					if (
						usecases[field] !== 'search' &&
						usecases[field] !== 'none' &&
						!get(dataField, `${field}.keyword`, null)
					) {
						return [...agg, field];
					}

					return [...agg];
				}

				if (!get(dataField, `${field}`, null) && conversionMap[types[field]]) {
					return [...agg, field];
				}
				return [...agg];
			}, []);

			return newAggsFields;
		}

		return [];
	};

	render() {
		const {
			control,
			handleSaveTemplate,
			isLoading,
			indices,
			apps,
			localRelevancy,
			mappings,
			appName,
			appStoredQueries,
		} = this.props;
		const { visible, app, aggregationField, customQueryField } = this.state;
		const filteredApps = keys(apps).filter((appName) => !appName.startsWith('.'));

		const {
			excludeFields,
			includeFields,
			showDistinctSuggestions,
			maxPredictedWords,
			customStopwords,
			size,
			customQuery,
			categoryField,
		} = get(localRelevancy, 'indexSuggestions', {
				excludeFields: [],
				includeFields: [],
				showDistinctSuggestions: false,
				maxPredictedWords: 0,
				customStopwords: [],
				size: 0,
				customQuery: '',
				categoryField: '',
			});


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
													const { settings } = this.props;
													this.init({ ...settings });
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
									component={
										<Switch
											{...handler()}
											onChange={val => {
												this.handleChange('showDistinctSuggestions', val, 'indexSuggestions')
											}}
									/>}
								/>
							)}
						/>
						<FieldControl
							name="enablePredictiveSuggestions"
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
									component={<Switch
										{...handler()}
										onChange={val => {
											this.handleChange('enablePredictiveSuggestions', val, 'indexSuggestions')
										}}
									/>}
								/>
							)}
						/>

						<FieldControl
							name="maxPredictedWords"
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Min Characters
											<Popover
												content={content(
													Messages.maxPredictedWords,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Input
											type="number"
											placeholder="Enter min count"
											onChange={(e) => {
												this.handleChange('maxPredictedWords', e.target.value, 'indexSuggestions')
												// handler.onChange(this.handleChange('numberOfDays', e.target.value, 'popularSuggestions'))
											}}
										/>
									}
								/>
							)}
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
									component={
									<Switch
										{...handler()}
										onChange={val => {
											this.handleChange('applyStopwords', val, 'indexSuggestions')
										}}
									/>
									}
								/>
							)}
						/>
						<FieldControl
							name="customStopwords"
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Set Custom Stopwords
											<Popover
												content={content(
													Messages.customStopwords,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Input
											type="number"
											placeholder="Enter min count"
											onChange={(e) => {
												this.handleChange('customStopwords', e.target.value, 'indexSuggestions')
												// handler.onChange(this.handleChange('numberOfDays', e.target.value, 'popularSuggestions'))
											}}
										/>
									}
								/>
							)}
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
									component={
										<Switch
											{...handler()}
											onChange={val => {
												this.handleChange('enableSynonyms', val, 'indexSuggestions')
											}}
										/>
									}
								/>
							)}
						/>
						<FieldControl
							name="size"
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Size
											<Popover
												content={content(
													Messages.size,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Input
											type="number"
											placeholder="Enter min count"
											onChange={(e) => {
												this.handleChange('size', e.target.value, 'indexSuggestions')
												// handler.onChange(this.handleChange('numberOfDays', e.target.value, 'popularSuggestions'))
											}}
										/>
									}
								/>
							)}
						/>
						<FieldControl
							name="includeFields"
							render={({ handler }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Include Fields
											<Popover
												content={content(
													Messages.includeFields,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Select
											{...handler()}
											placeholder="Select one ore more fields"
											mode="tags"
											notFoundContent={null}
											style={{ width: '100%' }}
											tokenSeparators={[',']}
											disabled={getDisabled(excludeFields)}
											data-cy="include-fields"
											showSearch
											onChange={(value) => {
												this.handleChange(
													'includeFields',
													calculateValue(value),
													'indexSuggestions',
												);
												handler().onChange(calculateValue(value));
											}}

										>
											<Select.Option key="*">* (Include all fields)</Select.Option>
											{(mappings || []).map((v) => {
												if (excludeFields && !excludeFields.includes(v)) {
													return (
														<Select.Option key={v} title={v}>
															{v}
														</Select.Option>
													);
												}
												return null;
											})}
										</Select>
									}
								/>
							)}
						/>
						<FieldControl
							name="exludeFields"
							render={({ handler }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Exclude Fields
											<Popover
												content={content(
													Messages.exludeFields,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Select
											{...handler()}
											placeholder="Select one ore more fields"
											mode="tags"
											notFoundContent={null}
											style={{ width: '100%' }}
											tokenSeparators={[',']}
											disabled={getDisabled(excludeFields)}
											data-cy="exclude-fields"
											showSearch
											onChange={(value) => {
												this.handleChange(
													'exludeFields',
													calculateValue(value),
													'indexSuggestions',
												);
												handler().onChange(calculateValue(value));
											}}

										>
											<Select.Option key="*">* (Exclude all fields)</Select.Option>
												{(mappings || []).map((v) => {
													if (includeFields && !includeFields.includes(v)) {
														return (
															<Select.Option key={v} title={v}>
																{v}
															</Select.Option>
														);
													}
													return null;
												})}
											</Select>
									}
								/>
							)}
						/>
						<FieldControl
							name="categoryField"
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Category Fields
											<Popover
												content={content(
													Messages.categoryField,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<MappingWrapper {...handler()}>
											{({ flattenUsecase, flattenType }) => (
												<React.Fragment>
													{localRelevancy &&
													this.getAggsField({ flattenUsecase, flattenType }).length >
														0 ? (
														<div
															style={{
																position: 'relative',
																display: 'inline-block',
															}}
															data-cy="aggregation-fields-dropdown"
														>
															<Select
																showSearch
																style={{ width: 300 }}
																value={value}
																placeholder="Add aggregation fields from schema"
																onChange={(field) => {
																	this.updateToAggsField({
																		path: field,
																		flattenType,
																	});
																	handler().onChange(field);
																}}
															>
																{this.getAggsField({
																	flattenUsecase,
																	flattenType,
																}).map((field) => (
																	<Select.Option key={field} value={field}>
																		{field}
																	</Select.Option>
																))}
															</Select>
														</div>
													) : null}
												</React.Fragment>
											)}
										</MappingWrapper>
									}
								/>
							)}
						/>
						{/* <Form.Item
							label={
								<p css={styles.labelContainer}>
									Category Fields
									<Popover
										content={content(Messages.categoryField)}
										css={styles.iconContainer}
									>
										<Icon type="info-circle" />
									</Popover>
								</p>
							}
						>
							<MappingWrapper>
								{({ flattenUsecase, flattenType }) => (
									<React.Fragment>
										{localRelevancy &&
										this.getAggsField({ flattenUsecase, flattenType }).length >
											0 ? (
											<div
												style={{
													position: 'relative',
													display: 'inline-block',
												}}
												data-cy="aggregation-fields-dropdown"
											>
												<Select
													showSearch
													style={{ width: 300 }}
													placeholder="Add aggregation fields from schema"
													value={aggregationField}
													onChange={(field) => {
														this.updateToAggsField({
															path: field,
															flattenType,
														});
													}}
												>
													{this.getAggsField({
														flattenUsecase,
														flattenType,
													}).map((field) => (
														<Select.Option key={field} value={field}>
															{field}
														</Select.Option>
													))}
												</Select>
											</div>
										) : null}
									</React.Fragment>
								)}
							</MappingWrapper>
						</Form.Item> */}

						{/* customQuery */}
						{/* <Form.Item
							label={
								<p css={styles.labelContainer}>
									Custom Query
									<Popover
										content={content(Messages.customQuery)}
										css={styles.iconContainer}
									>
										<Icon type="info-circle" />
									</Popover>
								</p>
							}
						>
							<Select
								placeholder="Select Custom Query"
								style={{ width: '100%' }}

								value={customQuery}
								optionLabelProp="label"

								onChange={(val) => {
									console.log(val);
									// this.setState({ customQueryField: val });
									this.handleChange('customQuery', val, 'indexSuggestions')
								}}
							>
								{(appStoredQueries || []).map((v) => {
									return (
										<Select.Option key={v.id} label={v.id} value={v.id}>
											<div>{v.id}</div>
											<div>{v.description}</div>
										</Select.Option>
									);
								})}
							</Select>
						</Form.Item> */}

						<FieldControl
							name="customQuery"
							render={({ handler, value }) => {
								const inputHandler = handler();

								return (
									<Grid
										label={
											<p css={styles.labelContainer}>
												Custom Query
												<Popover
													content={content(Messages.customQuery)}
													css={styles.iconContainer}
												>
													<Icon type="info-circle" />
												</Popover>
											</p>
										}
										component={
											<Select
												placeholder="Select Custom Query"
												style={{ width: '100%' }}
												{...inputHandler}
												optionLabelProp="label"
												onChange={(val) => {
													inputHandler.onChange(val);
													this.handleChange('customQuery', val, 'indexSuggestions')
												}}
											>
												{(appStoredQueries || []).map((v) => {
													return (
														<Select.Option key={v.id} label={v.id} value={v.id}>
															<div>{v.id}</div>
															<div>{v.description}</div>
														</Select.Option>
													);
												})}
											</Select>
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
								<ReviewAndSave />
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
	getSettingsAction: PropTypes.func.isRequired,
	getDefaultSettingsAction: PropTypes.func.isRequired,
	appStoredQueries: PropTypes.array.isRequired,
	fetchMappings: PropTypes.func.isRequired,
	apps: PropTypes.object,
	localRelevancy: null,
	appName: PropTypes.string,
	mappings: PropTypes.array,
};

PreferenceForm.defaultProps = {
	apps: {},
	mappings: []
};

const mapStateToProps = (state) => {
	const mappings = getTraversedMappingsByAppName(state);
	const parsedMappings = Array.isArray(mappings) ? mappings : get(mappings, '_doc', []);
	const appName = get(state, '$getCurrentApp.name');
	const { username, password } = get(state, 'user.data', {});

	return {
		// mappings: getTraversedMappingsByAppName(state),
		mappings: isEmpty(parsedMappings) ? [] : parsedMappings,
		isLoading: get(state, '$saveSuggestionsPreferences.isFetching', false),
		settings: get(state, ['$getAppSettings', 'settings', appName]),
		appName,
		apps: get(state, 'apps.data'),
		credentials: `${username}:${password}`,
		localRelevancy: get(state, ['$getLocalRelevancy', appName], null),
		appStoredQueries: get(state, ['$getAppStoredQueries', 'results'], []),
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
	getSettingsAction: (name) => dispatch(getSettings(name)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
	fetchStoredQueries: () => dispatch(getAppStoredQueries()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PreferenceForm);
