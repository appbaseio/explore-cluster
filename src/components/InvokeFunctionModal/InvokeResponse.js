import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';
import { modalHeading } from '../../pages/HomePage/styles';

function InvokeResponse({ responseData, status }) {
	const { headers, ...rest } = responseData;
	// ___headers___['X-Duration-Seconds']
	return (
		<>
			<Row>
				<h3 className={modalHeading}>Response Status</h3>
				{status}
			</Row>
			<Row>
				<h3 className={modalHeading}>Execution Time</h3>
				{headers ? `${headers['X-Duration-Seconds']}s` : ''}
			</Row>
			<Row>
				<h3 className={modalHeading}>Response Data</h3>
				<pre>{JSON.stringify(rest, null, 4)}</pre>
			</Row>
		</>
	);
}

InvokeResponse.propTypes = {
	responseData: PropTypes.object,
	status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

InvokeResponse.defaultProps = {
	responseData: {},
	status: null,
};

export default InvokeResponse;
