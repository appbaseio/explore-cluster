import React from 'react';
import { FieldControl } from 'react-reactive-form';
import { Switch, Form, List } from 'antd';
import DataFieldSelector from '../../../../components/Form/DataFieldSelector';

export const defaultSettings = [
	{
		id: 'showPopularSearches',
		label: 'Show popular suggestions (users will see suggestions based on analytics data)',
		value: false,
	},
	{
		id: 'showSelectedFilters',
		label: 'Show active filter tags',
		value: true,
	},
	{
		id: 'resultTitle',
		label: (
			<span>
				Select the data field to display the <strong>title</strong> of the result item
			</span>
		),
		value: true,
	},
	{
		id: 'resultDescription',
		label: (
			<span>
				Select the data field to display the <strong>description</strong> of the result item
			</span>
		),
		value: true,
	},
	{
		id: 'resultPrice',
		label: (
			<span>
				Select the data field to display the <strong>price</strong> of the result item
			</span>
		),
		value: true,
	},
	{
		id: 'resultImage',
		label: (
			<span>
				Select the data field to display the <strong>image</strong> of the result item
			</span>
		),
		value: true,
	},
	{
		id: 'resultHandle',
		label: (
			<span>
				Select the data field to define the <strong>redirect url</strong> for the result
				item
			</span>
		),
		value: true,
	},
];

const fieldSelectorIds = [
	'resultTitle',
	'resultDescription',
	'resultPrice',
	'resultImage',
	'resultHandle',
];

const { Item } = List;

const Search = () => (
	<Form layout="inline">
		<List
			dataSource={defaultSettings}
			bordered
			renderItem={(item) => (
				<FieldControl name={item.id}>
					{({ value, onChange }) => (
						<Item
							actions={
								fieldSelectorIds.includes(item.id)
									? [<DataFieldSelector name={item.id} />]
									: [<Switch checked={value} onChange={onChange} />]
							}
						>
							<Item.Meta title={item.label} />
						</Item>
					)}
				</FieldControl>
			)}
		/>
	</Form>
);

export default Search;
