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
} from 'antd';
import { loadApps } from '../../actions';
import IndexDropdown from './components/IndexDropdown';
import Conditions from './components/Conditions';
import { getClusterMappings, getDatafields } from '../../utils';
import ActionSelector from './components/ActionSelector';
import Actions from './components/Actions';

const { RangePicker } = DatePicker;

const container = css`
	padding: 50px;
	position: relative;

	.card-footer {
		width: 100%;
		padding: 20px;
		background: white;
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
	};

	componentDidMount() {
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

	handleInput = e => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	handleDropdown = (name, value) => {
		this.setState({
			[name]: value,
		});
	};

	handleIndex = selectedIndexes => {
		const { mappings } = this.state;
		const dataFields = getDatafields(mappings, selectedIndexes);
		this.setState({
			selectedIndexes,
			dataFields,
			dataField: dataFields[0] || '',
		});
	};

	setActions = action => {
		this.setState(prevState => ({
			actions: [...prevState.actions, action],
		}));
	};

	updateActions = actions => {
		this.setState({
			actions,
		});
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
		} = this.state;
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
						<Input name="name" value={name} onChange={this.handleInput} />

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
								<IndexDropdown onChange={this.handleIndex} />

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
								<Actions actions={actions} onChange={this.updateActions} />
								<ActionSelector actions={actions} onChange={this.setActions} />
							</Col>
						</Row>
					</section>
				</Card>
				<Affix offsetBottom={0}>
					<div className="card-footer">
						<Button type="danger" ghost>
							Cancel
						</Button>

						<Button style={{ marginLeft: 10 }} type="primary">
							Save
						</Button>
					</div>
				</Affix>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	apps: get(state, 'apps'),
});

const mapDispatchToProps = dispatch => ({
	fetchApps: () => dispatch(loadApps()),
});

export default connect(mapStateToProps, mapDispatchToProps)(QueryRulesForm);
