import React from 'react';

const Message = message => <div style={{ maxWidth: 220 }}>{message}</div>;

export const hoverMessage = Message(
	`All appbase.io paid plans offer setting ACLs, rate limits per IP and advanced security
		permissions based on IP sources, HTTP Referers and restricting what fields are accessible.`,
);
// Messages for user management form
// remove the key from object if don't want to show the tooltip
export const userManagementMessages = {
	// username: Message("Add username to access the Arc."),
	password: Message(
		'The password will be encrypted once saved, and you will not be able to view it again. You can update it anytime.',
	),
	email: Message('An email to share credential key.'),
	admin: Message('A user with admin access can view, create and modify other users.'),
	operationType: Message(
		`Depending on the selection, the user can perform read-only, write-only or both read and
			write operations.`,
	),
	categories: Message('Authorize API access to only selected operations.'),
};
// Messages for api credentials form
export const credentialsMessages = {
	email: Message('An email to share credential key.'),
	categories: Message('Authorize API access to only selected operations.'),
	description: Message('An optional description for your credential key.'),
	operationType: Message(
		`Depending on the selection, the key can perform read-only, write-only or both read and
			write operations.`,
	),
	acls: Message('Authorize API access to only selected operations.'),
	security: Message('Authorize API access based on selected HTTP Referers and IP Source values.'),
	referers: Message(
		`Only selected HTTP Referers (aka URIs) are authorized to call the API with this
			credential.`,
	),
	sources: Message(
		`Only selected IP ranges (in CIDR format) are authorized to call the API with this
			credential.`,
	),
	indices: Message('Only selected indices are authorized to call the API with this credential.'),
	fieldFiltering: Message(
		'Restrict fields that are returned when performing a search operation.',
	),
	include: Message('All selected fields are returned in the search response.'),
	exclude: Message(
		`Selected fields aren't returned in the search response. In case of a field being present
			in both include and exclude, exclude has a priority.`,
	),
	ttl: Message("Expiry time for this credential (in seconds). -1 means that it doesn't expire."),
	ipLimit: Message('Set a per hour ratelimit on API calls per IP address.'),
};

// eslint-disable-next-line
export const getMessages = isUserManagement => isUserManagement ? userManagementMessages : credentialsMessages;
