import React from 'react';
import { Card, Tooltip, Icon, Typography, Button } from 'antd';
import { css } from 'emotion';
import DNDWrapper from '../../../../components/DNDWrapper';
// import PromoteResult from './PromoteResult';
// import HideResult from './HideResult';
// import Functions from './Functions';
// import CustomData from './CustomData';
// import ReplaceSearch from './ReplaceSearch';

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

	render() {
		const { actions } = this.props;
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
							Cool
						</Card>
					)}
				</DNDWrapper>
			</React.Fragment>
		);
	}
}

export default Actions;
