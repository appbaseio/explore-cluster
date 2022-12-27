import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Select, Switch, Popover, InputNumber } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import {
	getAppMappings,
	getAppStoredQueries,
	setSearchState,
} from '../../../batteries/modules/actions';
import {
	getRawMappingsByAppName,
	getTraversedMappingsByAppName,
} from '../../../batteries/modules/selectors';
import Grid from '../../../components/CreateCredentials/Grid';
import { getDatafields } from '../../../utils';
import { suggestionsMessages as Messages } from '../../../utils/messages';
import styles from '../styles';
import Footer from '../Footer'; // eslint-disable-line

const gridRatio = 0.4;
const calculateValue = (value) => {
	const index = value?.indexOf('*');
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

class PreferenceForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedIndices:
				JSON.stringify(props.initialData.indices) === JSON.stringify(['*'])
					? props.indices
					: props.initialData.indices || [],
			indexSuggestions: props.initialData,
			isFetchingMappings: props.isFetchingMappings,
		};
	}

	componentDidMount() {
		const { fetchStoredQueries, saveState, searchState, initialData } = this.props;

		fetchStoredQueries();
		this.getMappings();

		saveState({
			suggestions: {
				...searchState?.suggestions,
				indexSuggestions: initialData,
			},
		});
	}

	componentDidUpdate(prevProps) {
		const { isFetchingMappings, initialData } = this.props;

		if (isFetchingMappings !== prevProps.isFetchingMappings) {
			this.setState({ isFetchingMappings }); // eslint-disable-line
		}

		if (JSON.stringify(prevProps.initialData) !== JSON.stringify(initialData)) {
			// eslint-disable-next-line
			this.setState({
				indexSuggestions: initialData,
			});
		}
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

	handleChange = (key, value) => {
		// eslint-disable-line
		const { saveState, searchState } = this.props;
		const { indexSuggestions } = this.state;

		const newIndexSuggestions = {
			...indexSuggestions,
			[key]: value,
		};
		this.setState({
			indexSuggestions: newIndexSuggestions,
		});

		saveState({
			suggestions: {
				...searchState?.suggestions,
				indexSuggestions: newIndexSuggestions,
			},
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
		const { control, indices, initialData, mappings, appStoredQueries } = this.props;
		// eslint-disable-line
		const { indexSuggestions, selectedIndices, isFetchingMappings } = this.state;
		const mappingsFromIndices = [];

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

		const { excludeFields, includeFields } = indexSuggestions;

		return (
			<FieldGroup
				control={control}
				strict={false}
				render={(
					{ invalid: invalidForm, value }, // eslint-disable-line
				) => (
					<div css={modal} data-cy="index-suggestions-fields-container">
						<FieldControl
							name="indices"
							render={({ handler, value: app }) => {
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
													<InfoCircleOutlined />
												</Popover>
											</p>
										}
										component={
											<Select
												data-cy="index-suggestions-indices"
												placeholder="Enter indices"
												mode="tags"
												style={{ width: '100%', margin: 'auto' }}
												tokenSeparators={[',']}
												value={app}
												{...inputHandler}
												onChange={(val) => {
													this.handleChange('indices', val);
													inputHandler.onChange(calculateValue(val));
													this.setState({
														selectedIndices: val,
													});
												}}
											>
												<Select.Option value="*">All (*)</Select.Option>
												{indices
													.filter(
														(i) =>
															!i.startsWith('metricbeat') &&
															!i.startsWith('.'),
													)
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
							render={({ handler, value: checked }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Show Distinct Suggestions
											<Popover
												content={content(Messages.showDistinctSuggestions)}
												css={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Switch
											data-cy="show-distinct-suggestions"
											checked={checked}
											style={{ margin: 'auto', marginLeft: '0' }}
											{...handler()}
											onChange={(val) => {
												this.handleChange('showDistinctSuggestions', val);
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
										<p css={styles.labelContainer}>
											Enable Predictive Suggestions
											<Popover
												content={content(
													Messages.enablePredictiveSuggestions,
												)}
												css={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Switch
											data-cy="enable-predictive-suggestions"
											checked={checked}
											style={{ margin: 'auto', marginLeft: '0' }}
											{...handler()}
											onChange={(val) => {
												this.handleChange(
													'enablePredictiveSuggestions',
													val,
												);
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
							render={({ handler, value: count }) => {
								const inputHandler = { ...handler() };

								return (
									<Grid
										label={
											<p css={styles.labelContainer}>
												Max Predicted Words
												<Popover
													content={content(Messages.maxPredictedWords)}
													css={styles.iconContainer}
												>
													<InfoCircleOutlined />
												</Popover>
											</p>
										}
										component={
											<InputNumber
												data-cy="max-predicted-words"
												{...inputHandler}
												style={{ width: '100%', margin: 'auto' }}
												defaultValue={count}
												min={1}
												max={5}
												value={count}
												onChange={(e) => {
													this.handleChange('maxPredictedWords', e);
													inputHandler.onChange(e);
												}}
											/>
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
										<p css={styles.labelContainer}>
											Apply Default Stopwords
											<Popover
												content={content(Messages.applyStopwords)}
												css={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Switch
											data-cy="apply-stopwords"
											checked={checked}
											style={{ margin: 'auto', marginLeft: '0' }}
											{...handler()}
											onChange={(val) => {
												this.handleChange('applyStopwords', val);
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
										<p css={styles.labelContainer}>
											Set Custom Stopwords
											<Popover
												content={content(Messages.customStopwords)}
												css={styles.iconContainer}
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
											style={{ width: '100%', margin: 'auto' }}
											tokenSeparators={[',']}
											onChange={(val) => {
												this.handleChange(
													'customStopwords',
													calculateValue(val),
												);
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
										<p css={styles.labelContainer}>
											Enable Synonyms
											<Popover
												content={content(Messages.enableSynonyms)}
												css={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Switch
											data-cy="enable-synonyms"
											checked={checked}
											style={{ margin: 'auto', marginLeft: '0' }}
											{...handler()}
											onChange={(val) => {
												this.handleChange('enableSynonyms', val);
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
							render={({ handler, value: count }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Size
											<Popover
												content={content(Messages.indexSize)}
												css={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<InputNumber
											data-cy="index-suggestions-size"
											{...handler()}
											style={{ width: '100%', margin: 'auto' }}
											defaultValue={count}
											value={count}
											min={0}
											max={20}
											onChange={(e) => {
												this.handleChange('size', e);
												handler().onChange(e);
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
							render={({ handler }) => (
								<Grid
									label={
										<p
											css={styles.labelContainer}
											data-cy="include-fields-label"
										>
											Include Fields
											<Popover
												content={content(Messages.includeFields)}
												css={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Select
											{...handler()}
											loading={isFetchingMappings}
											placeholder="Select one ore more fields"
											mode="tags"
											notFoundContent={null}
											style={{ width: '100%', margin: 'auto' }}
											tokenSeparators={[',']}
											disabled={this.getDisabled(value?.excludeFields)}
											data-cy="include-fields"
											showSearch
											onChange={(val) => {
												this.handleChange(
													'includeFields',
													calculateValue(val),
												);
												handler().onChange(calculateValue(val));
											}}
										>
											<Select.Option key="*">
												* (Include all fields)
											</Select.Option>
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
							strict={false}
							render={({ handler }) => (
								<Grid
									label={
										<p
											css={styles.labelContainer}
											data-cy="exclude-fields-label"
										>
											Exclude Fields
											<Popover
												content={content(Messages.excludeFields)}
												css={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Select
											{...handler()}
											loading={isFetchingMappings}
											placeholder="Select one ore more fields"
											mode="tags"
											notFoundContent={null}
											style={{ width: '100%', margin: 'auto' }}
											tokenSeparators={[',']}
											disabled={this.getDisabled(value?.includeFields)}
											data-cy="exclude-fields"
											showSearch
											onChange={(val) => {
												this.handleChange(
													'excludeFields',
													calculateValue(val),
												);
												handler().onChange(calculateValue(val));
											}}
										>
											<Select.Option key="*">
												* (Exclude all fields)
											</Select.Option>
											{(mappingsFromIndices || []).map((v) => {
												if (includeFields && !includeFields.includes(v)) {
													return (
														<Select.Option
															key={v}
															title={v}
															data-cy={v}
															value={v}
														>
															{/* eslint-disable-line */}
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
							strict={false}
							render={({ handler }) => (
								<Grid
									label={
										<p
											css={styles.labelContainer}
											data-cy="categoryField-label"
										>
											Category Field
											<Popover
												content={content(Messages.categoryField)}
												css={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Select
											{...handler()}
											allowClear
											placeholder="Add category fields from schema"
											loading={isFetchingMappings}
											style={{ width: '100%', margin: 'auto' }}
											data-cy="category-field"
											showSearch
											onChange={(val) => {
												this.handleChange(
													'categoryField',
													calculateValue(val),
												);
												handler().onChange(calculateValue(val));
											}}
										>
											{(this.getAggregationFields() || []).map((v) => {
												const val = v.split('.keyword')[0];
												return (
													<Select.Option
														key={val}
														title={val}
														data-cy={val}
													>
														{val}
													</Select.Option>
												);
											})}
										</Select>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="urlField"
							strict={false}
							render={({ handler }) => (
								<Grid
									label={
										<p css={styles.labelContainer} data-cy="url-label">
											URL
											<Popover
												content={content(Messages.urlField)}
												css={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<Select
											{...handler()}
											allowClear
											placeholder="Add URL field from schema"
											loading={isFetchingMappings}
											style={{ width: '100%', margin: 'auto' }}
											data-cy="url-index-setting"
											showSearch
											onChange={(val) => {
												this.handleChange('urlField', calculateValue(val));
												handler().onChange(calculateValue(val));
											}}
										>
											{(this.getAggregationFields() || []).map((v) => {
												const val = v.split('.keyword')[0];
												return (
													<Select.Option
														key={val}
														title={val}
														data-cy={val}
													>
														{val}
													</Select.Option>
												);
											})}
										</Select>
									}
									gridRatio={gridRatio}
								/>
							)}
						/>
						<FieldControl
							name="customQuery"
							render={({ handler, value: query }) => {
								return (
									<Grid
										label={
											<p css={styles.labelContainer}>
												Custom Query
												<Popover
													content={content(Messages.customQuery)}
													css={styles.iconContainer}
												>
													<InfoCircleOutlined />
												</Popover>
											</p>
										}
										component={
											<Select
												data-cy="custom-query"
												placeholder="Select Custom Query"
												allowClear
												style={{ width: '100%', margin: 'auto' }}
												{...handler()}
												defaultValue={query}
												value={query}
												optionLabelProp="label"
												onChange={(val) => {
													this.handleChange('customQuery', val);
													handler().onChange(val);
												}}
											>
												{(appStoredQueries || []).map((v) => {
													return (
														<Select.Option
															key={v.id}
															label={v.id}
															value={v.id}
															data-cy={v.id}
														>
															<div style={{ fontWeight: 'bold' }}>
																{v.id}
															</div>
															<div style={{ fontSize: 12 }}>
																{v.description}
															</div>
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
						<Footer
							originalData={initialData}
							tab="index-suggestions"
							changedData={indexSuggestions}
						/>
					</div>
				)}
			/>
		);
	}
}

PreferenceForm.propTypes = {
	control: PropTypes.object.isRequired,
	indices: PropTypes.array.isRequired,
	appStoredQueries: PropTypes.array.isRequired,
	fetchMappings: PropTypes.func.isRequired,
	initialData: PropTypes.object.isRequired,
	appName: PropTypes.string,
	mappings: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object, // at cluster level
	]),
	rawMappings: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	fetchStoredQueries: PropTypes.func.isRequired,
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
		appStoredQueries: get(state, ['$getAppStoredQueries', 'results'], []),
		searchState: get(state, '$getSearchState.searchState', null),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
	fetchStoredQueries: () => dispatch(getAppStoredQueries()),
	saveState: (state) => dispatch(setSearchState(state)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PreferenceForm);
