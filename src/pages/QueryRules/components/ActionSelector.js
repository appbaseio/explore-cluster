import React from 'react';
import { css } from 'emotion';
import { Card, Icon, Select } from 'antd';
import { getErrorClass, getErrorMessage } from '../utils/error';
import { hasValuesChanged } from '../utils';
import { getFunctionHealthCheck } from '../../../utils';

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
	function: {
		name: 'f(x) Apply Function',
		data: '',
		checkHealth: true,
	},
	remove_words: {
		name: 'Remove Word',
		data: [],
	},
	replace_words: {
		name: 'Replace Word',
		data: {},
	},
};

class ActionSelector extends React.Component {
	state = { healthy: true };

	async componentDidMount() {
		try {
			await getFunctionHealthCheck();
		} catch (e) {
			this.setState({ healthy: false });
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { healthy } = this.state;
		return (
			hasValuesChanged(nextProps, this.props, ['actions', 'error', 'condition']) ||
			healthy !== nextState.healthy
		);
	}

	handleDropdown = value => {
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
		const optionsToShow = Object.keys(actions).filter(
			action => !(selectedActions || []).find(item => item.type === action),
		);
		return (
			<Card className={css([cardStyles, getErrorClass(error)])} hoverable>
				{getErrorMessage(error)}
				{optionsToShow.length ? (
					<Select
						onChange={this.handleDropdown}
						placeholder="Select Appropriate Action"
						style={{ width: '100%' }}
						value={undefined}
					>
						{optionsToShow.map(action => (
							<Option disabled={this.getDisabled(condition, action)} key={action}>
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
						<Icon type="check-circle" theme="twoTone" style={{ marginRight: 10 }} />
						All actions defined
					</div>
				)}
			</Card>
		);
	}
}

export default ActionSelector;
