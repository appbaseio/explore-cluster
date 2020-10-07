import React from 'react';
import { FieldControl } from 'react-reactive-form';

import { Switch, Form, List } from 'antd';

export const defaultSettings = [
	{
		id: 'showPopularSearches',
		label:
			'Show search suggestions (users will see product recommendations, popular searches as they type)',
		value: false,
	},
	{
		id: 'showSelectedFilters',
		label: 'Show active filter tags',
		value: true,
	},
];

const { Item } = List;

const AdvancedSettings = () => (
	<Form layout="inline">
		<List
			dataSource={defaultSettings}
			bordered
			renderItem={(item) => (
				<FieldControl name={item.id}>
					{({ value, onChange }) => (
						<Item actions={[<Switch checked={value} onChange={onChange} />]}>
							<Item.Meta title={item.label} />
						</Item>
					)}
				</FieldControl>
			)}
		/>
	</Form>
);

export default AdvancedSettings;
