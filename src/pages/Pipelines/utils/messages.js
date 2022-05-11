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
	key: Message('Key to reference the global env, e.g. SEARCH_ENGINE_URL'),
	label: Message(
		'A human readable label of the global env. This is only used for displaying in the UI',
	),
	description: Message('Optional, a verbose description of the global env'),
	value: Message('Value of the global env'),
	expected_status: Message(
		'When validating, expected HTTP status code number to match against, e.g. 200',
	),
	url: Message(`When validating, HTTP URL to call`),
	method: Message('HTTP method type to set'),
	headers: Message('When validating, HTTP headers to set in a JSON format'),
	body: Message('When validating, body to send in a JSON format'),
};
