import React from 'react';
import get from 'lodash/get';
import { List, Button, Switch, Icon } from 'antd';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { array, bool, func, number, object } from 'prop-types';
import CustomizeChart from './CustomizeChart';
import CustomizeFilter from '../Filters/CustomizeFilter';

const ListItem = ({
	control,
	getPreferencesPayload,
	form,
	traversedMappings,
	index,
	isFilter,
	provided,
}) => {
	const pipeline = form.get('pipeline') ? form.get('pipeline')?.value : '';
	return (
		<FieldGroup strict={false} control={control}>
			{() => (
				<List.Item
					actions={[
						<FieldControl strict={false} name="enabled">
							{() => (
								<Switch
									checked={control.get('enabled').value}
									onChange={(val) => {
										control.get('enabled').setValue(val);
									}}
								/>
							)}
						</FieldControl>,
						<>
							{isFilter ? (
								<CustomizeFilter
									control={control.get('customize')}
									pipeline={pipeline}
									buttonLabel="Customize"
									getPreferencesPayload={getPreferencesPayload}
									form={form}
								/>
							) : (
								<CustomizeChart
									control={control.get('customize')}
									pipeline={pipeline}
									buttonLabel="Customize"
									getPreferencesPayload={getPreferencesPayload}
									form={form}
								/>
							)}
						</>,
						<Button
							type="danger"
							icon="delete"
							onClick={() => {
								control.parent.removeAt(index);
							}}
						/>,
					]}
				>
					<List.Item.Meta
						title={
							<>
								<span {...provided.dragHandleProps}>
									<Icon
										type="drag"
										style={{
											marginRight: 10,
										}}
									/>
								</span>
								{traversedMappings.length &&
								!traversedMappings.includes(
									get(control, 'value.customize.dataField'),
								) ? (
									// eslint-disable-next-line
									<span
										style={{ color: 'orange', marginRight: 10 }}
										role="img"
										aria-label="warning"
									>
										⚠️
									</span>
								) : (
									''
								)}

								{get(control, 'value.customize.title')}
							</>
						}
					/>
				</List.Item>
			)}
		</FieldGroup>
	);
};

ListItem.defaultProps = {
	traversedMappings: [],
	index: 0,
	isFilter: false,
};

ListItem.propTypes = {
	control: object.isRequired,
	getPreferencesPayload: func.isRequired,
	form: object.isRequired,
	traversedMappings: array,
	index: number,
	isFilter: bool,
	provided: object.isRequired,
};

export default ListItem;
