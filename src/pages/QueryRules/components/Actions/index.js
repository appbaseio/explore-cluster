import React from 'react';
import { Card, Tooltip, Icon, Typography, Button } from 'antd';
import { css } from 'emotion';
import DNDWrapper from '../../../../components/DNDWrapper';
// import PromoteResult from './PromoteResult';
// import HideResult from './HideResult';
// import Functions from './Functions';
import CustomData from './CustomData';
import ReplaceSearch from './ReplaceSearch';
import { getErrorMessage } from '../../utils/error';

const componentMappings = {
	replace_search_term: ReplaceSearch,
	custom_data: CustomData,
};

const actionMapping = {
	promote_result: 'Promote Result',
	hide_result: 'Hide Result',
	replace_search_term: 'Replace Search Term',
	custom_data: 'Return Custom Data',
	function: 'f(x) Apply Function',
};

const cardStyles = css`
	margin-bottom: 15px;

	.action-head {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.delete-icon {
			transition: all ease 0.4s;
			transform: rotateX(90deg);
			opacity: 0;
		}

		.drag-icon {
			transition: all ease 0.4s;
			margin-right: 5px;
			padding: 5px;
			font-size: 14px;
			border-radius: 2px;
			&:hover {
				background: #f5f5f5;
			}
		}
	}

	&:hover {
		.action-head {
			.delete-icon {
				transform: rotateX(0);
				opacity: 1;
			}
		}
	}
`;

class Actions extends React.Component {
	onDragEnd = result => {
		if (result.source.index !== result.destination.index) {
			const { actions: originalActions, onChange } = this.props;
			const actions = JSON.parse(JSON.stringify(originalActions));
			const toBePromoted = actions[result.source.index];
			const toBeDemoted = actions[result.destination.index];

			actions[result.source.index] = toBeDemoted;
			actions[result.destination.index] = toBePromoted;
			onChange(actions);
		}
	};

	handleChange = (type, value) => {
		const { actions: originalActions, onChange } = this.props;
		let actions = JSON.parse(JSON.stringify(originalActions));
		switch (type) {
			case 'replace_search_term': {
				actions = actions.map(action => {
					if (action.type === 'replace_search_term') {
						return {
							...action,
							data: value,
						};
					}
					return action;
				});
				break;
			}
			case 'custom_data': {
				actions = actions.map(action => {
					if (action.type === 'custom_data') {
						return {
							...action,
							data: value,
						};
					}
					return action;
				});
				break;
			}
			default:
				return;
		}
		onChange(actions, {
			[type]: {
				hasError: false,
			},
		});
	};

	renderComponent = item => {
		const Component = componentMappings[item.type];
		if (Component) {
			return (
				<Component
					onChange={value => this.handleChange(item.type, value)}
					value={item.data}
				/>
			);
		}
		return null;
	};

	deleteAction = type => {
		const { actions: originalActions, onChange } = this.props;
		const actions = JSON.parse(JSON.stringify(originalActions)).filter(
			item => item.type !== type,
		);

		onChange(actions, {
			[type]: {
				hasError: false,
			},
		});
	};

	render() {
		const { actions, error } = this.props;
		return (
			<React.Fragment>
				<DNDWrapper
					onDragEnd={this.onDragEnd}
					items={actions}
					dropId="ACTIONS"
					idKey="type"
				>
					{({ item, dragProvided, dragSnapshot }) => (
						<Card
							style={{
								background: dragSnapshot.isDragging ? '#e6f7ff' : 'white',
								borderColor:
									error[item.type] && error[item.type].hasError
										? '#f5222d'
										: '#e8e8e8',
							}}
							title={
								<div className="action-head">
									<div>
										<Tooltip title="Drag to reorder action">
											<Icon
												{...dragProvided.dragHandleProps}
												type="drag"
												className="drag-icon"
											/>
										</Tooltip>
										<Typography.Text strong>
											{actionMapping[item.type]}
										</Typography.Text>
									</div>
									<div>
										<Button
											size="small"
											type="danger"
											ghost
											onClick={() => this.deleteAction(item.type)}
											className="delete-icon"
											shape="circle"
											icon="delete"
										/>
									</div>
								</div>
							}
							className={cardStyles}
							key={item.type}
							hoverable
						>
							{getErrorMessage(error[item.type])}
							{this.renderComponent(item)}
						</Card>
					)}
				</DNDWrapper>
			</React.Fragment>
		);
	}
}

export default Actions;
