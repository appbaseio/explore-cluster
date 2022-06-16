import React, { useContext } from 'react';
import { FieldControl, FieldGroup, FieldArray } from 'react-reactive-form';
import { Switch, Form, List, Button } from 'antd';
import get from 'lodash/get';
import CustomizeFilter from './CustomizeFilter';
import DynamicFilters from './DynamicFilters';
import { FormContext } from '../../utils';

export const defaultSettings = [
	{
		id: 'productType',
		label: 'Show product type filter (only works with Shopify apps)',
		value: false,
		disableFilterType: true,
	},
	{
		id: 'collections',
		label: 'Show collections filter (only works with Shopify apps)',
		value: false,
		disableFilterType: true,
	},
	{
		id: 'size',
		label: 'Show size filter',
		value: false,
		disableFilterType: false,
	},
	{
		id: 'color',
		label: 'Show color filter',
		value: false,
		disableFilterType: true,
	},
	{
		id: 'price',
		label: 'Show price range filter',
		disableListOptions: true,
		value: false,
		disableFilterType: true,
	},
];

const { Item } = List;

const Filters = () => {
	const form = useContext(FormContext);
	return (
		<>
			<FieldGroup strict={false} name="staticFilters">
				{() => (
					<Form layout="inline">
						<List
							dataSource={defaultSettings}
							bordered
							renderItem={(item) => (
								<FieldGroup name={item.id}>
									{(control) => (
										<Item
											actions={[
												<FieldControl name="enabled">
													{({ value, onChange }) => (
														<Switch
															checked={value}
															onChange={onChange}
														/>
													)}
												</FieldControl>,
												<CustomizeFilter
													disableListOptions={item.disableListOptions}
													type={item.id}
													pipeline={
														form.get('pipeline')
															? form.get('pipeline').value
															: undefined
													}
													disableFilterType={item.disableFilterType}
													control={control.get('customize')}
												/>,
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
															{() => (
																<Switch
																	checked={
																		control.get('enabled').value
																	}
																	onChange={(val) => {
																		control
																			.get('enabled')
																			.setValue(val);
																	}}
																/>
															)}
														</FieldControl>,
														<CustomizeFilter
															pipeline={
																form.get('pipeline')
																	? form.get('pipeline').value
																	: undefined
															}
															control={control.get('customize')}
														/>,
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
														title={get(
															control,
															'value.customize.title',
														)}
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
};

export default Filters;
