import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Row, Skeleton } from 'antd';
import { css } from 'emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { modalHeading } from '../../pages/HomePage/styles';
import Ace from '../../batteries/components/SearchSandbox/containers/AceEditor';
import { FUNCTIONS } from '../../constants';
import { invokeFunction } from '../../batteries/modules/actions';

const title = css`
	display: flex;
	justify-content: space-between;
`;

function InvokeResponse({ responseData, status, time }) {
	return (
		<>
			<Row>
				<h3 className={modalHeading}>Response Status</h3>
				{status}
			</Row>
			<Row>
				<h3 className={modalHeading}>Roundtrip Time</h3>
				{time}
			</Row>
			<Row>
				<h3 className={modalHeading}>Response Data</h3>
				<pre>{JSON.stringify(responseData, null, 4)}</pre>
			</Row>
		</>
	);
}

const InvokeFunctionModal = ({
	functionName,
	invocationCount,
	handleCancel,
	invokeFunction,
	error,
	success,
	invokeResults,
	loading,
}) => {
	const [didMount, setDidMount] = useState(false);
	const [requestData, setRequestData] = useState();
	const [parsedData, setParsedData] = useState({});
	const [isValidJSON, setIsValidJSON] = useState(true);
	const [status, setStatus] = useState();
	const [roundTrip, setRoundTrip] = useState();
	const [responseData, setResponseData] = useState();
	const [invokeState, setInvokeState] = useState(FUNCTIONS.NOT_INVOKED);
	function getTitle() {
		return (
			<div className={title}>
				<div>Invoke Function for {functionName}</div>
				<div style={{ marginRight: '25px' }}>Invocation Count: {invocationCount}</div>
			</div>
		);
	}

	const handleRequestDataChange = value => {
		let isValid = true;
		try {
			setParsedData(JSON.parse(value));
		} catch (e) {
			isValid = false;
		}
		setRequestData(value);
		setIsValidJSON(isValid);
	};

	const handleSubmit = () => {
		setInvokeState(FUNCTIONS.INVOKING);
		invokeFunction(functionName, parsedData);
	};

	useEffect(() => {
		if (didMount) {
			if (success) {
				setResponseData(invokeResults);
				setStatus(200);
			} else if (error) {
				setResponseData(error.message);
				setStatus(error.actual.code);
			}
			setInvokeState(FUNCTIONS.INVOKED);
		} else setDidMount(true);
	}, [error, success]);

	return (
		<Modal
			title={getTitle()}
			onCancel={handleCancel}
			okText="Done"
			visible
			okButtonProps={{ style: { display: 'none' } }}
			width={600}
		>
			<Row>
				<h3 className={modalHeading} style={{ marginTop: 0 }}>
					Extra Request Data
				</h3>
				<Ace
					mode="json"
					value={requestData}
					onChange={handleRequestDataChange}
					name="editor-JSON"
					fontSize={14}
					showPrintMargin
					style={{ width: '100%', maxHeight: '100px' }}
					showGutter
					highlightActiveLine
					setOptions={{
						showLineNumbers: true,
						tabSize: 2,
					}}
					editorProps={{ $blockScrolling: true }}
				/>
			</Row>
			<Row style={{ marginTop: '16px' }}>
				<Button disabled={!isValidJSON || loading} onClick={handleSubmit} type="primary">
					Invoke
				</Button>
			</Row>
			{loading ? (
				<Skeleton />
			) : (
				invokeState !== FUNCTIONS.NOT_INVOKED && (
					<InvokeResponse status={status} time={roundTrip} responseData={responseData} />
				)
			)}
		</Modal>
	);
};

InvokeFunctionModal.propTypes = {
	functionName: PropTypes.string,
	handleCancel: PropTypes.func,
	invocationCount: PropTypes.number,
};

InvokeFunctionModal.defaultProps = {
	functionName: '',
	handleCancel: () => {},
	invocationCount: 0,
};

const mapStateToProps = state => ({
	loading: get(state, '$getAppFunctions.isInvoking'),
	error: get(state, '$getAppFunctions.error'),
	success: get(state, '$getAppFunctions.success'),
	invokeResults: get(state, '$getAppFunctions.invokeResults'),
});

const mapDispatchToProps = dispatch => ({
	invokeFunction: (name, payload) => dispatch(invokeFunction(name, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(InvokeFunctionModal);
