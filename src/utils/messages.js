import React from 'react';

const Message = (message) => <div style={{ maxWidth: 220 }}>{message}</div>;

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
	blacklist: Message('A list of queries which can be marked as blacklist.'),
	externalSuggestions: Message('Define your custom suggestions.'),
	minCount: Message('Min value of count for the suggestions.'),
	minHits: Message('Define the minimum number of results that must present for a suggestion.'),
	minCharacters: Message(
		'Define the minimum number of characters that must be present for a suggestion.',
	),
	transformDiacritics: Message(
		'If enabled then Appbase will transform(strip) the diacritics before populating the suggestions. For an example, "Crème Brulée" becomes "Creme Brulee".',
	),
	numberOfDays: Message(
		'Define the number of days after which you want to re-calculate the suggestions.',
	),
	popular_size: Message('Maximum number of popular suggestions to be displayed.'),
	recent_size: Message('Maximum number of recent suggestions to be displayed.'),
	index_size: Message('Maximum number of index suggestions to be displayed.'),
	indices: Message('Only selected indices will be considered to calculate the suggestions.'),
	showDistinctSuggestions: Message(
		'Show only up to 1 suggestion per document (i.e. record). If set to false, multiple suggestions can be shown when relevant (based on different matching fields) from the same document.',
	),
	enablePredictiveSuggestions: Message(
		'Defaults to false. When set to true, it predicts the next relevant words from a fields value based on the search query typed by the user. When set to false (default), the entire fields value would be displayed.',
	),
	maxPredictedWords: Message('Maximum number of predicted words.'),
	applyStopwords: Message(
		'Enable or disable application of default stopwords. Enabled by default.',
	),
	customStopwords: Message(
		'Set comma separated stopwords to be ignored during the language specifc analysis process.',
	),
	enableSynonyms: Message('Allow synonyms.'),
	categoryField: Message(
		'When specified, suggestions will show category specific suggestions based on the most frequent values based on this field.',
	),
	url: Message('When specified, suggestions will redirect to the URL value based on this field.'),
	includeFields: Message('Fields to include in the search results.'),
	excludeFields: Message('Fields to exclude from the search results'),
	customQuery: Message(
		'Specify a custom stored query to execute instead of the default suggestions query. This is an advanced setting.',
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
// eslint-disable-next-line
export const getMessages = (isUserManagement) =>
	isUserManagement ? userManagementMessages : credentialsMessages;
