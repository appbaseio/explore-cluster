import { Row } from 'antd';
import React from 'react';
import { modalHeading } from '../../pages/HomePage/styles';

// eslint-disable-next-line import/prefer-default-export
export function InvokeResponse({ responseData, status }) {
	console.log('response data', responseData);
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
