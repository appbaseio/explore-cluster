import React from 'react';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { Switch, Form, List, Button } from 'antd';

const { Item } = List;

export const defaultSettings = [
	{
		id: 'enableAutoSuggestions',
		label: 'Show Autosuggetions',
		value: true,
	},
	{
		id: 'enableVoiceSearch',
		label: 'Enable voice search',
		value: true,
	},
];

export const suggestionSettings = [
	{
		id: 'showPopularSearches',
		label: 'Show popular suggestions (based on analytics data)',
		value: false,
	},
	{
		id: 'showRecentSuggestions',
		label: 'Show recent suggestions (based on analytics data)',
		value: false,
	},
	{
		id: 'enableSuggestionsHighlights',
		label: 'Enable suggestion highlights',
		value: false,
	},
];

const Search = () => (
	<div>
		<h2>Search Query</h2>
		<Form layout="inline">
			<List
				dataSource={defaultSettings}
				renderItem={(item) => (
					<>
						<FieldControl name={item.id}>
							{({ value, onChange }) => (
								<Item actions={[<Switch checked={value} onChange={onChange} />]}>
									<Item.Meta title={item.label} />
								</Item>
							)}
						</FieldControl>
						{item.id === 'enableAutoSuggestions' && (
							<FieldGroup name="autoSuggestionSettings">
								{({ disabled }) => {
									if (disabled || disabled === undefined) {
										return null;
									}

									return (
										<List
											dataSource={suggestionSettings}
											renderItem={(data) => (
												<FieldControl name={data.id}>
													{({ value, onChange }) => (
														<Item
															style={{ paddingLeft: '20px' }}
															actions={[
																<Switch
																	checked={value}
																	onChange={onChange}
																/>,
															]}
														>
															<Item.Meta title={data.label} />
														</Item>
													)}
												</FieldControl>
											)}
										/>
									);
								}}
							</FieldGroup>
						)}
					</>
				)}
			/>
		</Form>
		<p>
			Set search query settings such as fields to search on, weights to apply, typo tolerance,
			whether to enable synonyms from the Search Relevancy views.
		</p>
		{/* toggles */}
		<Button href="search" type="primary">
			Configure Search Settings
		</Button>
	</div>
);

export default Search;
