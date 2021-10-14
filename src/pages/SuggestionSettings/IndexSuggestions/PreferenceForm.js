import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Input, Select, Button, Affix, Switch, Popover, Icon } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import keys from 'lodash/keys';
import {
	getAppMappings,
	getAppStoredQueries,
} from '../../../batteries/modules/actions';
import { getRawMappingsByAppName, getTraversedMappingsByAppName } from '../../../batteries/modules/selectors';
import Grid from '../../../components/CreateCredentials/Grid';
import { removeWhiteSpaces, getDatafields } from '../../../utils';
import { suggestionsMessages as Messages } from '../../../utils/messages';
import SearchPreviewSwitcher from '../../../components/SearchPreviewSwitcher';
import styles from '../styles';
import Footer from '../Footer';

const gridRatio = 0.40;
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

class PreferenceForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
			selectedIndices: props.indices,
			aggregationFields: [],
			indexSuggestions: props.initialData,
			isFetching: true,
		};
	}

	componentDidMount() {
		const {
			fetchStoredQueries,
		} = this.props;

		fetchStoredQueries();
		this.getMappings();
	}

	componentDidUpdate(prevProps) {
		const { rawMappings, initialData } = this.props;
		if (rawMappings && prevProps.rawMappings !== rawMappings) {
			this.getAggregationFields();
		}

		if (prevProps.initialData !== initialData) {
			this.setState({
				indexSuggestions: initialData
			})
		}
	}

	onAppSelect = (app) => {
		this.setState({ app, visible: true });
	};

	getMappings() {
		const { appName, fetchMappings, credentials, mappings } = this.props;
		if (credentials && get(mappings, 'length') === 0) {
			// Fetch Mappings if permissions are present
			fetchMappings(appName, credentials);
		}
	}

	handleChange = (key, val, dataKey) => {
		console.log(key, val, "vguiougfchui");
		let value = val;
		if (key === 'customStopwords') {
			value = val.split(',').map((i) => removeWhiteSpaces(i));
		}
		const { indexSuggestions } = this.state;
		const newIndexSuggestions = {
			...indexSuggestions,
			[key]: value,
		}
		this.setState({
			indexSuggestions: newIndexSuggestions
		})
	};

	toggleVisibility = () => {
		this.setState((prevState) => ({
			visible: !prevState.visible,
		}));
	};

	getAggregationFields = () => {
		const { rawMappings } =  this.props
		const { selectedIndices } = this.state;

		const [aggsFields] = getDatafields({
			mappings: rawMappings,
			indexes: selectedIndices,
			isAggs: true,
		});
		const newAggregationFields = aggsFields.filter(i => i.includes(".keyword"));
		this.setState({aggregationFields: newAggregationFields});
	}


	render() {
		const {
			control,
			handleSaveTemplate,
			isLoading,
			indices,
			apps,
			initialData,
			mappings,
			appStoredQueries,
		} = this.props;
		const {
			visible,
			app,
			aggregationFields,
			indexSuggestions,
			selectedIndices,
			isFetching
		} = this.state;
		let mappingsFromIndices = [];

		const filteredApps = keys(apps).filter((appName) => !appName.startsWith('.'));
		selectedIndices?.map(index => {
			if(mappings[index]) {
				mappingsFromIndices = [...mappingsFromIndices, ...mappings[index]];
			}
		});

		let categoryFields = aggregationFields;
		let excludeFields = [...new Set(indexSuggestions?.excludeFields)];
		let includeFields = [...new Set(indexSuggestions?.includeFields)];
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
											<p css={styles.labelContainer} data-cy="indices-label">
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
												data-cy="index-suggestions-indices"
												placeholder="Enter indices"
												mode="tags"
												style={{ width: '100%' }}
												tokenSeparators={[',']}
												value={value}
												{...inputHandler}
												onChange={(val) => {
													this.handleChange('indices', val, 'indexSuggestions')
													inputHandler.onChange(calculateValue(val));
													this.setState({
														selectedIndices: val,
													});
													this.getAggregationFields();
												}}
											>
												<Select.Option value="*">All (*)</Select.Option>
												{indices
													.filter((i) => !i.startsWith('metricbeat') && !i.startsWith('.'))
													.map((index) => (
														<Select.Option key={index} data-cy={index}>
															{index}
														</Select.Option>
													))}
											</Select>
										}
										gridRatio={gridRatio}
									/>
								);
							}}
						/>
						<FieldControl
							name="showDistinctSuggestions"
							render={({ handler, value }) => (
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
											data-cy="show-distinct-suggestions"
											checked={value}
											{...handler()}
											onChange={val => {
												console.log(val, "distinct-toggle");
												this.handleChange('showDistinctSuggestions', val, 'indexSuggestions')
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
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Enable Predictive Suggestions
											<Popover
												content={content(
													Messages.enablePredictiveSuggestions,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={<Switch
										data-cy="enable-predictive-suggestions"
										checked={value}
										{...handler()}
										onChange={val => {
											this.handleChange('enablePredictiveSuggestions', val, 'indexSuggestions')
											handler().onChange(val);
										}}
									/>}
									gridRatio={gridRatio}
								/>
							)}
						/>

						<FieldControl
							name="maxPredictedWords"
							render={({ handler, value }) => {
								const inputHandler = { ...handler() };

								return (
									<Grid
										label={
											<p css={styles.labelContainer}>
												Max Predicted Words
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
												data-cy="max-predicted-words"
												{...inputHandler}
												defaultValue={value}
												type="number"
												placeholder="Enter max predicted words"
												value={value}
												onChange={(e) => {
													this.handleChange('maxPredictedWords', e.target.value, 'indexSuggestions')
													inputHandler.onChange(e.target.value)
												}}
											/>
										}
										gridRatio={gridRatio}
									/>
								)
							}}
						/>

						<FieldControl
							name="applyStopwords"
							render={({ handler, value }) => (
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
											data-cy="apply-stopwords"
											checked={value}
											{...handler()}
											onChange={val => {
												this.handleChange('applyStopwords', val, 'indexSuggestions')
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
											data-cy="custom-stopwords"
											{ ...handler() }
											defaultValue={value?.join(',') || ''}
											value={value?.join(',') || ''}
											placeholder="Enter custom stopwords"
											onChange={(e) => {
												this.handleChange('customStopwords', e.target.value, 'indexSuggestions')
												handler().onChange(e.target.value.split(','))
											}}
										/>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="enableSynonyms"
							render={({ handler, value }) => (
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
										 	data-cy="enable-synonyms"
											checked={value}
											{...handler()}
											onChange={val => {
												this.handleChange('enableSynonyms', val, 'indexSuggestions')
												handler().onChange(val);
											}}
										/>
									}
									gridRatio={gridRatio}
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
													Messages.index_size,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Input
											data-cy="index-suggestions-size"
											{...handler()}
											defaultValue={value}
											value={value}
											type="number"
											placeholder="Enter size"
											onChange={(e) => {
												this.handleChange('size', e.target.value, 'indexSuggestions')
												handler().onChange(e.target.value);
											}}
										/>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="includeFields"
							render={({ handler }) => (
								<Grid
									label={
										<p css={styles.labelContainer} data-cy="include-fields-label">
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
											loading={false}
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
											<Select.Option
												key="*"
											>* (Include all fields)</Select.Option>
											{(mappingsFromIndices || []).map((v) => {
												if (excludeFields && !excludeFields.includes(v)) {
													return (
														<Select.Option
															key={v}
															title={v}
															data-cy={v}
														>
															{v}
														</Select.Option>
													);
												}
												return null;
											})}
										</Select>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="excludeFields"
							render={({ handler }) => (
								<Grid
									label={
										<p css={styles.labelContainer} data-cy="exclude-fields-label">
											Exclude Fields
											<Popover
												content={content(
													Messages.excludeFields,
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
											loading={false}
											placeholder="Select one ore more fields"
											mode="tags"
											notFoundContent={null}
											style={{ width: '100%' }}
											tokenSeparators={[',']}
											disabled={getDisabled(includeFields)}
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
												{(mappingsFromIndices || []).map((v) => {
													if (includeFields && !includeFields.includes(v)) {
														return (
															<Select.Option key={v} title={v} data-cy={v}>
																{v}
															</Select.Option>
														);
													}
													return null;
												})}
											</Select>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="categoryField"
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer} data-cy="categoryField-label">
											Category Field
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
										<Select
											{...handler()}
											placeholder="Add category fields from schema"
											loading={false}
											style={{ width: '100%' }}
											data-cy="category-field"
											showSearch
											onChange={(value) => {
												this.handleChange(
													'categoryField',
													calculateValue(value),
													'indexSuggestions',
												);
												handler().onChange(calculateValue(value));
											}}

										>
											{(categoryFields || []).map((v) => {
												const val = v.split('.keyword')[0];
												return (
													<Select.Option key={val} title={val} data-cy={val}>
														{val}
													</Select.Option>
												)
											})}
										</Select>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="urlField"
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer} data-cy="url-label">
											URL
											<Popover
												content={content(
													Messages.urlField,
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
											placeholder="Add URL field from schema"
											loading={isFetching}
											style={{ width: '100%' }}
											data-cy="url-index-setting"
											showSearch
											onChange={(value) => {
												this.handleChange(
													'urlField',
													calculateValue(value),
													'indexSuggestions',
												);
												handler().onChange(calculateValue(value));
											}}
										>
											{(categoryFields || []).map((v) => {
												const val = v.split('.keyword')[0];
												return (
													<Select.Option key={val} title={val} data-cy={val}>
														{val}
													</Select.Option>

												)
											})}
										</Select>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="customQuery"
							render={({ handler, value }) => {

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
												data-cy="custom-query"
												placeholder="Select Custom Query"
												style={{ width: '100%' }}
												{...handler()}
												defaultValue={value}
												value={value}
												optionLabelProp="label"
												onChange={(val) => {
													this.handleChange('customQuery', val, 'indexSuggestions')
													handler().onChange(val);
												}}
											>
												{(appStoredQueries || []).map((v) => {
													return (
														<Select.Option key={v.id} label={v.id} value={v.id} data-cy={v.id}>
															<div>{v.id}</div>
															<div>{v.description}</div>
														</Select.Option>
													);
												})}
											</Select>
										}
										gridRatio={gridRatio}
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
									data-cy="index-suggestions-save"
									onClick={handleSaveTemplate}
									size="large"
									type="primary"
									loading={isLoading}
									disabled={isLoading || invalidForm || pristine}
								>
									Save
								</Button>
								<Footer
									originalData={initialData}
									tab='popular-suggestions'
									changedData={indexSuggestions}
								/>
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
	appStoredQueries: PropTypes.array.isRequired,
	fetchMappings: PropTypes.func.isRequired,
	apps: PropTypes.object,
	initialData: PropTypes.object.isRequired,
	appName: PropTypes.string,
	mappings: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object, // at cluster level
	]),
	rawMappings: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object,
	]),
	fetchStoredQueries: PropTypes.func.isRequired,
	credentials: PropTypes.string.isRequired,
};

PreferenceForm.defaultProps = {
	apps: {},
	mappings: [],
	rawMappings: [],
	appName: undefined,
};

const mapStateToProps = (state) => {
	const mappings = getTraversedMappingsByAppName(state);
	const rawMappings = getRawMappingsByAppName(state);
	const appName = get(state, '$getCurrentApp.name');
	const { username, password } = get(state, 'user.data', {});

	return {
		mappings,
		rawMappings,
		isLoading: get(state, '$saveSuggestionsPreferences.isFetching', false),
		appName,
		apps: get(state, 'apps.data'),
		credentials: `${username}:${password}`,
		appStoredQueries: get(state, ['$getAppStoredQueries', 'results'], []),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
	fetchStoredQueries: () => dispatch(getAppStoredQueries()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PreferenceForm);
