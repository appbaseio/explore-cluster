import React from 'react';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { get } from 'lodash';
import {
	Button,
	Icon,
	Card,
	Typography,
	Input,
	Row,
	Col,
	Divider,
	Radio,
	DatePicker,
	Affix,
	Alert,
	message,
} from 'antd';

import IndexDropdown from './components/IndexDropdown';
import Conditions from './components/Conditions';
import ActionSelector from './components/ActionSelector';
import Actions from './components/Actions';
import { getErrorMessages, getErrorClass, getErrorMessage, getErrorCount } from './error';

import { addQueryRule, getRules } from '../../batteries/modules/actions/rules';

import { getClusterMappings, getDatafields } from '../../utils';

const { RangePicker } = DatePicker;

const container = css`
	padding: 50px;
	position: relative;

	.card-footer {
		width: 100%;
		padding: 20px;
		background: white;
		align-items: center;
		box-sizing: border-box;
		display: flex;
		justify-content: flex-end;
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
	state = {
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

		// actions
		actions: [],

		// internal state
		mappings: [],
		dataFields: [],

		error: {},
	};

	componentDidMount() {
		const { rules, fetchRules } = this.props;

		if (!rules) {
			fetchRules();
		}
		const { selectedIndexes } = this.state;
		getClusterMappings()
			.then(mappings => {
				const dataFields = getDatafields(mappings, selectedIndexes);
				this.setState({
					mappings,
					dataFields,
					dataField: dataFields[0] || '',
				});
			})
			.catch(e => console.log(e));
	}

	componentDidUpdate(prevProps) {
		const { isCreating, createError } = this.props;
		if (!isCreating && prevProps.isCreating !== isCreating) {
			if (createError) {
				message.error(createError);
			} else {
				message.success('Successfully Created Rule');
			}
		}
	}

	handleInput = e => {
		const { name, value } = e.target;
		this.setState(prevState => ({
			[name]: value,
			error: {
				...prevState.error,
				[name]: {
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

	handleIndex = selectedIndexes => {
		const { mappings } = this.state;
		const dataFields = getDatafields(mappings, selectedIndexes);
		this.setState(prevState => ({
			selectedIndexes,
			dataFields,
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

	getCreateRuleStatus = () => {
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
			actions,
			error,
			selectedIndexes,
		} = this.state;

		const { createRule } = this.props;

		const triggerCondition = {
			expression: `'${selectedIndexes.join(',')}' in $index`,
		};

		if (condition === 'filter') {
			if (query && queryValue) {
				triggerCondition.expression = `${triggerCondition.expression} and $query ${query} '${queryValue}'`;
			}

			if (dataField && dataFieldValue) {
				triggerCondition.expression = `${triggerCondition.expression} and $filter.${dataField} matches '${dataFieldValue}`;
			}
		}

		const hasError = !!Object.keys(error).length;

		if (!hasError) {
			createRule({
				name,
				description,
				actions,
				trigger: {
					type: condition,
					...triggerCondition,
				},
			});
		}
	};

	render() {
		const {
			condition,
			description,
			name,
			dataFields,
			dataField,
			dataFieldValue,
			query,
			queryValue,
			actions,
			error,
		} = this.state;
		const { isCreating } = this.props;
		const errorCount = getErrorCount(error);
		return (
			<div className={container}>
				<Link to="/cluster/rules">
					<Button>
						<Icon type="arrow-left" />
						Back to Rules
					</Button>
				</Link>
				<Card style={{ marginTop: 15 }} hoverable>
					<Typography.Title level={3}>Create Query Rule</Typography.Title>
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
								<label>Indexes</label>
								{getErrorMessage(error.selectedIndexes)}
								<IndexDropdown
									error={error && error.selectedIndexes}
									onChange={this.handleIndex}
								/>

								<Radio.Group
									name="condition"
									onChange={this.handleInput}
									value={condition}
									style={{ display: 'flex', margin: '15px 0' }}
								>
									<Radio value="filter">Conditions</Radio>
									<Radio value="always">Always</Radio>
								</Radio.Group>
								{condition === 'filter' ? (
									<Conditions
										onChange={this.handleInput}
										error={error}
										dataFields={dataFields}
										dataField={dataField}
										dataFieldValue={dataFieldValue}
										query={query}
										onDropdownChange={this.handleDropdown}
										queryValue={queryValue}
									/>
								) : null}
								<label>Timeframe</label>
								<RangePicker style={{ width: '100%' }} />
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
									error={error}
									actions={actions}
									onChange={this.updateActions}
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
					<div className="card-footer">
						{errorCount ? (
							<Alert
								style={{ marginRight: 10 }}
								message={`${errorCount} errors found`}
								type="error"
								showIcon
							/>
						) : null}

						<Button size="large" onClick={this.getCreateRuleStatus} type="primary">
							<Icon type={isCreating ? 'loading' : 'save'} />
							Save
						</Button>
					</div>
				</Affix>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	isCreating: get(state, '$getAppRules.create.isLoading'),
	createError: get(state, '$getAppRules.create.error.actual'),
	rules: get(state, '$getAppRules.results'),
});

const mapDispatchToProps = dispatch => ({
	fetchRules: () => dispatch(getRules()),
	createRule: rule => dispatch(addQueryRule(rule)),
});

export default connect(mapStateToProps, mapDispatchToProps)(QueryRulesForm);
