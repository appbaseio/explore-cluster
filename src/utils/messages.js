import React from 'react';

const Message = (message, json = '') => {
	return (
		<>
			<div style={{ maxWidth: 220 }}>{message}</div>
			{json && <div style={{ whiteSpace: 'pre' }}>{json}</div>}
		</>
	);
};

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
	allowedActions: Message('Set the scope of actions that a user can perform'),
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
	rsApiRestrictions: Message('Apply additional search constraints to a ReactiveSearch API call.'),
	maxQuerySize: Message(
		<>
			This restricts the max query hits to return per request. If an API requests more hits
			than the limit set here, a <code>400</code> status code will be returned
		</>,
	),
	maxAggregationSize: Message(
		<>
			This restricts the max term aggregation size to return per request. If an API requests
			more hits than the limit set here, a <code>400</code> status code will be returned.
		</>,
	),
	allowDirectDSL: Message(
		<>
			Allowing direct DSL queries (default) is a security risk. Consider disabling this and
			using <code>Stored Queries</code> to whitelist the allowed queries instead.
		</>,
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

// Messages for popular suggestions
export const suggestionsMessages = {
	blacklist: Message(
		'A list of suggestion terms to be ignored when populating the popular suggestions index.',
	),
	body: Message('Payload to send in the HTTP request'),
	externalSuggestions: Message(
		`Define your custom suggestions in the following format:`,
		`[
	{
		"count": 6,
		"indices": [
		"abc",
		"def"
		],
		"key": "hello"
	}
]`,
	),
	headers: Message('Headers to send in the HTTP request'),
	minCount: Message(
		'Set the minimum number of times a term must be searched by users before it is considered. Value should be ≥ 0.',
	),
	minHits: Message(
		'Set the minimum number of hits that must be returned for a suggestion term to be considered. Value should be between [0, 1000].',
	),
	minChars: Message(
		'Set the minimum number of characters that must be present for a suggestion term to be considered. Value should be between [0, 32].',
	),
	method: Message('When specified, suggestions will use the method to perform network requests'),
	transformDiacritics: Message(
		'When enabled, suggestion terms will be transformed to remove the diacritics from them. For an example, "Crème Brulée" becomes "Creme Brulee".',
	),
	numberOfDays: Message(
		'Set the duration of days for which to populate the popular suggestions index. Value should be between [1, 90].',
	),
	popularSize: Message(
		'Set the maximum number of popular suggestions to be displayed. Value should be between [0, 20].',
	),
	recentSize: Message(
		'Set the maximum number of recent suggestions to be displayed. Value should be between [0, 20].',
	),
	indexSize: Message(
		'Set the maximum number of index suggestions to be displayed. Value should be between [0, 20].',
	),
	indices: Message('Only selected indices will be considered to calculate the suggestions.'),
	showDistinctSuggestions: Message(
		'When set to true, returns only up to 1 suggestion per document. When set to false, multiple suggestions can be shown when relevant from the same document.',
	),
	enablePredictiveSuggestions: Message(
		"When set to true, it predicts the next relevant words from a fields value based on the search query typed by the user. When set to false (default), the entire field's value would be displayed.",
	),
	maxPredictedWords: Message(
		'Maximum number of predicted words. Value should be between [1, 5].',
	),
	applyStopwords: Message(
		'Enable or disable application of default stopwords. Enabled by default.',
	),
	customStopwords: Message(
		'Set custom stopwords (comma separated) to be used during the suggestions query.',
	),
	enableSynonyms: Message(
		'When set to true, search for suggestions based on the synonyms values.',
	),
	categoryField: Message(
		'When specified, suggestions will show category specific suggestions based on the most frequent values based on this field.',
	),
	urlField: Message(
		'When specified, suggestions will redirect to the URL value based on this field.',
	),
	includeFields: Message('Fields to include in the suggestion result.'),
	excludeFields: Message('Fields to exclude from the suggestion result'),
	customQuery: Message(
		'Specify a custom stored query to execute instead of the pre-tuned suggestions query. Note: this is an advanced setting.',
	),
};

export const cacheMessages = {
	max_duration: Message(
		'The time to live for a cached search query in seconds. The default value is 300s (i.e. 5 minutes).',
	),
	max_size: Message(
		'The max memory limit that is reserved for the entire cache. The default value is 128MB.',
	),
	indices: Message('Only selected indices will be considered to be cached.'),
};

export const accessControlMessages = {
	syncInterval: Message(
		'Manage sync frequency of plugin preferences on each appbase.io node from the upstream Elasticsearch cluster.',
	),
};

// eslint-disable-next-line
export const getMessages = (isUserManagement) =>
	isUserManagement ? userManagementMessages : credentialsMessages;
