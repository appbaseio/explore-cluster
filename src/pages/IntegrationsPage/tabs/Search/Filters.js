import React from 'react';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { Switch, Form, List } from 'antd';
import CustomizeFilter from './CustomizeFilter';

export const defaultSettings = [
	{
		id: 'collections',
		label: 'Show collections filter (only works with Shopify apps)',
		value: false,
	},
	{
		id: 'size',
		label: 'Show size filter',
		value: false,
	},
	{
		id: 'color',
		label: 'Show color filter',
		value: false,
	},
	{
		id: 'price',
		label: 'Show price range filter',
		value: false,
	},
];

const { Item } = List;

const Filters = () => (
	<FieldGroup name="staticFilters">
		{() => (
			<Form layout="inline">
				<List
					dataSource={defaultSettings}
					bordered
					renderItem={(item) => (
						<FieldGroup name={item.id}>
							{() => (
								<Item
									actions={[
										<FieldControl name="enabled">
											{({ value, onChange }) => (
												<Switch checked={value} onChange={onChange} />
											)}
										</FieldControl>,
										<CustomizeFilter />,
									]}
								>
									<Item.Meta title={item.label} />
								</Item>
							)}
						</FieldGroup>
					)}
				/>
			</Form>
		)}
	</FieldGroup>
);

export default Filters;
