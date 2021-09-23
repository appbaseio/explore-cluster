/* eslint-disable no-param-reassign,camelcase,jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for,jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import get from 'lodash/get';
import pick from 'lodash/pick';
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
	Radio,
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
import { getUsageStats } from '../../batteries/modules/actions';

import CloneRule from './components/CloneRule';
import Info from '../../components/Info';
import {
	deleteQueryRuleInFunction,
	getClusterMappings,
	getDatafields,
	getSelectedIndexes,
	handleQueryRuleDelete,
	updateFunction,
} from '../../utils';
import { bannerDetails, getExpressionFromValue, getParsedRule } from './utils';
import DeleteModal from '../../components/DeleteModal';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { mediaKey } from '../../utils/media';
import { getSingleFunction } from '../../batteries/utils/app';
import { isValidPlan } from '../../batteries/utils';

import { AdvancedEditor, CustomAutoComplete } from '../../components/AdvancedEditor';
import { getRawQuery, parseExpression } from '../../components/AdvancedEditor/helper';
import { allowedTiers } from '../../utils/prop-types';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';

const customReactFilter = css`
	.react-filter-box {
		height: 100%;
	}
	.react-filter-box.focus {
		border-color: #40a9ff;
		box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
	}
	.react-filter-box.error {
		border-color: #f5222d;
		box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
	}
	.CodeMirror {
		height: 100%;
	}
`;

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

DocsLink.propTypes = {
	url: PropTypes.string.isRequired,
};

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
			query: '==',
			queryValue: '',

			timeframe: null,

			// rule status
			enabled: false,

			// actions
			actions: [],

			// internal state
			mappings: [],
			dataFields: [],
			aggsFields: [],
			searchFields: [],
			isEditPage: !!hasId,

			subFieldsMap: {},

			error: {},
			loading: false,
			editorKey: Date.now(),
		};
	}

	componentDidMount() {
		const { rules, fetchRules, rule, unparsedRule, fetchUsageStats, usageStats } = this.props;
		const { isEditPage } = this.state;
		if (!(rules && rules.length)) {
			fetchRules();
		}
		if (!usageStats) {
			fetchUsageStats();
		}
		if (isEditPage && rule) {
			const { show_advance_editor } = rule;
			const { rawQuery, indexes } = getRawQuery(show_advance_editor, unparsedRule);
			this.setState({
				...rule,
				rawQuery,
				advancedExpression: rawQuery,
				selectedIndexes: show_advance_editor ? indexes : rule.selectedIndexes,
			});
		}
		this.setState({ loading: true });
		getClusterMappings()
			.then((mappings) => {
				const { selectedIndexes } = this.state;
				const [dataFields, fieldMap, subFieldsMap] = getDatafields({
					mappings,
					indexes: ['*'],
				});
				const [searchFields] = getDatafields({
					mappings,
					indexes: selectedIndexes,
					isSearch: true,
				});
				const [aggsFields] = getDatafields({
					mappings,
					indexes: selectedIndexes,
					isAggs: true,
				});
				this.setState({
					mappings,
					dataFields,
					searchFields,
					aggsFields,
					fieldMap,
					subFieldsMap,
					loading: false,
				});
			})
			.catch((e) => {
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
			unparsedRule,
		} = this.props;
		const { isEditPage } = this.state;

		if (isEditPage && prevProps.rule !== rule && !isUpdating) {
			const { show_advance_editor } = rule;
			const { rawQuery, indexes } = getRawQuery(show_advance_editor, unparsedRule);
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({
				...rule,
				rawQuery,
				advancedExpression: rawQuery,
				selectedIndexes: show_advance_editor ? indexes : rule.selectedIndexes,
			});
		}

		if (!isEditPage && !isCreating && prevProps.isCreating !== isCreating) {
			if (createError) {
				notification.error({ message: 'error', description: get(createError, 'message') });
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

	getAlertMessage = (hasChanged, isCreating, isUpdating, count) => {
		let str = '';
		if (!hasChanged && !(isCreating || isUpdating)) {
			str += 'No Changes, ';
		}
		if (count > 0) {
			str += `Used ${count} times in last 30 days`;
		} else {
			str += 'Not used in the last 30 days';
		}
		return str;
	};

	handleInput = (e) => {
		const { name, value } = e.target;
		this.setState((prevState) => ({
			[name]: value,
			actions:
				name === 'condition'
					? prevState.actions.filter((action) => action.type !== 'replace_search_term')
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

	handleStatus = (value) => {
		this.setState({
			enabled: value,
		});
	};

	handleIndex = (selectedIndexes) => {
		const { mappings } = this.state;
		const [dataFields] = getDatafields({ mappings, indexes: selectedIndexes });
		const [searchFields] = getDatafields({
			mappings,
			indexes: selectedIndexes,
			isSearch: true,
		});
		const [aggsFields] = getDatafields({
			mappings,
			indexes: selectedIndexes,
			isAggs: true,
		});

		this.setState((prevState) => ({
			editorKey: Date.now(),
			selectedIndexes,
			dataFields,
			searchFields,
			aggsFields,
			dataField: dataFields.includes(prevState.dataField) ? prevState.dataField : '',
			error: {
				...prevState.error,
				selectedIndexes: {
					hasError: false,
				},
			},
		}));
	};

	setActions = (action) => {
		this.setState((prevState) => ({
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
		this.setState((prevState) => ({
			actions,
			error: {
				...prevState.error,
				...error,
			},
		}));
	};

	getErrorStatus = () => {
		this.setState(
			(prevState) => ({
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
			show_advance_editor,
			advancedExpression,
			fieldMap,
		} = this.state;

		let { actions } = this.state;

		const { createRule, updateRule } = this.props;

		const hasError = !!Object.keys(error).length;

		const suffixExpression = `and ${parseExpression(advancedExpression, fieldMap)}`;

		function getExpression() {
			return show_advance_editor
				? `'${(selectedIndexes || []).join(',')}' in $index ${
						advancedExpression ? suffixExpression : ''
				  }`
				: getExpressionFromValue({
						selectedIndexes,
						dataFieldValue,
						dataField,
						query,
						queryValue,
						condition,
				  });
		}

		const params = {
			name,
			description,
			show_advance_editor,
			trigger: {
				type: condition,
				expression: condition === 'always' ? '' : getExpression(),
				timeframe,
			},
		};

		if (!hasError) {
			let selectedFunction;
			actions = actions.map((action) => {
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
				}).then((res) => {
					const prevFunction = get(
						unparsedRule.actions.find((ruleObj) => ruleObj.type === 'function'),
						'data',
					);
					const newFunction = get(
						actions.find((ruleObj) => ruleObj.type === 'function'),
						'data',
					);
					if (prevFunction !== newFunction && prevFunction) {
						getSingleFunction(prevFunction).then((func) => {
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
				createRule(params).then((res) => {
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

		const { props, state } = this;
		const { show_advance_editor } = state;

		if (show_advance_editor) keys.push('advancedExpression');

		const { rule } = props;
		if (rule) {
			return keys.some((key) => {
				return JSON.stringify(rule[key]) !== JSON.stringify(state[key]);
			});
		}
		return false;
	};

	handleTime = (date) => {
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

	onParseOk = () => {
		const { rawQuery } = this.state;
		if (!rawQuery) return;
		this.setState((prevState) => ({
			advancedExpression: rawQuery,
			expressionError: false,
			error: {
				...prevState.error,
				condition: {
					hasError: false,
				},
			},
		}));
	};

	onParseError = () => {
		this.setState({ expressionError: true });
	};

	toggleAdvancedEditor = () => {
		this.setState((prevState) => ({ show_advance_editor: !prevState.show_advance_editor }));
	};

	handleExpression = (raw) => {
		if ((raw || '').trim() === '') {
			const value = (raw || '').trim();
			this.setState({
				rawQuery: value,
				advancedExpression: value,
				expressionError: false,
			});
		} else {
			this.setState({ rawQuery: raw });
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
			aggsFields,
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
			show_advance_editor,
			rawQuery,
			editorKey,
			subFieldsMap,
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
			featureRules,
			usageStats,
		} = this.props;

		this.customAutoComplete = new CustomAutoComplete(null, [
			{ columnField: '$query', type: 'selection' },
			...dataFields.map((field) => ({
				columnField: field.replace(/.keyword/g, ''),
				type: 'selection',
			})),
		]);

		if (!isValidPlan(tier, featureRules)) {
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
								<label style={{ marginTop: 15 }}>
									Trigger
									<Info
										content={
											<>
												When to trigger the rule. Choose one of the two
												options, a condition or an always on trigger.{' '}
												<a
													href="https://docs.appbase.io/docs/search/Rules/#configure-if-condition"
													target="_blank"
													rel="noopener noreferrer"
												>
													Learn more
												</a>
											</>
										}
									/>
								</label>
								<Radio.Group
									name="condition"
									onChange={this.handleInput}
									value={condition}
									style={{ display: 'flex', marginBottom: '15px' }}
								>
									<Radio value="filter">Set Condition</Radio>
									<Radio value="always">Always Trigger</Radio>
								</Radio.Group>
								{condition === 'filter' && (
									<>
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
										<label
											style={{
												marginBottom: 15,
												color: '#1890ff',
												cursor: 'pointer',
											}}
											onClick={this.toggleAdvancedEditor}
										>
											{show_advance_editor ? 'Hide' : 'Show'} Advanced Editor
										</label>
									</>
								)}
								{!show_advance_editor && (
									<ErrorToaster inline>
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
									</ErrorToaster>
								)}
								{show_advance_editor && condition === 'filter' && (
									<div className={customReactFilter}>
										<label>
											Advanced Editor
											<Info
												content={`Handle complex queries with nested operations. Use double quotes (") for strings that include spaces, e.g $query == "Jhon Mae"`}
											/>
										</label>
										{getErrorMessage(error.condition)}
										<ErrorToaster inline>
											<AdvancedEditor
												key={editorKey}
												query={rawQuery}
												onChange={this.handleExpression}
												autoCompleteHandler={this.customAutoComplete}
												onParseOk={this.onParseOk}
												onParseError={this.onParseError}
											/>
										</ErrorToaster>
									</div>
								)}

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
									disabledDate={(current) => {
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
								<ErrorToaster inline>
									<Actions
										dataFields={dataFields}
										searchFields={searchFields}
										aggsFields={aggsFields}
										indexes={getSelectedIndexes(selectedIndexes, mappings)}
										actions={actions}
										onChange={this.updateActions}
										error={error}
										subFieldsMap={subFieldsMap}
									/>
								</ErrorToaster>
								<ErrorToaster inline>
									<ActionSelector
										error={error && error.actions}
										actions={actions}
										condition={condition}
										onChange={this.setActions}
									/>
								</ErrorToaster>
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
									value={(rule.name || '').toLowerCase().replace(/ /g, '_')}
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
							{isEditPage && (
								<Alert
									style={{ marginRight: 10 }}
									type="info"
									showIcon
									message={this.getAlertMessage(
										hasChanged,
										isCreating,
										isUpdating,
										usageStats[rule.id]?.count,
									)}
								/>
							)}
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

QueryRulesForm.propTypes = {
	isCreating: PropTypes.bool,
	createError: PropTypes.object,
	rule: PropTypes.object,
	isUpdating: PropTypes.bool,
	updateError: PropTypes.object,
	deleteError: PropTypes.string,
	isDeleting: PropTypes.bool,
	history: PropTypes.object.isRequired,
	unparsedRule: PropTypes.object,
	rulesLoading: PropTypes.bool,
	rules: PropTypes.array,
	removeRule: PropTypes.func.isRequired,
	tier: allowedTiers,
	featureRules: PropTypes.bool,
	createRule: PropTypes.func.isRequired,
	updateRule: PropTypes.func.isRequired,
	match: PropTypes.object.isRequired,
	fetchRules: PropTypes.func.isRequired,
	fetchUsageStats: PropTypes.func.isRequired,
	usageStats: PropTypes.object.isRequired,
};

QueryRulesForm.defaultProps = {
	isCreating: false,
	createError: null,
	rule: null,
	isUpdating: false,
	updateError: null,
	deleteError: undefined,
	isDeleting: false,
	unparsedRule: null,
	rulesLoading: false,
	rules: null,
	tier: undefined,
	featureRules: false,
};

const mapStateToProps = (state, props) => {
	const id = get(props.match, 'params.id');
	const defaultState = {
		isCreating: get(state, '$getAppRules.create.isLoading'),
		createError: get(state, '$getAppRules.create.error.actual'),
		rules: get(state, '$getAppRules.results', []),
		rulesLoading: get(state, '$getAppRules.isFetching'),
		tier: get(state, '$getAppPlan.results.tier'),
		featureRules: get(state, '$getAppPlan.results.feature_rules', false),
		usageStats: get(state, '$getUsageStats.results', {}),
	};

	if (id) {
		const ruleData = defaultState.rules.find((rule) => rule.id === id) || {};
		const { type, timeframe } = ruleData.trigger || {};
		ruleData.condition = type;
		ruleData.timeframe = timeframe || null;
		return {
			...defaultState,
			rule: get(ruleData, 'show_advance_editor') ? ruleData : getParsedRule(ruleData),
			unparsedRule: ruleData,
			isUpdating: get(ruleData, 'update.isLoading'),
			updateError: get(ruleData, 'update.error'),
			isDeleting: get(ruleData, 'isDeleting'),
			deleteError: get(ruleData, 'deleteError'),
		};
	}

	return defaultState;
};

const mapDispatchToProps = (dispatch) => ({
	fetchRules: () => dispatch(getRules()),
	createRule: (rule) => dispatch(addQueryRule(rule)),
	updateRule: (rule) => dispatch(putRule(rule)),
	removeRule: (id) => dispatch(deleteRule(id)),
	fetchUsageStats: () => dispatch(getUsageStats()),
});

export default connect(mapStateToProps, mapDispatchToProps)(QueryRulesForm);
