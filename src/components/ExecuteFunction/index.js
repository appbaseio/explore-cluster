import React, { Component } from 'react';
import { Tabs } from 'antd';
import SetFunctionTrigger from './components/SetFunctionTrigger';
import NewFunctionForm from './components/NewFunctionForm';

const { TabPane } = Tabs;

class ExecuteFunction extends Component {
	constructor(props) {
		super(props);
		this.state = { activeKey: 'trigger' };
	}

	setActiveKey = activeKey => this.setState({ activeKey });

	render() {
		const { activeKey } = this.state;
		return (
			<Tabs
				style={{ background: '#fff', padding: 12 }}
				activeKey={activeKey}
				onChange={this.setActiveKey}
			>
				<TabPane tab="Functions" key="trigger">
					{activeKey === 'trigger' && <SetFunctionTrigger />}
				</TabPane>
				<TabPane tab="New Function" key="new">
					{activeKey === 'new' && <NewFunctionForm />}
				</TabPane>
			</Tabs>
		);
	}
}

export default ExecuteFunction;
