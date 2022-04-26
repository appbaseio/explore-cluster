import React from 'react';

const Message = (message, json = '') => {
	return (
		<>
			<div style={{ maxWidth: 220 }}>{message}</div>
			{json && <div style={{ whiteSpace: 'pre' }}>{json}</div>}
		</>
	);
};

export const globalVarsMessages = {
	key: Message('==Key for global variable=='),
	label: Message('==Label for global variable=='),
	description: Message('==Description for global variable=='),
	value: Message('==Value for global variable=='),
	expected_status: Message('==Expected Status for global variable=='),
	url: Message('==URL for global variable=='),
	method: Message('==Method for global variable=='),
	headers: Message('==Headers for global variable=='),
	body: Message('==Body for global variable=='),
};
