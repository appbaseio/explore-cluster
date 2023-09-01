import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { Card, Select } from 'antd';
import { getErrorClass, getErrorMessage } from '../utils/error';
import { hasValuesChanged } from '../utils';

const { Option } = Select;

const cardStyles = css`
	border-style: dashed;
`;

const actions = {
	promote_result: {
		name: 'Promote Result',
		data: [],
	},
	hide_result: {
		name: 'Hide Result',
		data: [],
	},
	replace_search_term: {
		name: 'Replace Search Term',
		data: '',
		isDisabledOnAlways: true,
	},
	custom_data: {
		name: 'Return Custom Data',
		data: '',
	},
	remove_words: {
		name: 'Remove Word(s)',
		data: [],
	},
	replace_words: {
		name: 'Replace Word(s)',
		data: {},
	},
	search_settings: {
		name: 'Search Settings',
		data: {
			dataField: [],
			fieldWeights: [],
		},
	},
	add_filter: {
		name: 'Add Filter',
		data: {},
	},
	replace_search_query: {
		name: 'Replace Search Query',
		data: '',
	},
	script: {
		name: 'Script Rule',
		script: '',
	},
};

class ActionSelector extends React.Component {
	state = { healthy: true, actionName: null };

	shouldComponentUpdate(nextProps, nextState) {
		const { healthy } = this.state;
		return (
			hasValuesChanged(nextProps, this.props, ['actions', 'error', 'condition']) ||
			healthy !== nextState.healthy
		);
	}

	handleDropdown = (value) => {
		const { onChange } = this.props;
		onChange({
			type: value,
			data: actions[value].data,
			toolTip: actions[value].toolTip,
		});
	};

	getDisabled = (condition, action) => {
		if (actions[action].checkHealth) {
			const { healthy } = this.state;
			return !healthy;
		}
		return condition === 'always' ? actions[action].isDisabledOnAlways : false;
	};

	render() {
		const { actions: selectedActions, error, condition } = this.props;
		const { actionName } = this.state;
		let specificActions;
		if (condition === 'index' || condition === 'cron') {
			specificActions = {
				script: {
					name: 'Script Rule',
					script: '',
				},
			};
		} else {
			specificActions = actions;
		}
		const optionsToShow = Object.keys(specificActions).filter(
			(action) => !(selectedActions || []).find((item) => item.type === action),
		);

		return (
			<Card className={css([cardStyles, getErrorClass(error)])} hoverable>
				{getErrorMessage(error)}
				{optionsToShow.length ? (
					<Select
						onChange={this.handleDropdown}
						placeholder="Select Appropriate Action"
						style={{ width: '100%' }}
						value={actionName}
						onSelect={() => {
							this.setState({ actionName: null });
						}}
						showSearch
						data-cy="query-rule-action"
					>
						{optionsToShow.map((action) => (
							<Option
								disabled={this.getDisabled(condition, action)}
								key={action}
								data-cy={action}
							>
								{actions[action].name}
							</Option>
						))}
					</Select>
				) : (
					<div
						style={{
							background: '#e6f7ff',
							fontSize: '14px',
							borderRadius: '2px',
							padding: '15px',
						}}
					>
						<CheckCircleTwoTone style={{ marginRight: 10 }} />
						All actions defined
					</div>
				)}
			</Card>
		);
	}
}

ActionSelector.propTypes = {
	actions: PropTypes.array,
	onChange: PropTypes.func.isRequired,
	error: PropTypes.object,
	condition: PropTypes.string,
};

ActionSelector.defaultProps = {
	actions: [],
	error: {},
	condition: undefined,
};

export default ActionSelector;
