import React, { Component } from 'react';
import { FUNCTIONS } from '../../../../../constants';
import { InvokeFunctionBody } from '../../../../../components/InvokeFunctionModal/InvokeFunctionBody';
import { invokeFunction } from '../../../../../batteries/utils/app';

class TestFunction extends Component {
	state = { isValidJSON: true, invokeState: FUNCTIONS.NOT_INVOKED, loading: false };

	handleRequestDataChange = value => {
		let isValid = true;
		this.setState({ requestData: value });
		try {
			const parsedData = JSON.parse(value);
			this.setState({ parsedData });
		} catch (e) {
			isValid = false;
		}
		this.setState({ isValidJSON: isValid });
	};

	handleSubmit = async () => {
		const { functionName } = this.props;
		const { parsedData } = this.state;
		this.setState({ loading: true, invokeState: FUNCTIONS.INVOKING });
		try {
			const response = await invokeFunction(functionName, parsedData);
			this.setState({
				loading: false,
				invokeState: FUNCTIONS.INVOKED,
				status: 200,
				responseData: response,
			});
		} catch (e) {
			this.setState({
				loading: false,
				invokeState: FUNCTIONS.INVOKED,
				status: e.status,
				responseData: e.message,
			});
		}
	};

	render() {
		const { isValidJSON, invokeState, loading, requestData, status, responseData } = this.state;
		const { functionName } = this.props;
		return (
			<>
				<h3>Invoke {functionName}</h3>
				<InvokeFunctionBody
					invokeState={invokeState}
					validJSON={isValidJSON}
					loading={loading}
					value={requestData}
					onChange={this.handleRequestDataChange}
					onClick={this.handleSubmit}
					status={status}
					responseData={responseData}
				/>
			</>
		);
	}
}

export default TestFunction;
