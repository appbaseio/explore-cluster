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
import {
	getAppMappings,
	getSettings,
	getDefaultSettings,
} from '../../../batteries/modules/actions';
import SearchPreviewSwitcher from '../../../components/SearchPreviewSwitcher';
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

class PreferenceForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
			popularSuggestions: props.initialData,
		};
	}

	componentDidMount() {
		this.getMappings();
	}

	componentDidUpdate(prevProps) {
		const { initialData } = this.props;
		if (prevProps.initialData !== initialData) {
			this.setState({
				popularSuggestions: initialData
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

	handleChange = (key, value, dataKey) => {
		const { popularSuggestions } = this.state;
		const newPopularSuggestions = {
			...popularSuggestions,
			[key]: value,
		}
		this.setState({
			popularSuggestions: newPopularSuggestions
		})

	};

	toggleVisibility = () => {
		this.setState((prevState) => ({
			visible: !prevState.visible,
		}));
	};

	render() {
		const { control, handleSaveTemplate, isLoading, indices, apps, initialData } = this.props;
		const { visible, app, popularSuggestions } = this.state;
		const filteredApps = keys(apps).filter((appName) => !appName.startsWith('.') && appName.startsWith('metricbeat'));

		return (
			<FieldGroup
				control={control}
				strict={false}
				render={({ pristine, invalid: invalidForm }) => {
					return (
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
												data-cy="popular-suggestions-indices"
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
							name="numberOfDays"
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Number of days
											<Popover
												content={content(
													Messages.numberOfDays,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Input
											data-cy="number-of-days"
											{...handler()}
											defaultValue={value}
											value={value}
											type="number"
											placeholder="Enter number of days"
											onChange={(e) => {
												this.handleChange('numberOfDays', e.target.value, 'popularSuggestions')
												handler().onChange(e.target.value);
											}}
										/>
									}
								/>
							)}
						/>
						<FieldControl
							name="minCount"
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Min Count
											<Popover
												content={content(
													Messages.minCount,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Input
											data-cy="min-count"
											// {...handler()}
											defaultValue={value}
											value={value}
											type="number"
											placeholder="Enter min count"
											onChange={(e) => {
												this.handleChange('minCount', e.target.value, 'popularSuggestions')
												handler().onChange(e.target.value);
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
												content={content(
													Messages.minHits,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Input
											data-cy="popular-suggestions-min-hits"
											{...handler()}
											defaultValue={value}
											value={value}
											type="number"
											placeholder="Enter min Hits"
											onChange={(e) => {
												this.handleChange('minHits', e.target.value, 'popularSuggestions')
												handler().onChange(e.target.value);
											}}
										/>
									}
								/>
							)}
						/>
						<FieldControl
							name="minCharacters"
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Min Characters
											<Popover
												content={content(
													Messages.minCharacters,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Input
											data-cy="min-characters"
											{...handler()}
											defaultValue={value}
											value={value}
											type="number"
											placeholder="Enter min count"
											onChange={(e) => {
												this.handleChange('minCharacters', e.target.value, 'popularSuggestions')
												handler().onChange(e.target.value);
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
												<Checkbox
													data-cy="transform-diacritics"
													{...handler()}
													defaultChecked={value}
													checked={value}
													onChange={event => {
														this.handleChange('transformDiacritics', event.target.checked, 'popularSuggestions')
														handler().onChange(event.target.checked);
													}}
												/>
											</div>
										</div>
									}
								/>
							)}}
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
													Messages.popular_size,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Input
											data-cy="popular-suggestions-size"
											{...handler()}
											defaultValue={value}
											value={value}
											type="number"
											placeholder="Enter size"
											onChange={(e) => {
												this.handleChange('size', e.target.value, 'popularSuggestions')
												handler().onChange(e.target.value);
											}}
										/>
									}
								/>
							)}
						/>
						<FieldControl
							name="blacklist"
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Blacklist
											<Popover
												content={content(
													Messages.blacklist,
												)}
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
											onChange={(value) => {
												this.handleChange(
													'blacklist',
													calculateValue(value),
													'popularSuggestions',
												)
												handler().onChange(value);
											}}
										/>
									}
								/>
							)}
						/>

						<FieldControl
							name="externalSuggestions"
							render={({ handler,value }) => {
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
												data-cy="external-suggestions"
												{...handler()}
												defaultValue={
													typeof inputHandler.value === 'string'
														? inputHandler.value
														: JSON.stringify(inputHandler.value, 0, 2)
												}
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
									data-cy="popular-suggestions-save"
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
									changedData={popularSuggestions}
								/>
							</div>
						</Affix>
					</div>
				)
			}}
			/>
		);
	}
}

PreferenceForm.propTypes = {
	handleSaveTemplate: PropTypes.func.isRequired,
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
};

PreferenceForm.defaultProps = {
	apps: {},
	appName: undefined,
	mappings: [],
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	return {
		isLoading: get(state, '$saveSuggestionsPreferences.isFetching', false),
		appName: get(state, '$getCurrentApp.name'),
		apps: get(state, 'apps.data'),
		settings: get(state, ['$getAppSettings', 'settings', appName]),
	}
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
	getSettingsAction: (name) => dispatch(getSettings(name)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PreferenceForm);
