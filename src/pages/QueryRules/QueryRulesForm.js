import React from 'react';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { get, pick } from 'lodash';
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
	notification,
	Result,
	Row,
	Skeleton,
	Switch,
	Tooltip,
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
import {
	deleteQueryRuleInFunction,
	getClusterMappings,
	getDatafields,
	getSelectedIndexes,
	handleQueryRuleDelete,
	updateFunction,
} from '../../utils';
import { bannerDetails, getExpressionFromValue, getParsedRule, validPlans } from './utils';
import DeleteModal from '../../components/DeleteModal';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { mediaKey } from '../../utils/media';
import { getSingleFunction } from '../../batteries/utils/app';

const { RangePicker } = DatePicker;

const link = css`
	font-size: 14px;
	margin-right: 30px;
	cursor: pointer;
	i {
		margin-right: 4px;
	}

	${mediaKey.small} {
		display: block;
		line-height: 48px;
	}
`;

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

function DocsLink({ url }) {
	return (
		<a href={url} className={link} target="_blank" rel="noopener noreferrer">
			Learn more <Icon type="link" />
		</a>
	);
}

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
			query: 'matches',
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
			loading: false,
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
		this.setState({ loading: true });
		getClusterMappings()
			.then(mappings => {
				const dataFields = getDatafields(mappings, ['*']);
				const searchFields = getDatafields(mappings, ['*'], true);
				this.setState({
					mappings,
					dataFields,
					searchFields,
					loading: false,
				});
			})
			.catch(e => {
				this.setState({ loading: false });
				console.log(e);
			});
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
				notification.error({ message: 'Error', description: updateError.message });
			} else {
				message.success('successfully updated rule');
				history.push('/cluster/rules');
			}
		}

		if (isEditPage && !isDeleting && prevProps.isDeleting !== isDeleting) {
			if (deleteError) {
				message.error(deleteError);
			} else {
				message.success('successfully deleted rule');
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
					selectedFunction = pick(action.data, [
						'enabled',
						'order',
						'trigger',
						'extraRequestPayload',
						'function',
						'queryRules',
					]);
					return {
						...action,
						data: get(action, 'data.function.service') || action.data,
					};
				}
				return action;
			});
			params.actions = actions;
			const { rule, unparsedRule } = this.props;
			if (isEditPage) {
				updateRule({
					...params,
					id: rule.id,
					enabled,
				}).then(res => {
					const prevFunction = get(
						unparsedRule.actions.find(rule => rule.type === 'function'),
						'data',
					);
					const newFunction = get(
						actions.find(rule => rule.type === 'function'),
						'data',
					);
					if (prevFunction !== newFunction && prevFunction) {
						getSingleFunction(prevFunction).then(func => {
							updateFunction({
								selectedFunction: func,
								res,
								updateQueryFn: deleteQueryRuleInFunction,
								description: null,
							});
							updateFunction({
								selectedFunction,
								res,
							});
						});
					} else
						updateFunction({
							selectedFunction,
							res,
						});
				});
			} else {
				createRule(params).then(res => {
					updateFunction({
						selectedFunction,
						res,
					});
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
				timeframe: {
					start_time: moment(startDate).unix(),
					end_time: moment(endDate).unix(),
				},
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
			mappings,
			loading,
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
						src="https://i.imgur.com/SL8nuRt.png"
						alt="Query Rules"
					/>
				</React.Fragment>
			);
		}

		if ((isEditPage && (!rules.length || rulesLoading)) || loading) {
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
									Rule Status
								</label>
								<Tooltip
									title={`Toggle to ${enabled ? 'disable' : 'enable'} the rule`}
								>
									<Switch
										id="enable"
										checked={enabled}
										onChange={this.handleStatus}
									/>
								</Tooltip>
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
						<Input name="description" value={description} onChange={this.handleInput} />
						<Divider />
						<Row gutter={8}>
							<Col md={12} sm={24}>
								<Typography.Title level={4}>
									If (Set Trigger Condition)
								</Typography.Title>
								<Typography.Text>
									<div>
										Condition based on which this query rule will be executed.
									</div>
									<div style={{ marginTop: 10 }}>
										<DocsLink url="https://docs.appbase.io/docs/search/Rules/#configure-if-condition" />
									</div>
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
										selectedIndexes={selectedIndexes}
										error={error && error.selectedIndexes}
										onChange={this.handleIndex}
									/>
								</div>

								<label>
									Timeframe (optional)
									<Info
										content="Set a timeframe during which this rule should be triggered.
									You can also set either of the start time or end time (without setting the other)."
									/>
								</label>
								<RangePicker
									value={
										timeframe
											? [
													moment(timeframe.start_time * 1000),
													moment(timeframe.end_time * 1000),
											  ]
											: null
									}
									onChange={this.handleTime}
									style={{ width: '100%' }}
									disabledDate={current => {
										// Can not select days before today
										const now = new Date();
										now.setHours(0, 0, 0, 0);
										return current && current.valueOf() < now.valueOf();
									}}
								/>
							</Col>
						</Row>
						<Divider />
						<Row gutter={8}>
							<Col md={12} sm={24}>
								<Typography.Title level={4}>Then (Set Actions)</Typography.Title>
								<Typography.Text>
									<div>
										What action to take when above query conditions are
										satisfied
									</div>
									<div style={{ marginTop: 10 }}>
										<DocsLink url="https://docs.appbase.io/docs/search/Rules/#configure-then-actions" />
									</div>
								</Typography.Text>
							</Col>

							<Col md={12} sm={24}>
								<Actions
									dataFields={dataFields}
									searchFields={searchFields}
									indexes={getSelectedIndexes(selectedIndexes, mappings)}
									actions={actions}
									onChange={this.updateActions}
									error={error}
								/>
								<ActionSelector
									error={error && error.actions}
									actions={actions}
									condition={condition}
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
									onDelete={() => handleQueryRuleDelete(rule, removeRule)}
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
							{isEditPage && !hasChanged && !(isCreating || isUpdating) ? (
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
