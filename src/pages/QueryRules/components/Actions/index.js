import React from 'react';
import { Button, Card, Icon, Tooltip, Typography } from 'antd';
import { css } from 'emotion';
import DNDWrapper from '../../../../components/DNDWrapper';
import CustomData from './CustomData';
import ReplaceSearch from './ReplaceSearch';
import PromoteResults from './PromoteResults';
import HideResults from './HideResults';
import ExecuteFunction from './ExecuteFunction';
import { getErrorMessage } from '../../utils/error';
import { hasValuesChanged } from '../../utils';

const componentMappings = {
	replace_search_term: ReplaceSearch,
	custom_data: CustomData,
	promote_result: PromoteResults,
	hide_result: HideResults,
	function: ExecuteFunction,
};

const actionMapping = {
	promote_result: 'Promote Result',
	hide_result: 'Hide Result',
	replace_search_term: 'Replace Search Term',
	custom_data: 'Return Custom Data',
	function: 'f(x) Apply Function',
};

const errorKeys = Object.keys(actionMapping).map(item => `error.${item}`);

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
	shouldComponentUpdate(nextProps) {
		return hasValuesChanged(this.props, nextProps, [
			'actions',
			'dataFields',
			'searchFields',
			...errorKeys,
		]);
	}

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
			case 'promote_result': {
				actions = actions.map(action => {
					if (action.type === 'promote_result') {
						return {
							...action,
							data: value,
						};
					}
					return action;
				});
				break;
			}
			case 'hide_result': {
				actions = actions.map(action => {
					if (action.type === 'hide_result') {
						return {
							...action,
							data: value,
						};
					}
					return action;
				});
				break;
			}
			case 'function': {
				actions = actions.map(action => {
					if (action.type === 'function') {
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
		const getProps = () => {
			const defaultProps = { value: item.data };
			const { indexes, searchFields } = this.props;
			if (item.type === 'promote_result' || item.type === 'hide_result') {
				return {
					...defaultProps,
					indexes,
					dataFields: searchFields,
				};
			}
			return defaultProps;
		};
		if (Component) {
			return (
				<Component
					onChange={value => this.handleChange(item.type, value)}
					{...getProps()}
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
