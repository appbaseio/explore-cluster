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
			{/* TODO: to be calculated */}
			{/* <Row> */}
			{/*	<h3 className={modalHeading}>Roundtrip Time</h3> */}
			{/*	{time} */}
			{/* </Row> */}
			<Row>
				<h3 className={modalHeading}>Response Data</h3>
				<pre>{JSON.stringify(responseData, null, 4)}</pre>
			</Row>
		</>
	);
}

function getPayload(parsedData, executeBefore) {
	return {
		extraRequestPayload: parsedData,
		request: {
			url: 'http://127.0.0.1:9200/.books/_search',
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				query: {
					match: {
						title: {
							query: 'harry',
						},
					},
				},
			},
		},
		response: executeBefore
			? undefined
			: {
					body: {
						_shards: {
							failed: 0,
							skipped: 0,
							successful: 1,
							total: 1,
						},
						hits: {
							hits: [
								{
									_id: '9E41hG8B-WWLBcH3Zqmb',
									_index: '.books',
									_score: 1,
									_source: {
										authors: 'J.K. Rowling',
										average_rating: 4.73,
										average_rating_rounded: 5,
										books_count: 6,
										id: 3753,
										image:
											'https://images.gr-assets.com/books/1328867351l/10.jpg',
										image_medium:
											'https://images.gr-assets.com/books/1328867351m/10.jpg',
										isbn: '439827604',
										language_code: 'eng',
										original_publication_year: 2005,
										original_series: 'Harry Potter',
										original_title:
											'Harry Potter Collection (Harry Potter, #1-6)',
										ratings_count: 24618,
										title: 'Harry Potter Collection (Harry Potter, #1-6)',
									},
									_type: '_doc',
								},
							],
							max_score: 1,
							total: {
								relation: 'eq',
								value: 3,
							},
						},
						timed_out: false,
						took: 1058,
					},
					headers: {
						'Access-Control-Allow-Credentials': true,
						'Content-Type': 'application/json',
					},
					status: 200,
			  },
		env: {
			acl: 'msearch',
			category: 'search',
			index: ['my-index'],
			filter: { year: 2011 },
			query: 'budget smart phone',
			now: 1578485425,
		},
	};
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
	initialRequestData,
	executeBefore,
}) => {
	const [didMount, setDidMount] = useState(false);
	const [requestData, setRequestData] = useState(
		JSON.stringify(getPayload(initialRequestData || {}, executeBefore), null, 2),
	);
	const [parsedData, setParsedData] = useState(
		getPayload(initialRequestData || {}, executeBefore),
	);
	const [isValidJSON, setIsValidJSON] = useState(true);
	const [status, setStatus] = useState();
	const [roundTrip, setRoundTrip] = useState();
	const [responseData, setResponseData] = useState();
	const [invokeState, setInvokeState] = useState(FUNCTIONS.NOT_INVOKED);
	function getTitle() {
		return (
			<div className={title}>
				<div>Invoke Function for {functionName}</div>
				{/* <div style={{ marginRight: '25px' }}>Invocation Count: {invocationCount}</div> */}
			</div>
		);
	}

	const handleRequestDataChange = value => {
		let isValid = true;
		setRequestData(value);
		try {
			setParsedData(JSON.parse(value));
		} catch (e) {
			isValid = false;
		}
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
					Request Data
				</h3>
				<Ace
					mode="json"
					value={requestData}
					onChange={handleRequestDataChange}
					name="editor-JSON"
					fontSize={14}
					showPrintMargin
					style={{ width: '100%', maxHeight: '300px' }}
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
