import React from 'react';
import { FieldControl, FieldGroup, FieldArray } from 'react-reactive-form';
import { Switch, Form, List, Button } from 'antd';
import get from 'lodash/get';
import CustomizeFilter from './CustomizeFilter';
import DynamicFilters from './DynamicFilters';

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
	<>
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

		<FieldArray name="dynamicFilters">
			{({ controls }) => {
				if (!controls.length) {
					return (
						<div
							style={{
								padding: '10px 0',
								display: 'flex',
								justifyContent: 'flex-end',
							}}
						>
							<DynamicFilters />
						</div>
					);
				}
				return (
					<>
						<div
							style={{
								padding: '10px 0',
								display: 'flex',
								justifyContent: 'space-between',
							}}
						>
							<h3>Custom Filters</h3>
							<DynamicFilters />
						</div>
						<List
							dataSource={controls}
							bordered
							renderItem={(control, index) => (
								<div key={`${get(control, 'meta.key')}-${String(index)}`}>
									<FieldGroup strict={false} control={control}>
										{() => (
											<Item
												actions={[
													<FieldControl strict={false} name="enabled">
														{({ value, onChange }) => (
															<Switch
																checked={value}
																onChange={onChange}
															/>
														)}
													</FieldControl>,
													<CustomizeFilter />,
													<Button
														onClick={() => {
															control.parent.removeAt(index);
														}}
														type="danger"
														icon="delete"
													/>,
												]}
											>
												<Item.Meta
													title={get(control, 'value.customize.title')}
												/>
											</Item>
										)}
									</FieldGroup>
								</div>
							)}
						/>
					</>
				);
			}}
		</FieldArray>
	</>
);

export default Filters;
