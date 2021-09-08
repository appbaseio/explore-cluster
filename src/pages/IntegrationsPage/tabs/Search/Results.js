import React from 'react';
import { FieldControl } from 'react-reactive-form';
import { Switch, Form, List, Radio } from 'antd';
import { bool, array } from 'prop-types';
import DataFieldSelector from '../../../../components/Form/DataFieldSelector';

export const defaultSettings = [
	{
		id: 'enablePopularSuggestions',
		label: 'Show popular suggestions (users will see suggestions based on analytics data)',
		value: false,
	},
	{
		id: 'showSelectedFilters',
		label: 'Show active filter tags',
		value: true,
	},
	{
		id: 'layout',
		label: 'Show results as:',
		value: true,
	},
	{
		id: 'viewSwitcher',
		label: 'Show results view switcher',
		value: true,
	},
	{
		id: 'showPagination',
		label: (value) =>
			value
				? 'Pagination is enabled. Toggle to use an infinite scroll'
				: 'Infinite scroll is enabled. Toggle to use pagination',
		value: false,
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

const Results = ({ withoutForm, dataSource }) => {
	const component = () => (
		<List
			dataSource={dataSource}
			bordered
			renderItem={(item) => (
				<>
					{item.id === 'layout' ? (
						<FieldControl name={item.id}>
							{(control) => (
								<Item
									actions={[
										<Radio.Group
											{...control.handler()}
											onChange={(value) => {
												control.markAsTouched();
												control.handler().onChange(value);
											}}
										>
											<Radio value="grid">Grid</Radio>
											<Radio value="list">List</Radio>
										</Radio.Group>,
									]}
								>
									<Item.Meta title={item.label} />
								</Item>
							)}
						</FieldControl>
					) : (
						<FieldControl name={item.id}>
							{({ value, onChange }) => (
								<Item
									actions={
										fieldSelectorIds.includes(item.id)
											? [<DataFieldSelector name={item.id} />]
											: [<Switch checked={value} onChange={onChange} />]
									}
								>
									<Item.Meta
										title={
											typeof item.label === 'function'
												? item.label(value)
												: item.label
										}
									/>
								</Item>
							)}
						</FieldControl>
					)}
				</>
			)}
		/>
	);
	if (withoutForm) {
		return component();
	}
	return <Form layout="inline">{component()}</Form>;
};

Results.defaultProps = {
	withoutForm: false,
	dataSource: defaultSettings,
};

Results.propTypes = {
	withoutForm: bool,
	dataSource: array,
};

export default Results;
