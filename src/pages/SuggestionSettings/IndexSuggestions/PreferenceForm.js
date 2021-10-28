import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Input, Select, Switch, Popover, Icon } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import {
	getAppMappings,
	getAppStoredQueries,
} from '../../../batteries/modules/actions';
import { getRawMappingsByAppName, getTraversedMappingsByAppName } from '../../../batteries/modules/selectors';
import Grid from '../../../components/CreateCredentials/Grid';
import { removeWhiteSpaces, getDatafields } from '../../../utils';
import { suggestionsMessages as Messages } from '../../../utils/messages';
import styles from '../styles';
import Footer from '../Footer'; // eslint-disable-line

const gridRatio = 0.40;
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
			selectedIndices: JSON.stringify(props.initialData.indices) === JSON.stringify(['*']) ? props.indices : props.initialData.indices || [],
			aggregationFields: [],
			indexSuggestions: props.initialData,
			isFetchingMappings: props.isFetchingMappings,
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
		const { rawMappings, isFetchingMappings } = this.props;
		if (rawMappings && prevProps.rawMappings !== rawMappings) {
			this.getAggregationFields();
		}

		if (isFetchingMappings !== prevProps.isFetchingMappings) {
			this.setState({ isFetchingMappings }); // eslint-disable-line
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

	handleChange = (key, val, dataKey) => { // eslint-disable-line
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
			indices,
			initialData,
			mappings,
			appStoredQueries,
		} = this.props;
		// eslint-disable-line
		const {
			aggregationFields,
			indexSuggestions,
			selectedIndices,
			isFetchingMappings,
		} = this.state;
		let mappingsFromIndices = [];

		selectedIndices?.map(index => {
			if(mappings[index]) {
				mappings[index].forEach((mapping) => {
					if (!mappingsFromIndices.includes(mapping)) {
						mappingsFromIndices.push(mapping);
					}
				});
			}
		});

		let categoryFields = aggregationFields;
		const { excludeFields, includeFields } = indexSuggestions;

		return (
			<FieldGroup
				control={control}
				strict={false}
				render={({ invalid: invalidForm }) => ( // eslint-disable-line
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
													Messages.indexSize,
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
											loading={isFetchingMappings}
											placeholder="Select one ore more fields"
											mode="tags"
											notFoundContent={null}
											style={{ width: '100%' }}
											tokenSeparators={[',']}
											disabled={this.getDisabled(excludeFields)}
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
											loading={isFetchingMappings}
											placeholder="Select one ore more fields"
											mode="tags"
											notFoundContent={null}
											style={{ width: '100%' }}
											tokenSeparators={[',']}
											disabled={this.getDisabled(includeFields)}
											data-cy="exclude-fields"
											showSearch
											onChange={(value) => {
												this.handleChange(
													'excludeFields',
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
											allowClear
											placeholder="Add category fields from schema"
											loading={isFetchingMappings}
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
											allowClear
											placeholder="Add URL field from schema"
											loading={isFetchingMappings}
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
												allowClear
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
															<div style={{fontWeight: 'bold'}}>{v.id}</div>
															<div style={{fontSize: 12}}>{v.description}</div>
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
							tab='index-suggestions'
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
	rawMappings: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object,
	]),
	fetchStoredQueries: PropTypes.func.isRequired,
	credentials: PropTypes.string.isRequired,
	isFetchingMappings: PropTypes.bool.isRequired,
};

PreferenceForm.defaultProps = {
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
		isFetchingMappings: get(state, '$getAppMappings.isFetching', false),
		appName,
		credentials: `${username}:${password}`,
		appStoredQueries: get(state, ['$getAppStoredQueries', 'results'], []),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
	fetchStoredQueries: () => dispatch(getAppStoredQueries()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PreferenceForm);
