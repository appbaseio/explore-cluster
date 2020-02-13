import React, { Component } from 'react';
import { Button, Dropdown, Icon, Menu, Radio, Skeleton, Table } from 'antd';
import { get } from 'lodash';
import { getFunctions } from '../../../batteries/utils/app';
import { dropdown } from '../../../batteries/components/Mappings/styles';

function TriggerDropdown({ overlay, selectedOption }) {
	return (
		<Dropdown overlay={overlay}>
			<Button className={dropdown}>
				{selectedOption && selectedOption.label}
				<Icon type="down" />
			</Button>
		</Dropdown>
	);
}

class SetFunctionTrigger extends Component {
	constructor(props) {
		super(props);
		this.state = { loading: false, selected: null };
	}

	async componentDidMount() {
		try {
			this.setState({ loading: true });
			const response = await getFunctions();
			this.setState({ loading: false, functions: response.filter(func => func.enabled) });
		} catch (e) {
			console.error(e);
			this.setState({ loading: false });
		}
	}

	handleTriggerChange = (clickParam, index) => {
		const { functions } = this.state;
		this.setState({
			functions: [
				...functions.slice(0, index),
				{
					...functions[index],
					trigger: {
						...functions[index].trigger,
						executeBefore: clickParam.key === 'true',
					},
				},
				...functions.slice(index + 1),
			],
		});
	};

	handleRadioChange = value => {
		this.setState({ selected: value });
	};

	render() {
		const { loading, functions, selected } = this.state;
		if (loading) return <Skeleton />;
		return (
			<Table
				rowKey={record => record.function.service}
				columns={[
					{
						title: 'Function Name',
						render: (text, record) => (
							<Radio
								checked={selected === record.function.service}
								onChange={() => this.handleRadioChange(record.function.service)}
							>
								{record.function.service}
							</Radio>
						),
					},
					{
						title: 'When to Execute',
						render: (text, record, index) => {
							const options = [
								{ value: true, label: 'Before Search' },
								{ value: false, label: 'After Search' },
							];
							const menu = (
								<Menu>
									{options.map(option => (
										<Menu.Item
											onClick={clickParam =>
												this.handleTriggerChange(clickParam, index)
											}
											key={option.value}
										>
											{option.label}
										</Menu.Item>
									))}
								</Menu>
							);
							const selectedOption = options.find(
								option => option.value === get(record, 'trigger.executeBefore'),
							);
							return (
								<TriggerDropdown overlay={menu} selectedOption={selectedOption} />
							);
						},
					},
				]}
				dataSource={functions}
				pagination={false}
			/>
		);
	}
}

export default SetFunctionTrigger;
