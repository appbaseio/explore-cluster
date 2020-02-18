import React from 'react';
import { Card, Row, Col, Icon, Button, Switch, Tooltip, Typography, message } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import ActionView from './ActionView';
import MobileMenu from './MobileMenu';
import { deleteRule, toggleRuleStatus } from '../../../batteries/modules/actions';
import { hasValuesChanged } from '../utils';
import DeleteModal from '../../../components/DeleteModal';

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
`;

class QueryCard extends React.Component {
	shouldComponentUpdate(nextProps) {
		return hasValuesChanged(this.props, nextProps, ['rule', 'dragProvided', 'dragSnapshot']);
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

	handleRuleStatus = value => {
		const { toggleRule, rule } = this.props;
		toggleRule({
			id: rule.id,
			enabled: value,
		});
	};

	render() {
		const { rule, dragProvided, dragSnapshot, removeRule } = this.props;
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
						<MobileMenu />
					</div>
					<Col xs={1}>
						<Tooltip title="Drag to update the ordering of rules">
							<div {...dragProvided.dragHandleProps} className={dragIcon}>
								<Icon type="drag" />
								<Typography.Text strong>{rule.order}</Typography.Text>
							</div>
						</Tooltip>
					</Col>
					<Col xl={7} lg={7} md={11} sm={24}>
						<h4 className={title}>{rule.name}</h4>
						<p className={description}>{rule.description}</p>
						<p className={description}>
							<strong>{rule.trigger.expression}</strong>
						</p>
					</Col>
					<Col lg={7} md={12} sm={24}>
						{rule.actions.map(action => (
							<div key={action.type} className={section}>
								<ActionView action={action} />
							</div>
						))}
					</Col>
					<Col xl={9} lg={9} xs={0}>
						<div className={actions}>
							<DeleteModal
								name="Rule"
								value={rule.name.toLowerCase().replace(/ /g, '_')}
								title="Delete Rule"
								onDelete={() => removeRule(rule.id)}
							>
								{({ handleModal }) => (
									<Button
										onClick={handleModal}
										className="show-on-hover"
										ghost
										size={actionButtonSize}
										type="danger"
									>
										<Icon type={rule.isDeleting ? 'loading' : 'delete'} />{' '}
										Delete
									</Button>
								)}
							</DeleteModal>
							<Button size={actionButtonSize} type="primary">
								<Icon type="copy" /> Clone
							</Button>
							<Link to={`/cluster/rules/${rule.id}`}>
								<Button size={actionButtonSize} type="primary">
									<Icon type="edit" /> Edit
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
								{rule.enabled ? 'Disable' : 'Enable'} Rule
							</Typography.Text>
							<Switch
								loading={rule.isToggling}
								checked={rule.enabled}
								onChange={this.handleRuleStatus}
							/>
						</div>
					</Col>
				</Row>
			</Card>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	removeRule: id => dispatch(deleteRule(id)),
	toggleRule: rule => dispatch(toggleRuleStatus(rule)),
});

export default connect(null, mapDispatchToProps)(QueryCard);
