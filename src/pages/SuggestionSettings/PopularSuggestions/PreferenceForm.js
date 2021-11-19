import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Select, Checkbox, Icon, Popover, InputNumber } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import Grid from '../../../components/CreateCredentials/Grid';
import Ace from '../../../batteries/components/SearchSandbox/containers/AceEditor';
import { suggestionsMessages as Messages } from '../../../utils/messages';
import {
	getAppMappings,
	getSettings,
	getDefaultSettings,
	setSearchState,
} from '../../../batteries/modules/actions';
import styles from '../styles';
import Footer from '../Footer';

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
	width: 100%;
	.error {
		color: tomato;
		padding: 5px 0;
	}
	.input-error {
		border-color: tomato;
	}
	.heading {
		font-weight: bold;
		margin-bottom: 30px;
		margin-top: 40px;
	}
`;

const content = (message) => {
	return <div>{message}</div>;
};

class PreferenceForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			popularSuggestions: props.initialData,
		};
	}

	componentDidMount() {
		const { saveState, searchState, initialData } = this.props;

		this.getMappings();
		saveState({
			suggestions: {
				...searchState?.suggestions,
				popularSuggestions: initialData,
			},
		});
	}

	componentDidUpdate(prevProps) {
		const { initialData } = this.props;
		if (JSON.stringify(prevProps.initialData) !== JSON.stringify(initialData)) {
			// eslint-disable-next-line
			this.setState({
				popularSuggestions: initialData,
			});
		}
	}

	getMappings() {
		const { appName, fetchMappings, credentials, mappings } = this.props;
		if (credentials && get(mappings, 'length') === 0) {
			// Fetch Mappings if permissions are present
			fetchMappings(appName, credentials);
		}
	}

	handleChange = (key, value) => {
		// eslint-disable-line
		const { popularSuggestions } = this.state;
		const { saveState, searchState } = this.props;
		const newPopularSuggestions = {
			...popularSuggestions,
			[key]: value,
		};
		this.setState({
			popularSuggestions: newPopularSuggestions,
		});
		saveState({
			suggestions: {
				...searchState?.suggestions,
				popularSuggestions: newPopularSuggestions,
			},
		});
	};

	render() {
		const { control, indices, initialData } = this.props;
		const { popularSuggestions } = this.state;

		return (
			<FieldGroup
				control={control}
				strict={false}
				render={(
					{ invalid: invalidForm }, // eslint-disable-line
				) => {
					return (
						<div css={modal} data-cy="popular-suggestions-fields-container">
							<h3 className="heading">
								Following settings are applicable only at index time to populate the
								popular suggestions index
							</h3>
							<FieldControl
								name="numberOfDays"
								render={({ handler, value }) => (
									<Grid
										label={
											<p css={styles.labelContainer}>
												Number of days
												<Popover
													content={content(Messages.numberOfDays)}
													css={styles.iconContainer}
												>
													<Icon type="info-circle" />
												</Popover>
											</p>
										}
										component={
											<InputNumber
												data-cy="number-of-days"
												{...handler()}
												style={{ width: '100%' }}
												defaultValue={value}
												value={value}
												min={1}
												max={90}
												onChange={(e) => {
													this.handleChange('numberOfDays', e);
													handler().onChange(e);
												}}
											/>
										}
									/>
								)}
							/>
							<FieldControl
								name="minHits"
								render={({ handler, value }) => (
									<Grid
										label={
											<p css={styles.labelContainer}>
												Min Hits
												<Popover
													content={content(Messages.minHits)}
													css={styles.iconContainer}
												>
													<Icon type="info-circle" />
												</Popover>
											</p>
										}
										component={
											<InputNumber
												data-cy="popular-suggestions-min-hits"
												{...handler()}
												style={{ width: '100%' }}
												defaultValue={value}
												value={value}
												min={0}
												max={1000}
												onChange={(e) => {
													this.handleChange('minHits', e);
													handler().onChange(e);
												}}
											/>
										}
									/>
								)}
							/>
							<FieldControl
								name="transformDiacritics"
								render={({ handler, value }) => {
									return (
										<Grid
											label={
												<p css={styles.labelContainer}>
													Transform Diacritics
													<Popover
														content={content(
															Messages.transformDiacritics,
														)}
														css={styles.iconContainer}
													>
														<Icon type="info-circle" />
													</Popover>
												</p>
											}
											component={
												<div style={{ width: '100%' }}>
													<div>
														<Checkbox
															data-cy="transform-diacritics"
															{...handler()}
															defaultChecked={value}
															checked={value}
															onChange={(event) => {
																this.handleChange(
																	'transformDiacritics',
																	event.target.checked,
																);
																handler().onChange(
																	event.target.checked,
																);
															}}
														/>
													</div>
												</div>
											}
										/>
									);
								}}
							/>
							<FieldControl
								name="blacklist"
								render={({ handler, value }) => (
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
												data-cy="blacklist"
												{...handler()}
												defaultValue={value}
												value={value}
												placeholder="Enter blacklist queries"
												mode="tags"
												notFoundContent={null}
												style={{ width: '100%' }}
												tokenSeparators={[',']}
												onChange={(val) => {
													this.handleChange(
														'blacklist',
														calculateValue(val),
													);
													handler().onChange(val);
												}}
											/>
										}
									/>
								)}
							/>
							<FieldControl
								name="externalSuggestions"
								render={({ handler }) => {
									const inputHandler = handler();
									return (
										<Grid
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
														content={content(
															Messages.externalSuggestions,
														)}
														css={styles.iconContainer}
													>
														<Icon type="info-circle" />
													</Popover>
												</p>
											}
											component={
												<Ace
													data-cy="external-suggestions"
													// {...handler()}
													defaultValue=""
													mode="json"
													value={
														typeof inputHandler.value === 'string'
															? inputHandler.value
															: JSON.stringify(
																	inputHandler.value,
																	0,
																	2,
															  )
													}
													placeholder={`[
	{
		"count": 6,
		"indices": [ "abc", "def" ],
		"key": "hello"
	},
	{
		"count": 3,
		"indices": [ "abc" ],
		"key": "world"
	}
]`}
													onChange={(val) => {
														this.handleChange(
															'externalSuggestions',
															val,
														);
														inputHandler.onChange(val);
													}}
													theme="monokai"
													name="editor-JSON"
													fontSize={16}
													showPrintMargin
													style={{
														width: '100%',
														maxWidth: 800,
														maxHeight: 250,
														whiteSpace: 'pre',
													}}
													// readOnly={inputHandler.disabled}
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
							<h3 className="heading">
								Following settings are applicable at index time as well as used as
								query time defaults
							</h3>
							<FieldControl
								name="indices"
								render={({ handler, value }) => {
									const inputHandler = handler();
									return (
										<Grid
											label={
												<p
													css={styles.labelContainer}
													data-cy="indices-label"
												>
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
													data-cy="popular-suggestions-indices"
													placeholder="Enter indices"
													mode="tags"
													style={{ width: '100%' }}
													tokenSeparators={[',']}
													value={value}
													{...inputHandler}
													onChange={(val) => {
														this.handleChange('indices', val);
														inputHandler.onChange(calculateValue(val));
													}}
												>
													<Select.Option value="*">All (*)</Select.Option>
													{indices.map((index) => (
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
								name="minCount"
								render={({ handler, value }) => (
									<Grid
										label={
											<p css={styles.labelContainer}>
												Min Count
												<Popover
													content={content(Messages.minCount)}
													css={styles.iconContainer}
												>
													<Icon type="info-circle" />
												</Popover>
											</p>
										}
										component={
											<InputNumber
												data-cy="min-count"
												style={{ width: '100%' }}
												min={0}
												defaultValue={value}
												value={value}
												// placeholder="Enter min count"
												onChange={(e) => {
													this.handleChange('minCount', e);
													handler().onChange(e);
												}}
											/>
										}
									/>
								)}
							/>
							<FieldControl
								name="minChars"
								render={({ handler, value }) => (
									<Grid
										label={
											<p css={styles.labelContainer}>
												Min Characters
												<Popover
													content={content(Messages.minChars)}
													css={styles.iconContainer}
												>
													<Icon type="info-circle" />
												</Popover>
											</p>
										}
										component={
											<InputNumber
												data-cy="min-characters"
												{...handler()}
												style={{ width: '100%' }}
												defaultValue={value}
												value={value}
												min={0}
												max={32}
												onChange={(e) => {
													this.handleChange('minChars', e);
													handler().onChange(e);
												}}
											/>
										}
									/>
								)}
							/>
							<h3 className="heading">
								Following settings are applicable at query time only
							</h3>
							<FieldControl
								name="size"
								render={({ handler, value }) => (
									<Grid
										label={
											<p css={styles.labelContainer}>
												Size
												<Popover
													content={content(Messages.popularSize)}
													css={styles.iconContainer}
												>
													<Icon type="info-circle" />
												</Popover>
											</p>
										}
										component={
											<InputNumber
												data-cy="popular-suggestions-size"
												{...handler()}
												style={{ width: '100%' }}
												defaultValue={value}
												value={value}
												min={0}
												max={20}
												onChange={(e) => {
													this.handleChange('size', e);
													handler().onChange(e);
												}}
											/>
										}
									/>
								)}
							/>
							<Footer
								originalData={initialData}
								tab="popular-suggestions"
								changedData={popularSuggestions}
							/>
						</div>
					);
				}}
			/>
		);
	}
}

PreferenceForm.propTypes = {
	control: PropTypes.object.isRequired,
	isLoading: PropTypes.bool.isRequired,
	indices: PropTypes.array.isRequired,
	fetchMappings: PropTypes.func.isRequired,
	apps: PropTypes.object,
	initialData: PropTypes.object.isRequired,
	appName: PropTypes.string,
	mappings: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object, // at cluster level
	]),
	credentials: PropTypes.string.isRequired,
	saveState: PropTypes.func.isRequired,
	searchState: PropTypes.object,
};

PreferenceForm.defaultProps = {
	apps: {},
	appName: undefined,
	mappings: [],
	searchState: null,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const { username, password } = get(state, 'user.data', {});
	return {
		isLoading: get(state, '$saveSuggestionsPreferences.isFetching', false),
		appName: get(state, '$getCurrentApp.name'),
		apps: get(state, 'apps.data'),
		credentials: `${username}:${password}`,
		settings: get(state, ['$getAppSettings', 'settings', appName]),
		searchState: get(state, '$getSearchState.searchState', null),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
	getSettingsAction: (name) => dispatch(getSettings(name)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	saveState: (state) => dispatch(setSearchState(state)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PreferenceForm);
