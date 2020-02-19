import React from 'react';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { get } from 'lodash';
import {
	Affix,
	Alert,
	Button,
	Card,
	Col,
	DatePicker,
	Divider,
	Icon,
	Input,
	message,
	Result,
	Row,
	Skeleton,
	Switch,
	Typography,
} from 'antd';
import moment from 'moment';

import IndexDropdown from './components/IndexDropdown';
import Conditions from './components/Conditions';
import ActionSelector from './components/ActionSelector';
import Actions from './components/Actions';
import { getErrorClass, getErrorCount, getErrorMessage, getErrorMessages } from './utils/error';

import { addQueryRule, deleteRule, getRules, putRule } from '../../batteries/modules/actions/rules';

import CloneRule from './components/CloneRule';
import { Info } from '../../components/Info';
import { getClusterMappings, getDatafields } from '../../utils';
import { getParsedRule, getExpressionFromValue, validPlans, bannerDetails } from './utils';
import DeleteModal from '../../components/DeleteModal';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';

const { RangePicker } = DatePicker;

const container = css`
	padding: 50px;
	position: relative;

	.space-between {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.flex-end {
		justify-content: flex-end;
	}

	.flex {
		display: flex;
	}

	.card-footer {
		width: 100%;
		padding: 20px;
		background: white;
		box-sizing: border-box;
		border: 1px solid #e8e8e8;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
	}
`;

const formStyle = css`
	margin: 15px 0;
	label {
		display: block;
		font-weight: 500;
		margin-bottom: 5px;
		color: rgba(0, 0, 0, 0.85);
	}
	input {
		margin-bottom: 15px;
	}
	.ant-divider-horizontal {
		margin: 35px 0;
	}
`;

class QueryRulesForm extends React.Component {
	constructor(props) {
		super(props);
		const hasId = get(props.match, 'params.id');
		this.state = {
			// Rule Info
			name: '',
			description: '',

			// Trigger Info
			selectedIndexes: ['*'],
			condition: 'filter',

			// filter state
			dataField: '',
			dataFieldValue: '',
			query: 'is',
			queryValue: '',

			timeframe: null,

			// rule status
			enabled: false,

			// actions
			actions: [],

			// internal state
			mappings: [],
			dataFields: [],
			isEditPage: !!hasId,

			error: {},
		};
	}

	componentDidMount() {
		const { rules, fetchRules, rule } = this.props;
		const { isEditPage } = this.state;
		if (!(rules && rules.length)) {
			fetchRules();
		}

		if (isEditPage && rule) {
			this.setState({
				...rule,
			});
		}

		getClusterMappings()
			.then(mappings => {
				const dataFields = getDatafields(mappings, ['*']);
				const searchFields = getDatafields(mappings, ['*'], true);
				this.setState({
					mappings,
					dataFields,
					searchFields,
				});
			})
			.catch(e => console.log(e));
	}

	componentDidUpdate(prevProps) {
		const {
			isCreating,
			createError,
			rule,
			isUpdating,
			updateError,
			deleteError,
			isDeleting,
			history,
		} = this.props;
		const { isEditPage } = this.state;

		if (isEditPage && prevProps.rule !== rule) {
			this.setState({
				...rule,
			});
		}

		if (!isEditPage && !isCreating && prevProps.isCreating !== isCreating) {
			if (createError) {
				message.error(createError);
			} else {
				message.success('successfully created rule');
				history.push('/cluster/rules');
			}
		}

		if (isEditPage && !isUpdating && prevProps.isUpdating !== isUpdating) {
			if (updateError) {
				message.error(updateError);
			} else {
				message.success('successfully updated rule');
				history.push('/cluster/rules');
			}
		}

		if (isEditPage && !isDeleting && prevProps.isDeleting !== isDeleting) {
			if (deleteError) {
				message.error(deleteError);
			} else {
				message.success('Successfully Deleted Rule');
				history.replace('/cluster/rules');
			}
		}
	}

	handleInput = e => {
		const { name, value } = e.target;
		this.setState(prevState => ({
			[name]: value,
			actions:
				name === 'condition'
					? prevState.actions.filter(action => action.type !== 'replace_search_term')
					: prevState.actions,
			error: {
				...prevState.error,
				[name === 'dataFieldValue' || name === 'queryValue' ? 'condition' : name]: {
					hasError: false,
				},
			},
		}));
	};

	handleDropdown = (name, value) => {
		this.setState({
			[name]: value,
		});
	};

	handleStatus = value => {
		this.setState({
			enabled: value,
		});
	};

	handleIndex = selectedIndexes => {
		const { mappings } = this.state;
		const dataFields = getDatafields(mappings, selectedIndexes);
		const searchFields = getDatafields(mappings, selectedIndexes, true);

		this.setState(prevState => ({
			selectedIndexes,
			dataFields,
			searchFields,
			dataField: dataFields[0] || '',
			error: {
				...prevState.error,
				selectedIndexes: {
					hasError: false,
				},
			},
		}));
	};

	setActions = action => {
		this.setState(prevState => ({
			actions: [...prevState.actions, action],
			error: {
				...prevState.error,
				actions: {
					hasError: false,
				},
			},
		}));
	};

	updateActions = (actions, error) => {
		this.setState(prevState => ({
			actions,
			error: {
				...prevState.error,
				...error,
			},
		}));
	};

	getErrorStatus = () => {
		this.setState(
			prevState => ({
				error: getErrorMessages(prevState),
			}),
			this.handleSave,
		);
	};

	handleSave = () => {
		const {
			condition,
			description,
			name,
			dataField,
			dataFieldValue,
			query,
			queryValue,
			error,
			selectedIndexes,
			isEditPage,
			enabled,
			timeframe,
		} = this.state;

		let { actions } = this.state;

		const { createRule, updateRule } = this.props;

		const hasError = !!Object.keys(error).length;

		const params = {
			name,
			description,
			trigger: {
				type: condition,
				expression: getExpressionFromValue({
					selectedIndexes,
					dataFieldValue,
					dataField,
					query,
					queryValue,
					condition,
				}),
				timeframe,
			},
		};

		if (!hasError) {
			let selectedFunction;
			actions = actions.map(action => {
				if (action.type === 'function') {
					selectedFunction = get(action, 'data.function');
					return {
						...action,
						data: get(action, 'data.function.service'),
					};
				}
				return action;
			});
			params.actions = actions;
			const { rule } = this.props;
			if (isEditPage) {
				updateRule({
					...params,
					id: rule.id,
					enabled,
				}).then(res => {
					updateFunction(selectedFunction, res);
				});
			} else {
				createRule(params).then(res => {
					updateFunction(selectedFunction, res);
				});
			}
		}
	};

	getChangeStatus = () => {
		const keys = [
			'condition',
			'description',
			'name',
			'dataField',
			'dataFieldValue',
			'query',
			'queryValue',
			'actions',
			'selectedIndexes',
			'enabled',
			'timeframe',
		];

		const { rule } = this.props;
		if (rule) {
			return keys.some(key => {
				return JSON.stringify(rule[key]) !== JSON.stringify(this.state[key]);
			});
		}
		return false;
	};

	handleTime = date => {
		if (date.length) {
			const [startDate, endDate] = date;
			this.setState({
				timeframe: [moment(startDate).unix() * 1000, moment(endDate).unix() * 1000],
			});
		} else {
			this.setState({
				timeframe: null,
			});
		}
	};

	render() {
		const {
			condition,
			description,
			name,
			dataFields,
			searchFields,
			dataField,
			dataFieldValue,
			query,
			queryValue,
			actions,
			selectedIndexes,
			error,
			isEditPage,
			enabled,
			timeframe,
		} = this.state;
		const {
			isCreating,
			rulesLoading,
			isUpdating,
			rule,
			rules,
			removeRule,
			isDeleting,
			unparsedRule,
			tier,
		} = this.props;

		if (tier && validPlans.indexOf(tier) === -1) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/WmzxSHs.png"
						alt="Query Rules"
					/>
				</React.Fragment>
			);
		}

		if (isEditPage && (!rules.length || rulesLoading)) {
			return (
				<div className={container}>
					<Card>
						<Skeleton />
					</Card>
				</div>
			);
		}

		if (isEditPage && !rule) {
			return (
				<div className={container}>
					<Card>
						<Result
							status="404"
							title="No Rule found!"
							subTitle="The rule you are looking for does not exist. Try creating a new rule."
							extra={
								<Link to="/cluster/rules/new">
									<Button type="primary">
										<Icon type="plus" />
										Create Rule
									</Button>
								</Link>
							}
						/>
					</Card>
				</div>
			);
		}

		const errorCount = getErrorCount(error);

		let hasChanged = false;

		if (isEditPage) {
			hasChanged = this.getChangeStatus();
		}
		return (
			<div className={container}>
				<Link to="/cluster/rules">
					<Button>
						<Icon type="arrow-left" />
						Back to Rules
					</Button>
				</Link>
				<Card style={{ marginTop: 15 }} hoverable>
					<div className="space-between">
						<Typography.Title level={3}>
							{isEditPage ? 'Update' : 'Create'} Query Rule
						</Typography.Title>
						{isEditPage ? (
							<div className="flex center">
								<label
									style={{
										fontWeight: 600,
										marginRight: 5,
										color: 'rgba(0,0,0,0.65)',
									}}
									htmlFor="enable"
								>
									{`${enabled ? 'Disable' : 'Enable'} Rule`}
								</label>
								<Switch
									id="enable"
									checked={enabled}
									onChange={this.handleStatus}
								/>
							</div>
						) : null}
					</div>
					<section className={formStyle}>
						<label>Rule Name</label>
						{getErrorMessage(error.name)}
						<Input
							name="name"
							className={getErrorClass(error.name)}
							value={name}
							placeholder="Enter Rule Name"
							onChange={this.handleInput}
						/>

						<label>Rule Description</label>
						<Input.TextArea
							name="description"
							value={description}
							onChange={this.handleInput}
						/>
						<Divider />
						<Row gutter={8}>
							<Col md={12} sm={24}>
								<Typography.Title level={4}>
									If (Set Trigger Condition)
								</Typography.Title>
								<Typography.Text>
									Condition based on which this query rule will be executed
								</Typography.Text>
							</Col>

							<Col md={12} sm={24}>
								<Conditions
									onChange={this.handleInput}
									error={error.condition}
									condition={condition}
									dataFields={dataFields}
									dataField={dataField}
									dataFieldValue={dataFieldValue}
									query={query}
									onDropdownChange={this.handleDropdown}
									queryValue={queryValue}
								/>
								<div style={{ marginBottom: 15 }}>
									<label>
										Index to apply rule to
										<Info content="Select the index or indices to apply the rule to." />
									</label>
									{getErrorMessage(error.selectedIndexes)}
									<IndexDropdown
										error={error && error.selectedIndexes}
										onChange={this.handleIndex}
									/>
								</div>

								<label>
									Timeframe(optional)
									<Info
										content="Set a timeframe during which this rule should be triggered.
									You can also set either of the start time or end time (without setting the other)."
									/>
								</label>
								<RangePicker
									value={
										timeframe && timeframe.length
											? [moment(timeframe[0]), moment(timeframe[1])]
											: null
									}
									onChange={this.handleTime}
									style={{ width: '100%' }}
								/>
							</Col>
						</Row>
						<Divider />
						<Row gutter={8}>
							<Col md={12} sm={24}>
								<Typography.Title level={4}>Then (Set Actions)</Typography.Title>
								<Typography.Text>
									What action to take when above query conditions are satisfied
								</Typography.Text>
							</Col>

							<Col md={12} sm={24}>
								<Actions
									dataFields={dataFields}
									searchFields={searchFields}
									indexes={selectedIndexes}
									actions={actions}
									onChange={this.updateActions}
									error={error}
								/>
								<ActionSelector
									error={error && error.actions}
									actions={actions}
									onChange={this.setActions}
								/>
							</Col>
						</Row>
					</section>
				</Card>
				<Affix offsetBottom={0}>
					<div className={`${isEditPage ? 'space-between' : ''} card-footer`}>
						{isEditPage ? (
							<div>
								<CloneRule
									buttonSize="large"
									buttonStyle={{ marginRight: 10 }}
									ghost
									rule={unparsedRule}
								/>

								<DeleteModal
									name="Rule"
									value={rule.name.toLowerCase().replace(/ /g, '_')}
									title="Delete Rule"
									onDelete={() => removeRule(rule.id)}
								>
									{({ handleModal }) => (
										<Button
											size="large"
											onClick={handleModal}
											ghost
											type="danger"
										>
											<Icon type={isDeleting ? 'loading' : 'delete'} /> Delete
										</Button>
									)}
								</DeleteModal>
							</div>
						) : null}
						<div className="flex flex-end">
							{errorCount ? (
								<Alert
									style={{ marginRight: 10 }}
									message={`${errorCount} values remaining`}
									type="error"
									showIcon
								/>
							) : null}
							{isEditPage && !hasChanged ? (
								<Alert
									style={{ marginRight: 10 }}
									message="No Changes"
									type="info"
									showIcon
								/>
							) : null}
							<Button
								disabled={isEditPage && !hasChanged}
								size="large"
								onClick={this.getErrorStatus}
								type="primary"
							>
								<Icon type={isCreating || isUpdating ? 'loading' : 'save'} />
								Save
							</Button>
						</div>
					</div>
				</Affix>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
	const id = get(props.match, 'params.id');
	const defaultState = {
		isCreating: get(state, '$getAppRules.create.isLoading'),
		createError: get(state, '$getAppRules.create.error.actual'),
		rules: get(state, '$getAppRules.results', []),
		rulesLoading: get(state, '$getAppRules.isFetching'),
		tier: get(state, '$getAppPlan.results.tier'),
	};

	if (id) {
		const ruleData = defaultState.rules.find(rule => rule.id === id);
		return {
			...defaultState,
			rule: getParsedRule(ruleData),
			unparsedRule: ruleData,
			isUpdating: get(ruleData, 'update.isLoading'),
			updateError: get(ruleData, 'update.error'),
			isDeleting: get(ruleData, 'isDeleting'),
			deleteError: get(ruleData, 'deleteError'),
		};
	}

	return defaultState;
};

const mapDispatchToProps = dispatch => ({
	fetchRules: () => dispatch(getRules()),
	createRule: rule => dispatch(addQueryRule(rule)),
	updateRule: rule => dispatch(putRule(rule)),
	removeRule: id => dispatch(deleteRule(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(QueryRulesForm);
