import React from 'react';
import PropTypes from 'prop-types';
import {
	CheckCircleTwoTone,
	DragOutlined,
	EditOutlined,
	EditTwoTone,
	LoadingOutlined,
	DeleteOutlined,
} from '@ant-design/icons';
import {
	Alert,
	Button,
	Card,
	Col,
	InputNumber,
	message,
	Row,
	Switch,
	Tooltip,
	Typography,
} from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import get from 'lodash/get';
import ActionView from './ActionView';
import MobileMenu from './MobileMenu';
import { deleteRule, toggleRuleStatus, reorderRules } from '../../../batteries/modules/actions';
import CloneRule from './CloneRule';
import { hasValuesChanged } from '../utils';
import DeleteModal from '../../../components/DeleteModal';
import { handleQueryRuleDelete } from '../../../utils';
import { unParseExpression } from '../../../components/AdvancedEditor/helper';

const title = css`
	font-size: 16px;
	color: rgba(0, 0, 0, 0.85);
	margin: 0;
	font-weight: bold;
`;

const description = css`
	color: rgba(0, 0, 0, 0.65);
	font-size: 14px;
	margin: 0;
`;

const section = css`
	margin-bottom: 10px;
`;

const actions = css`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	justify-content: flex-end;

	button:not(:first-child),
	a {
		margin-left: 5px;
	}
	@media (max-width: 1024px) {
		button {
			margin-top: 5px;
		}
	}
`;

const dragIcon = css`
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	padding: 2px;
	border-radius: 2px;
	transition: all ease 0.2s;
	&:hover {
		background: #f5f5f5;
	}
`;

const mobileMenu = css`
	display: none;
	@media (max-width: 992px) {
		display: block;
		position: absolute;
		top: 0;
		right: 0;
		z-index: 1;
	}
`;

const card = css`
	.show-on-hover {
		transform: rotateX(90deg);
		opacity: 0;
		transition: all ease 0.3s;
	}
	&:hover {
		.show-on-hover {
			transform: rotateX(0deg);
			opacity: 1;
		}
	}
	.ant-input-number-handler-wrap {
		display: none;
	}
`;

class QueryCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isEdit: false,
			value: props.rule.order,
		};
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { isEdit, value } = this.state;
		return (
			hasValuesChanged(this.props, nextProps, [
				'rule',
				'dragProvided',
				'dragSnapshot',
				'index',
				'usageStatsCount',
			]) ||
			isEdit !== nextState.isEdit ||
			value !== nextState.value
		);
	}

	componentDidUpdate(prevProps) {
		const {
			rule: { deleteError, toggleError },
		} = this.props;
		if (deleteError !== prevProps.rule.deleteError) {
			message.error('Error while deleting rule');
		}

		if (toggleError !== prevProps.rule.toggleError) {
			message.error('Error while updating rule status');
		}
	}

	handleRuleStatus = (value) => {
		const { toggleRule, rule } = this.props;
		toggleRule({
			id: rule.id,
			enabled: value,
		});
	};

	render() {
		const {
			rule,
			dragProvided,
			dragSnapshot,
			removeRule,
			toggleRule,
			index, // eslint-disable-line
			usageStatsCount,
			updateOrder,
			hasError,
		} = this.props;
		const { isEdit, value } = this.state;
		const actionButtonSize = window.innerWidth < 1090 ? 'small' : 'default';

		return (
			<Card
				hoverable
				className={card}
				style={{
					background: dragSnapshot.isDragging ? '#e6f7ff' : 'white',
				}}
			>
				<Row style={{ position: 'relative' }} gutter={8}>
					<div className={mobileMenu}>
						<MobileMenu rule={rule} removeRule={removeRule} toggleRule={toggleRule} />
					</div>
					<Col xs={3}>
						<div style={{ display: 'flex' }}>
							<Tooltip title="Drag to update the ordering of rules.">
								<div {...dragProvided.dragHandleProps} className={dragIcon}>
									<DragOutlined />
								</div>
							</Tooltip>

							<div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
								{isEdit ? (
									<InputNumber
										style={{
											width: 50,
										}}
										min={1}
										value={rule.order}
										onChange={(val) => {
											this.setState({ value: val });
										}}
										onPressEnter={(e) => {
											if (parseInt(e.target.value, 10) !== rule.order) {
												updateOrder({
													toBePromoted: {
														id: rule.id,
														order: parseInt(e.target.value, 10),
													},
													toBeDemoted: {
														id: rule.id,
														order: rule.order,
													},
												});
												if (hasError) {
													message.error('Error while re-ordering items');
												} else {
													message.success(
														`Rule re-ordered successfully from ${
															rule.order
														} to ${parseInt(e.target.value, 10)}`,
													);
												}
												this.setState({ isEdit: false });
											}
										}}
										// onBlur={(e) => {
										// 	this.setState({isEdit: false})
										// }}
									/>
								) : (
									<div>{rule.order}</div>
								)}
								<Tooltip title="Click to edit the order.">
									{isEdit ? (
										// eslint-disable-next-line
										<CheckCircleTwoTone
											onClick={() => {
												if (parseInt(value, 10) !== rule.order) {
													updateOrder({
														toBePromoted: {
															id: rule.id,
															order: parseInt(value, 10),
														},
														toBeDemoted: {
															id: rule.id,
															order: rule.order,
														},
													});
													if (hasError) {
														message.error(
															'Error while re-ordering items',
														);
													} else {
														message.success(
															`Rule re-ordered successfully from ${
																rule.order
															} to ${parseInt(value, 10)}`,
														);
													}
												}
												this.setState({ isEdit: false });
											}}
										/>
									) : (
										// eslint-disable-next-line
										<EditTwoTone
											onClick={() => {
												this.setState({ isEdit: true });
											}}
										/>
									)}
								</Tooltip>
							</div>
						</div>
					</Col>
					<Col xl={7} lg={7} md={11} sm={24}>
						<h4 className={title}>{rule.name}</h4>
						<p className={description}>{rule.description}</p>
						<p className={description}>
							<strong>
								{unParseExpression(get(rule, 'trigger.expression', ''))}
							</strong>
						</p>
					</Col>
					<Col lg={7} md={12} sm={24}>
						{get(rule, 'actions', []).map((action) => (
							<div key={action.type} className={section}>
								<ActionView action={action} ruleId={rule.id} />
							</div>
						))}
					</Col>
					<Col xl={7} lg={9} xs={0}>
						<div className={actions}>
							<DeleteModal
								name="rule"
								value={rule.name}
								title="Delete Rule"
								onDelete={() => handleQueryRuleDelete(rule, removeRule)}
							>
								{({ handleModal }) => (
									<div
										className="show-on-hover"
										style={{
											marginRight: 10,
											marginBottom: 3,
											color: '#999',
										}}
										onClick={handleModal}
									>
										{rule.isDeleting ? <LoadingOutlined /> : <DeleteOutlined />}{' '}
										Delete
									</div>
								)}
							</DeleteModal>
							<CloneRule rule={rule} buttonSize={actionButtonSize} />
							<Link to={`/cluster/rules/${rule.id}`}>
								<Button size={actionButtonSize} type="primary">
									<EditOutlined /> Edit
								</Button>
							</Link>
						</div>
						<div
							style={{
								marginTop: 30,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'flex-end',
							}}
						>
							<Typography.Text strong style={{ marginRight: 5 }}>
								Rule Status
							</Typography.Text>
							<Tooltip
								title={`Toggle to ${rule.enabled ? 'disable' : 'enable'} the rule`}
							>
								<Switch
									loading={rule.isToggling}
									checked={rule.enabled}
									onChange={this.handleRuleStatus}
								/>
							</Tooltip>
						</div>
					</Col>
				</Row>
				<Row style={{ width: '100%', marginTop: 10 }}>
					<Alert
						type="info"
						showIcon
						style={{ flex: 1 }}
						message={
							usageStatsCount > 0
								? `Used ${usageStatsCount} times in last 30 days`
								: 'Not used in the last 30 days'
						}
					/>
				</Row>
			</Card>
		);
	}
}

QueryCard.defaultProps = {
	rule: {},
	dragProvided: {},
	dragSnapshot: {},
	hasError: false,
};

QueryCard.propTypes = {
	rule: PropTypes.object,
	dragProvided: PropTypes.object,
	dragSnapshot: PropTypes.object,
	removeRule: PropTypes.func.isRequired,
	toggleRule: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
	usageStatsCount: PropTypes.number.isRequired,
	updateOrder: PropTypes.func.isRequired,
	hasError: PropTypes.bool,
};

const mapStateToProps = (state) => ({
	hasError: get(state, '$getAppRules.error'),
});

const mapDispatchToProps = (dispatch) => ({
	updateOrder: ({ toBePromoted, toBeDemoted }) =>
		dispatch(reorderRules({ toBePromoted, toBeDemoted })),
	removeRule: (id) => dispatch(deleteRule(id)),
	toggleRule: (rule) => dispatch(toggleRuleStatus(rule)),
});

export default connect(mapStateToProps, mapDispatchToProps)(QueryCard);
