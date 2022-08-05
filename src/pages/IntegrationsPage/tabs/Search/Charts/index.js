import React, { useContext } from 'react';
import { Button, List, Switch } from 'antd';
import { FieldArray, FieldControl, FieldGroup } from 'react-reactive-form';

import { get } from 'lodash';
import { func } from 'prop-types';
import { FormContext } from '../../../utils';
import CustomizeChart from './CustomizeChart';
import DynamicCharts from './DynamicCharts';

const Charts = ({ getPreferencesPayload }) => {
	const form = useContext(FormContext);
	const pipeline = form?.get('pipeline')?.value;

	return (
		<FieldArray name="charts">
			{({ controls }) => {
				if (!controls.length) {
					return (
						<div
							style={{
								padding: '10px 0',
								display: 'flex',
								justifyContent: 'space-between',
							}}
						>
							<h3>Charts</h3>
							<DynamicCharts
								form={form}
								getPreferencesPayload={getPreferencesPayload}
							/>
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
							<h3>Charts</h3>
							<DynamicCharts
								form={form}
								getPreferencesPayload={getPreferencesPayload}
							/>
						</div>
						<List
							dataSource={controls}
							renderItem={(control, index) => (
								<div key={`${get(control, 'meta.key')}-${String(index)}`}>
									<FieldGroup strict={false} control={control}>
										{() => (
											<List.Item
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
													<CustomizeChart
														control={control.get('customize')}
														pipeline={pipeline}
														buttonLabel="Customize"
														getPreferencesPayload={
															getPreferencesPayload
														}
														form={form}
													/>,
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
													title={get(control, 'value.customize.title')}
												/>
											</List.Item>
										)}
									</FieldGroup>
								</div>
							)}
						/>
					</>
				);
			}}
		</FieldArray>
	);
};

Charts.propTypes = {
	getPreferencesPayload: func.isRequired,
};

export default Charts;
