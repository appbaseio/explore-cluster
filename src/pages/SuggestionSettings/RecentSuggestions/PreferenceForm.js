import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Select, Icon, Popover, InputNumber } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import Grid from '../../../components/CreateCredentials/Grid';
import { setLocalRelevancyState, setSearchState } from '../../../batteries/modules/actions';
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
			recentSuggestions: props.initialData,
		};
	}

	componentDidMount() {
		const { saveState, searchState, initialData } = this.props;
		saveState({
			suggestions: {
				...searchState?.suggestions,
				recentSuggestions: initialData,
			},
		});
	}

	componentDidUpdate(prevProps) {
		const { initialData } = this.props;
		if (JSON.stringify(prevProps.initialData) !== JSON.stringify(initialData)) {
			// eslint-disable-next-line
			this.setState({
				recentSuggestions: initialData,
			});
		}
	}

	handleChange = (key, value) => {
		// eslint-disable-line
		const { recentSuggestions } = this.state;
		const { saveState, searchState } = this.props;

		const newRecentSuggestions = {
			...recentSuggestions,
			[key]: value,
		};
		this.setState({
			recentSuggestions: newRecentSuggestions,
		});
		saveState({
			suggestions: {
				...searchState?.suggestions,
				recentSuggestions: newRecentSuggestions,
			},
		});
	};

	render() {
		const { control, indices, initialData } = this.props;
		const { recentSuggestions } = this.state;

		return (
			<FieldGroup
				control={control}
				strict={false}
				render={(
					{ invalid: invalidForm }, // eslint-disable-line
				) => (
					<div css={modal} data-cy="recent-suggestions-fields-container">
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
											data-cy="recent-suggestions-min-hits"
											{...handler()}
											style={{ width: '100%' }}
											min={0}
											max={1000}
											defaultValue={value}
											value={value}
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
							name="size"
							render={({ handler, value }) => (
								<Grid
									label={
										<p css={styles.labelContainer}>
											Size
											<Popover
												content={content(Messages.recentSize)}
												css={styles.iconContainer}
											>
												<Icon type="info-circle" />
											</Popover>
										</p>
									}
									component={
										<InputNumber
											data-cy="recent-suggestions-size"
											{...handler()}
											style={{ width: '100%' }}
											defaultValue={value}
											value={value}
											min={0}
											onChange={(e) => {
												this.handleChange('size', e);
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
											data-cy="recent-suggestions-minChars"
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
						<FieldControl
							name="indices"
							render={({ handler, value }) => {
								const inputHandler = handler();
								return (
									<Grid
										label={
											<p
												css={styles.labelContainer}
												data-cy="recent-suggestions-indices-label"
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
												data-cy="recent-suggestions-indices"
												placeholder="Enter indices"
												mode="tags"
												style={{ width: '100%' }}
												tokenSeparators={[',']}
												value={value}
												{...inputHandler}
												onChange={(val) => {
													inputHandler.onChange(calculateValue(val));
													this.handleChange('indices', val);
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
						<Footer
							originalData={initialData}
							tab="recent-suggestions"
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
	saveState: PropTypes.func.isRequired,
	searchState: PropTypes.object,
};

PreferenceForm.defaultProps = {
	apps: {},
	searchState: null,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	return {
		isLoading: get(state, '$saveSuggestionsPreferences.isFetching', false),
		appName,
		apps: get(state, 'apps.data'),
		localRelevancy: get(state, ['$getLocalRelevancy', appName], null),
		searchState: get(state, '$getSearchState.searchState', null),
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
	saveState: (state) => dispatch(setSearchState(state)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PreferenceForm);
