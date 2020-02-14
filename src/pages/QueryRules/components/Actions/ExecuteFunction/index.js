import React, { Component } from 'react';
import { Tabs } from 'antd';
import SetFunctionTrigger from './SetFunctionTrigger';
import NewFunctionForm from './NewFunctionForm';

const { TabPane } = Tabs;

class ExecuteFunction extends Component {
	constructor(props) {
		super(props);
		this.state = { activeKey: 'trigger' };
	}

	handleRadioChange = value => {
		this.setState({ selected: value });
	};

	setActiveKey = activeKey => this.setState({ activeKey });

	render() {
		const { activeKey, selected } = this.state;
		return (
			<Tabs
				style={{ background: '#fff', padding: 12 }}
				activeKey={activeKey}
				onChange={this.setActiveKey}
			>
				<TabPane tab="Functions" key="trigger">
					{activeKey === 'trigger' && (
						<SetFunctionTrigger
							handleRadioChange={this.handleRadioChange}
							selected={selected}
							setActiveKey={this.setActiveKey}
						/>
					)}
				</TabPane>
				<TabPane tab="New Function" key="new">
					{activeKey === 'new' && (
						<NewFunctionForm
							onSuccess={this.handleRadioChange}
							setActiveKey={this.setActiveKey}
						/>
					)}
				</TabPane>
			</Tabs>
		);
	}
}

export default ExecuteFunction;
