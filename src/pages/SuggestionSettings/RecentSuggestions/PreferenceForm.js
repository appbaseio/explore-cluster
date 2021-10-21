import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Input, Select, Icon, Popover } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import keys from 'lodash/keys';
import Grid from '../../../components/CreateCredentials/Grid';
import {
	setLocalRelevancyState,
} from '../../../batteries/modules/actions';
import { suggestionsMessages as Messages } from '../../../utils/messages';
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
			visible: false ,
			recentSuggestions: props.initialData,
		};
	}

	componentDidUpdate(prevProps) {
		const { initialData } = this.props;
		if (prevProps.initialData !== initialData) {
			this.setState({
				recentSuggestions: initialData
			})
		}
	}

	onAppSelect = (app) => {
		this.setState({ app, visible: true });
	};

	handleChange = (key, value, dataKey) => {
		const { recentSuggestions } = this.state;
		const newRecentSuggestions = {
			...recentSuggestions,
			[key]: value,
		}
		this.setState({
			recentSuggestions: newRecentSuggestions
		})
	};

	toggleVisibility = () => {
		this.setState((prevState) => ({
			visible: !prevState.visible,
		}));
	};

	render() {
		const { control, isLoading, apps,indices , initialData } = this.props;
		const { visible, app, recentSuggestions } = this.state;
		const filteredApps = keys(apps).filter((appName) => !appName.startsWith('.'));

		return (
			<FieldGroup
				control={control}
				strict={false}
				render={({ pristine, invalid: invalidForm }) => (
					<div css={modal}>
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
											data-cy="recent-suggestions-min-hits"
											{...handler()}
											type="number"
											defaultValue={value}
											value={value}
											placeholder="Enter min Hits"
											onChange={(e) => {
												this.handleChange('minHits', e.target.value, 'recentSuggestions')
												handler().onChange(e.target.value);
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
													Messages.recent_size,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Input
											data-cy="recent-suggestions-size"
											{...handler()}
											defaultValue={value}
											value={value}
											type="number"
											placeholder="Enter min count"
											onChange={(e) => {
												this.handleChange('size', e.target.value, 'recentSuggestions')
												handler().onChange(e.target.value);
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
												content={content(
													Messages.minChars,
												)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<Input
											data-cy="recent-suggestions-minChars"
											{...handler()}
											defaultValue={value}
											value={value}
											type="number"
											placeholder="Enter min chars"
											onChange={(e) => {
												this.handleChange('minChars', e.target.value, 'recentSuggestions')
												handler().onChange(e.target.value);
											}}
										/>
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
												data-cy="recent-suggestions-indices"
												placeholder="Enter indices"
												mode="tags"
												style={{ width: '100%' }}
												tokenSeparators={[',']}
												value={value}
												{...inputHandler}
												onChange={(val) => {
													inputHandler.onChange(calculateValue(val));
													this.handleChange('indices', val, 'recentSuggestions')
												}}
											>
												<Select.Option value="*">All (*)</Select.Option>
												{indices
													.filter((i) => !i.startsWith('metricbeat'))
													.map((index) => (
														<Select.Option key={index} data-cy={index}>
															{index}
														</Select.Option>
													))}
											</Select>
										}
									/>
								);
							}}
						/>
						{/* <Affix offsetBottom={0}>
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
									data-cy="recent-suggestions-save"
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
									tab='recent-suggestions'
									changedData={recentSuggestions}
								/>
							</div>
						</Affix> */}
						<Footer
							originalData={initialData}
							tab='recent-suggestions'
							changedData={recentSuggestions}
						/>
					</div>
				)}
			/>
		);
	}
}

PreferenceForm.propTypes = {
	control: PropTypes.object.isRequired,
	isLoading: PropTypes.bool.isRequired,
	indices: PropTypes.array.isRequired,
	apps: PropTypes.object,
	initialData: PropTypes.object.isRequired,
};

PreferenceForm.defaultProps = {
	apps: {},
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	return {
		isLoading: get(state, '$saveSuggestionsPreferences.isFetching', false),
		appName,
		apps: get(state, 'apps.data'),
		localRelevancy: get(state, ['$getLocalRelevancy', appName], null),
	}
};

const mapDispatchToProps = (dispatch) => ({
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PreferenceForm);
