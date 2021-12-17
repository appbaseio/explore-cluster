import React from 'react';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { Switch, Form, List, Button } from 'antd';

const { Item } = List;

export const defaultSettings = [
	{
		id: 'autosuggest',
		label: 'Show Autosuggestions',
		value: true,
	},
	{
		id: 'showVoiceSearch',
		label: 'Enable Voice Search',
		value: true,
	},
];

export const autosuggestionSettings = [
	{
		id: 'enablePopularSuggestions',
		label: 'Show popular suggestions (based on analytics data)',
		value: false,
	},
	{
		id: 'enableRecentSearches',
		label: 'Show recent suggestions (based on analytics data)',
		value: false,
	},
	{
		id: 'highlight',
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
						{item.id === 'autosuggest' && (
							<FieldGroup name="autoSuggestionSettings">
								{({ disabled }) => {
									if (disabled || disabled === undefined) {
										return null;
									}

									return (
										<List
											dataSource={autosuggestionSettings}
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
		<p style={{ fontWeight: '600' }}>
			<span role="img" aria-label="no results">
				⚠️
			</span>{' '}
			Without setting search fields, searchbox will not return any results.
		</p>
		<Button href="search" type="primary">
			Configure Search Settings
		</Button>
	</div>
);

export default Search;
