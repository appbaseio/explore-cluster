import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Select, Switch, Popover, InputNumber, Modal, Button, Input, Form } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { getAppMappings, setSearchState } from '../../../../batteries/modules/actions';
import {
	getRawMappingsByAppName,
	getTraversedMappingsByAppName,
} from '../../../../batteries/modules/selectors';
import Grid from '../../../../components/CreateCredentials/Grid';
import { getDatafields } from '../../../../utils';
import { suggestionsMessages as Messages } from '../../../../utils/messages';
import styles from '../styles';
import CodeEditor from './CodeEditor';
import TextInput from '../../../../components/Form/Input';
import CodeEditorModal from './CodeEditorModal';
import { FormContext } from '../../../IntegrationsPage/utils';
import { FUNCTION_EDITOR_TABS_KEYS } from '../DesignAndLayout/SearchBoxPreview/AddSuggestionModal/FunctionEditor';
import { getURL } from '../../../../constants/config';
import { isJson } from '../../../../components/ScriptConsole/utils';

const gridRatio = 0.4;

const modal = css`
	max-width: 800px;
	margin: 20px auto;
	background-color: #fff;

	width: 100%;
	.error {
		color: tomato;
		padding: 5px 0;
	}
	.input-error {
		border-color: tomato;
	}
	.required-marker {
		color: red;
		font-size: 1rem;
	}
`;
const content = (message) => {
	return <div>{message}</div>;
};

class PreferenceForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalVisible: {
				endpoint: false,
				transformResponse: false,
			},
		};
	}

	componentDidMount() {
		const mainForm = this.context;
		const control = mainForm.get('endpoint');
		this.state.executionContext = {
			endpointResponse: [{ label: '', value: '' }],
			endpointPreferences: {
				...control.value.endpoint,
			},
		};

		const endpointControl = control.get('endpoint');

		this.fetchExecutionContextResponse(endpointControl.value);
	}

	getDisabled = (value) => {
		if (Array.isArray(value)) return value[0] === '*';
		return false;
	};

	getMappings() {
		const { appName, fetchMappings, credentials, mappings } = this.props;
		if (credentials && get(mappings, 'length') === 0) {
			// Fetch Mappings if permissions are present
			fetchMappings(appName, credentials);
		}
	}

	fetchExecutionContextResponse = (value) => {
		const mainForm = this.context;
		const endpointValue = { url: value.url, method: value.method };
		const control = mainForm.get('endpoint');
		if (isJson(value.headers) && value.headers !== '{}') {
			endpointValue.headers = JSON.parse(value.headers);
		}
		if (isJson(value.body) && value.body !== '{}') {
			endpointValue.body = JSON.parse(value.body);
		}

		fetch(`${getURL()}/non-existent-app/_reactivesearch.v3`, {
			method: 'POST',
			body: JSON.stringify({
				settings: {
					recordAnalytics: false,
					enableQueryRules: false,
				},
				query: [
					{
						id: 'search_box',
						type: 'search',
						endpoint: {
							...endpointValue,
							body: endpointValue.body || null,
						},
					},
				],
			}),
			headers: {
				Authorization: `Basic ${btoa(mainForm.value.credentials)}`,
				'content-type': 'application/json',
			},
		})
			.then((res) => {
				return res.json();
			})
			.then((parsedRes) => {
				if (parsedRes.search_box) {
					this.setState({
						executionContext: {
							endpointResponse: parsedRes.search_box,
							endpointPreferences: {
								...control.value.endpoint,
							},
						},
					});
				}
			})
			.catch((e) => {
				console.log(e);
			});
	};

	getAggregationFields = () => {
		const { rawMappings } = this.props;
		const { selectedIndices } = this.state;

		const [aggsFields] = getDatafields({
			mappings: rawMappings,
			indexes: selectedIndices,
			isAggs: true,
		});

		return aggsFields.filter((i) => i.includes('.keyword'));
	};

	render() {
		const mainForm = this.context;
		const control = mainForm.get('endpoint');
		const { designAndLayout = {} } = mainForm.value;
		const { mappings } = this.props;
		// eslint-disable-line
		const { modalVisible } = this.state;
		const mappingsFromIndices = [];
		const selectedIndices = control.value.indices;

		// eslint-disable-next-line no-unused-expressions
		selectedIndices?.map((index) => {
			if (mappings[index]) {
				mappings[index].forEach((mapping) => {
					if (!mappingsFromIndices.includes(mapping)) {
						mappingsFromIndices.push(mapping);
					}
				});
			}
		});

		return (
			<FieldGroup
				control={control}
				strict={false}
				render={(
					{ invalid: invalidForm, value: formValue, submitted }, // eslint-disable-line
				) => (
					<div className={modal} data-cy="index-suggestions-fields-container">
						<Grid
							label={
								<div>
									<span className="required-marker">*</span>
									Endpoint
								</div>
							}
							component={
								<FieldGroup
									name="endpoint"
									control={control.get('endpoint')}
									strict={false}
								>
									{(endpointControl) => {
										const showError =
											designAndLayout.enableEndpointSuggestions &&
											(submitted || endpointControl.touched) &&
											endpointControl.status === 'INVALID';
										return (
											<div>
												<Button
													onClick={() =>
														this.setState({
															modalVisible: { endpoint: true },
														})
													}
													className={showError ? 'input-error' : ''}
													icon={<EditOutlined />}
												>
													Specify Endpoint
												</Button>
												{showError ? (
													<div className="error">
														{endpointControl.touched
															? 'Field is invalid'
															: 'Field is required'}
													</div>
												) : null}
											</div>
										);
									}}
								</FieldGroup>
							}
							gridRatio={gridRatio}
						/>
						<Grid
							label={
								<div>
									<span className="required-marker">*</span>
									Transform Response
								</div>
							}
							component={
								<FieldControl
									name="transformResponse"
									control={control.get('transformResponse')}
									strict={false}
								>
									{(transformResponseControl) => {
										const showError =
											designAndLayout.enableEndpointSuggestions &&
											(submitted || transformResponseControl.touched) &&
											transformResponseControl.status === 'INVALID';
										return (
											<div>
												<Button
													onClick={() =>
														this.setState({
															modalVisible: {
																transformResponse: true,
															},
														})
													}
													className={showError ? 'input-error' : ''}
													icon={<EditOutlined />}
												>
													Define Function
												</Button>
												{showError ? (
													<div className="error">
														{transformResponseControl.touched
															? 'Field is invalid'
															: 'Field is required'}
													</div>
												) : null}
											</div>
										);
									}}
								</FieldControl>
							}
							gridRatio={gridRatio}
						/>
						<FieldGroup
							name="endpoint"
							control={control.get('endpoint')}
							strict={false}
						>
							{(endpointControl) => (
								<Modal
									visible={modalVisible.endpoint}
									onOk={() => {
										if (endpointControl.valid) {
											this.fetchExecutionContextResponse(
												endpointControl.value,
											);
										}

										this.setState({ modalVisible: { endpoint: false } });
									}}
									onCancel={() =>
										this.setState({ modalVisible: { endpoint: false } })
									}
									okButtonProps={{
										disabled:
											endpointControl.invalid || endpointControl.pristine,
									}}
									className={modal}
								>
									<FieldControl
										strict={false}
										name="url"
										control={endpointControl.get('url')}
									>
										{(endpointURLControl) => {
											const { errors, touched } = endpointURLControl;
											return (
												<div>
													<TextInput
														name="url"
														label={
															<span className={styles.labelContainer}>
																{' '}
																<span className="required-marker">
																	*
																</span>
																<span>URL</span>
																<Popover
																	content={content(
																		Messages.urlField,
																	)}
																	className={styles.iconContainer}
																>
																	<InfoCircleOutlined />
																</Popover>
															</span>
														}
														formItemProps={{ colon: false }}
														control={endpointURLControl}
													/>{' '}
													{touched && errors?.required ? (
														<div
															style={{ marginTop: -30 }}
															className="error"
														>
															URL field is required
														</div>
													) : null}
													{touched && errors?.invalidLink ? (
														<div
															className="error"
															style={{ marginTop: -30 }}
														>
															URL field is invalid
														</div>
													) : null}
												</div>
											);
										}}
									</FieldControl>
									<FieldControl
										strict={false}
										name="method"
										style={{ marginBottom: 0 }}
										control={endpointControl.get('method')}
									>
										{({ handler, errors, touched }) => {
											const showError = touched && errors?.required;
											return (
												<Form.Item
													label={
														<span className={styles.labelContainer}>
															<span className="required-marker">
																*
															</span>
															Method
															<Popover
																content={content(Messages.method)}
																className={styles.iconContainer}
															>
																<InfoCircleOutlined />
															</Popover>
														</span>
													}
													colon={false}
												>
													<Select
														{...handler()}
														className={showError ? 'input-error' : ''}
														style={{ width: '100%' }}
													>
														<Select.Option key="GET">GET</Select.Option>
														<Select.Option key="POST">
															POST
														</Select.Option>
														<Select.Option key="DELETE">
															DELETE
														</Select.Option>
														<Select.Option key="PUT">PUT</Select.Option>
													</Select>
													{showError ? (
														<div
															className="error"
															style={{ padding: 5 }}
														>
															This field is required
														</div>
													) : null}
												</Form.Item>
											);
										}}
									</FieldControl>
									<Form.Item
										label={
											<span className={styles.labelContainer}>
												Headers
												<Popover
													content={content(Messages.headers)}
													className={styles.iconContainer}
												>
													<InfoCircleOutlined />
												</Popover>
											</span>
										}
										colon={false}
									>
										<CodeEditor
											name="headers"
											strict={false}
											control={endpointControl.get('headers')}
											height={100}
										/>
									</Form.Item>
									<Form.Item
										label={
											<span className={styles.labelContainer}>
												Body
												<Popover
													content={content(Messages.body)}
													className={styles.iconContainer}
												>
													<InfoCircleOutlined />
												</Popover>
											</span>
										}
										colon={false}
									>
										<CodeEditor
											name="body"
											strict={false}
											control={endpointControl.get('body')}
											height={100}
										/>
									</Form.Item>
								</Modal>
							)}
						</FieldGroup>
						<FieldControl
							name="transformResponse"
							strict={false}
							control={control?.get('transformResponse')}
						>
							{(transformResponseControl) => (
								<CodeEditorModal
									defaultCode={
										transformResponseControl.value ||
										`function transformResponse(endpointResponse, endpointPreferences) {
  return endpointResponse.map((key) => ({
   "label": key.label,
   "value": key.value,
   "_type": "index" || "endpoint"
  }))
}`
									}
									// eslint-disable-next-line react/destructuring-assignment
									defaultExecutionContext={this.state.executionContext}
									allowedTabs={[
										FUNCTION_EDITOR_TABS_KEYS.CONSOLE_LOGS,
										FUNCTION_EDITOR_TABS_KEYS.EXECUTION_CONTEXT,
										FUNCTION_EDITOR_TABS_KEYS.RESPONSE_OUTPUT,
									]}
									language="javascript"
									visible={modalVisible.transformResponse}
									onCancel={() =>
										this.setState({
											modalVisible: {
												transformResponse: false,
											},
										})
									}
									customFunctionExecutor={(paramFunc, executionContext) => {
										return paramFunc(
											executionContext.endpointResponse,
											executionContext.endpointPreferences,
										);
									}}
									onSave={(code) => {
										this.setState({
											modalVisible: {
												transformResponse: false,
											},
										});
										transformResponseControl.handler().onChange(code);
									}}
								/>
							)}
						</FieldControl>
						<FieldControl
							name="showDistinctSuggestions"
							render={({ handler, value: checked }) => (
								<Grid
									label={
										<p className={styles.labelContainer}>
											Show Distinct Suggestions
											<Popover
												content={content(Messages.showDistinctSuggestions)}
												className={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Switch
											data-cy="show-distinct-suggestions"
											checked={checked}
											{...handler()}
											onChange={(val) => {
												handler().onChange(val);
											}}
										/>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="enablePredictiveSuggestions"
							render={({ handler, value: checked }) => (
								<Grid
									label={
										<p className={styles.labelContainer}>
											Enable Predictive Suggestions
											<Popover
												content={content(
													Messages.enablePredictiveSuggestions,
												)}
												className={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Switch
											data-cy="enable-predictive-suggestions"
											checked={checked}
											{...handler()}
											onChange={(val) => {
												handler().onChange(val);
											}}
										/>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="maxPredictedWords"
							render={({ handler, value, touched, errors }) => {
								const showError =
									(submitted || touched) &&
									(errors?.required || errors?.invalidLink);

								return (
									<Grid
										label={
											<p className={styles.labelContainer}>
												<span className="required-marker">*</span>
												<span>Max predicted words</span>
												<Popover
													content={content(Messages.maxPredictedWords)}
													className={styles.iconContainer}
												>
													<InfoCircleOutlined />
												</Popover>
											</p>
										}
										component={
											<div>
												<InputNumber
													{...handler()}
													className={showError ? 'input-error' : ''}
													style={{ width: '100%' }}
													defaultValue={value}
													value={value}
													min={1}
													max={1000}
												/>
												{showError && (
													<div className="error">
														This is a required field
													</div>
												)}
											</div>
										}
										gridRatio={gridRatio}
									/>
								);
							}}
						/>
						<FieldControl
							name="applyStopwords"
							render={({ handler, value: checked }) => (
								<Grid
									label={
										<p className={styles.labelContainer}>
											Apply Default Stopwords
											<Popover
												content={content(Messages.applyStopwords)}
												className={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Switch
											data-cy="apply-stopwords"
											checked={checked}
											{...handler()}
											onChange={(val) => {
												handler().onChange(val);
											}}
										/>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="customStopwords"
							render={({ handler, value: stopWords }) => (
								<Grid
									label={
										<p className={styles.labelContainer}>
											Set Custom Stopwords
											<Popover
												content={content(Messages.customStopwords)}
												className={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Select
											data-cy="custom-stopwords"
											{...handler()}
											defaultValue={stopWords}
											value={stopWords}
											placeholder="Enter custom stopwords"
											mode="tags"
											notFoundContent={null}
											style={{ width: '100%' }}
											tokenSeparators={[',']}
											onChange={(val) => {
												handler().onChange(val);
											}}
										/>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="enableSynonyms"
							render={({ handler, value: checked }) => (
								<Grid
									label={
										<p className={styles.labelContainer}>
											Enable Synonyms
											<Popover
												content={content(Messages.enableSynonyms)}
												className={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Switch
											data-cy="enable-synonyms"
											checked={checked}
											{...handler()}
											onChange={(val) => {
												handler().onChange(val);
											}}
										/>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="includeFields"
							strict={false}
							render={({ handler, value: includeFields }) => (
								<Grid
									label={
										<p
											className={styles.labelContainer}
											data-cy="include-fields-label"
										>
											Include Fields
											<Popover
												content={content(Messages.includeFields)}
												className={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Select
											{...handler()}
											defaultValue={includeFields}
											value={includeFields}
											placeholder="Enter fields to include"
											mode="tags"
											notFoundContent={null}
											style={{ width: '100%' }}
											tokenSeparators={[',']}
											onChange={(val) => {
												if (val.includes('*')) {
													handler().onChange(['*']);
												} else {
													handler().onChange(val);
												}
											}}
										/>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="excludeFields"
							strict={false}
							render={({ handler, value: excludeFields }) => (
								<Grid
									label={
										<p
											className={styles.labelContainer}
											data-cy="exclude-fields-label"
										>
											Exclude Fields
											<Popover
												content={content(Messages.excludeFields)}
												className={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Select
											{...handler()}
											defaultValue={excludeFields}
											value={excludeFields}
											disabled={formValue.includeFields?.length}
											placeholder="Enter fields to exclude"
											mode="tags"
											notFoundContent={null}
											style={{ width: '100%' }}
											tokenSeparators={[',']}
											onChange={(val) => {
												if (val.includes('*')) {
													handler().onChange(['*']);
												} else {
													handler().onChange(val);
												}
											}}
										/>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							strict={false}
							name="urlField"
							control={control.get('urlField')}
							render={(endpointURLControl) => {
								const { errors, touched, handler } = endpointURLControl;
								const showError = (submitted || touched) && errors?.invalidLink;
								return (
									<Grid
										label={
											<span className={styles.labelContainer}>
												URL
												<Popover
													content={content(Messages.urlField)}
													className={styles.iconContainer}
												>
													<InfoCircleOutlined />
												</Popover>
											</span>
										}
										component={
											<div>
												<Input
													{...handler()}
													className={showError ? 'input-error' : ''}
												/>
											</div>
										}
										gridRatio={gridRatio}
									/>
								);
							}}
						/>
					</div>
				)}
			/>
		);
	}
}

PreferenceForm.contextType = FormContext;

PreferenceForm.propTypes = {
	fetchMappings: PropTypes.func.isRequired,
	initialData: PropTypes.object.isRequired,
	appName: PropTypes.string,
	mappings: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object, // at cluster level
	]),
	rawMappings: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	credentials: PropTypes.string.isRequired,
	isFetchingMappings: PropTypes.bool.isRequired,
	saveState: PropTypes.func.isRequired,
	searchState: PropTypes.object,
};

PreferenceForm.defaultProps = {
	mappings: [],
	rawMappings: [],
	appName: undefined,
	searchState: null,
};

const mapStateToProps = (state) => {
	const mappings = getTraversedMappingsByAppName(state);
	const rawMappings = getRawMappingsByAppName(state);
	const appName = get(state, '$getCurrentApp.name');
	const { username, password } = get(state, 'user.data', {});

	return {
		mappings,
		rawMappings,
		isFetchingMappings: get(state, '$getAppMappings.isFetching', false),
		appName,
		credentials: `${username}:${password}`,
		searchState: get(state, '$getSearchState.searchState', null),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
	saveState: (state) => dispatch(setSearchState(state)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PreferenceForm);
