import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import SetFunctionTrigger from './SetFunctionTrigger';
import NewFunctionForm from './NewFunctionForm';

const { TabPane } = Tabs;

class ExecuteFunction extends Component {
	constructor(props) {
		super(props);
		this.state = { activeKey: 'trigger', selected: props.value };
	}

	handleRadioChange = (value) => {
		this.setState({ selected: value });
	};

	setActiveKey = (activeKey) => this.setState({ activeKey });

	render() {
		const { activeKey, selected } = this.state;
		const { onChange } = this.props;
		return (
			<Tabs activeKey={activeKey} onChange={this.setActiveKey}>
				<TabPane tab="Functions" key="trigger">
					{activeKey === 'trigger' && (
						<SetFunctionTrigger
							handleRadioChange={this.handleRadioChange}
							selected={selected}
							setActiveKey={this.setActiveKey}
							onChange={onChange}
						/>
					)}
				</TabPane>
				<TabPane tab="New Function" key="new">
					{activeKey === 'new' && (
						<NewFunctionForm
							onSuccess={this.handleRadioChange}
							setActiveKey={this.setActiveKey}
							onChange={onChange}
						/>
					)}
				</TabPane>
			</Tabs>
		);
	}
}

ExecuteFunction.propTypes = {
	onChange: PropTypes.func.isRequired,
	value: PropTypes.string,
};

ExecuteFunction.defaultProps = {
	value: undefined,
};

export default ExecuteFunction;
