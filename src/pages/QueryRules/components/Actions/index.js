import React from 'react';
import PropTypes from 'prop-types';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Icon, Tooltip, Typography } from 'antd';
import { css } from 'emotion';
import get from 'lodash/get';
import DNDWrapper from '../../../../components/DNDWrapper';
import CustomData from './CustomData';
import ReplaceSearch from './ReplaceSearch';
import ReplaceWord from './ReplaceWord';
import PromoteResults from './PromoteResults';
import HideResults from './HideResults';
import { getErrorMessage } from '../../utils/error';
import { hasValuesChanged, toolTips } from '../../utils';
import RemoveWord from './RemoveWord';
import Info from '../../../../components/Info';
import SearchSettings from './SearchSettings';
import { removeSubFields } from '../../../../utils';
import AddFilter from './AddFilter';
import ReplaceSearchQuery from './ReplaceSearchQuery';
import ScriptRule from './ScriptRule';

const componentMappings = {
	replace_search_term: ReplaceSearch,
	custom_data: CustomData,
	promote_result: PromoteResults,
	hide_result: HideResults,
	remove_words: RemoveWord,
	replace_words: ReplaceWord,
	search_settings: SearchSettings,
	add_filter: AddFilter,
	replace_search_query: ReplaceSearchQuery,
	script: ScriptRule,
};

const actionMapping = {
	promote_result: 'Promote Result',
	hide_result: 'Hide Result',
	replace_search_term: 'Replace Search Term',
	custom_data: 'Return Custom Data',
	remove_words: 'Remove Word(s)',
	replace_words: 'Replace Word(s)',
	search_settings: 'Set Search Settings',
	add_filter: 'Add Filter',
	replace_search_query: 'Replace Search Query',
	script: 'Script Rule',
};

const errorKeys = Object.keys(actionMapping).map((item) => `error.${item}`);

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

	onDragEnd = (result) => {
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

	handleChange = (type, value, errorObj = {}) => {
		const { actions: originalActions, onChange } = this.props;
		let actions = JSON.parse(JSON.stringify(originalActions));
		actions = actions.map((action) => {
			if (action.type === type) {
				const actionObject = {};

				if (type === 'script') {
					Object.assign(actionObject, {
						...(value.payloadExecutionContextObj || action),
						type,
						script: value.scriptValue,
						envs: value.envs,
					});
				} else {
					Object.assign(actionObject, {
						...action,
						data: value,
					});
				}

				return actionObject;
			}
			return action;
		});

		onChange(actions, {
			[type]: {
				hasError: false,
				...errorObj,
			},
		});
	};

	renderComponent = (item) => {
		const { rule } = this.props;
		const Component = componentMappings[item.type];
		const getProps = () => {
			const defaultProps = { value: item.data, rule };
			const { indexes, searchFields, aggsFields, subFieldsMap } = this.props;
			if (item.type === 'script') {
				const savedExecutionContext = {};
				if (item.request instanceof Object) {
					Object.assign(savedExecutionContext, { request: item.request });
				}
				if (item.response instanceof Object) {
					Object.assign(savedExecutionContext, { response: item.response });
				}
				return {
					scriptId: item.script // we are just checking if the script is present as one of the actions of rule
						? // scriptId is same as rule id so we are fetching it from the URL,
						  // this is safe since script key holds the whole script value after the save action
						  window.location.pathname.split('/').splice(-1)[0]
						: null,
					envs: item.envs || {},
					savedExecutionContext,
				};
			}
			if (item.type === 'promote_result' || item.type === 'hide_result') {
				return {
					...defaultProps,
					indexes,
					dataFields: searchFields,
				};
			}

			if (item.type === 'search_settings') {
				const excludeFields = removeSubFields(get(item, 'data.dataField'));

				// Remove already selected fields from dropdown.
				const fieldsToShow = searchFields.filter(
					(field) => !excludeFields.includes(field.replace('.keyword', '')),
				);

				return {
					...defaultProps,
					searchFields: fieldsToShow,
					subFieldsMap,
				};
			}
			if (item.type === 'add_filter') {
				return {
					...defaultProps,
					aggsFields: aggsFields.filter(
						(field) => !Object.keys(item.data || {}).includes(field),
					),
				};
			}
			return defaultProps;
		};
		if (Component) {
			return (
				<Component
					onChange={(value, errorObj) => this.handleChange(item.type, value, errorObj)}
					{...getProps()}
				/>
			);
		}
		return null;
	};

	deleteAction = (type) => {
		const { actions: originalActions, onChange } = this.props;
		const actions = JSON.parse(JSON.stringify(originalActions)).filter(
			(item) => item.type !== type,
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

										<div
											style={{
												display: 'inline-flex',
												justifyContent: 'center',
												alignItems: 'center',
											}}
										>
											<Typography.Text strong>
												{actionMapping[item.type]}
											</Typography.Text>

											<Info content={toolTips[item.type]} />
										</div>
									</div>
									<div>
										<Button
											size="small"
											type="danger"
											ghost
											onClick={() => this.deleteAction(item.type)}
											className="delete-icon"
											shape="circle"
											icon={<DeleteOutlined />}
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

Actions.propTypes = {
	actions: PropTypes.array,
	onChange: PropTypes.func.isRequired,
	error: PropTypes.object,
	indexes: PropTypes.array,
	searchFields: PropTypes.array,
	subFieldsMap: PropTypes.object,
	aggsFields: PropTypes.array,
	rule: PropTypes.object.isRequired,
};

Actions.defaultProps = {
	actions: [],
	error: {},
	indexes: [],
	searchFields: [],
	subFieldsMap: {},
	aggsFields: [],
};

export default Actions;
