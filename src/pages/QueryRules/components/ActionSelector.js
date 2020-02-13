import React from 'react';
import { css } from 'emotion';
import { Card, Select, Icon } from 'antd';

const { Option } = Select;

const cardStyles = css`
	border-style: dashed;
`;

const actions = {
	promote_result: { name: 'Promote Result', data: [] },
	hide_result: { name: 'Hide Result', data: [] },
	replace_search_term: { name: 'Replace Search Term', data: '' },
	custom_data: { name: 'Return Custom Data', data: {} },
	function: { name: 'f(x) Apply Function', data: '' },
};

class ActionSelector extends React.Component {
	handleDropdown = value => {
		const { onChange } = this.props;

		onChange({
			type: value,
			data: actions[value].data,
		});
	};

	render() {
		const { actions: selectedActions } = this.props;
		const optionsToShow = Object.keys(actions).filter(
			action => !selectedActions.find(item => item.type === action),
		);
		return (
			<Card className={cardStyles} hoverable>
				{optionsToShow.length ? (
					<Select
						onChange={this.handleDropdown}
						placeholder="Select Appropriate Action"
						style={{ width: '100%' }}
						value={undefined}
					>
						{optionsToShow.map(action => (
							<Option key={action}>{actions[action].name}</Option>
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
