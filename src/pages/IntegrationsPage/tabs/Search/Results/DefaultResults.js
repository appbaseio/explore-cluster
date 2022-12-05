import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, List, Radio } from 'antd';
import { FieldControl } from 'react-reactive-form';
import { string, func, object, array, bool } from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { defaultDataFields, geoDefaultFields } from './constants';
import { BACKENDS } from '../../../../../batteries/utils';
import MetaDataFields from './MetaDataFields';
import Actions from './Actions';

const { Item } = List;

const DefaultResults = ({
	pipeline,
	themeType,
	setValidation,
	form,
	backend,
	fieldPicker,
	isWizard,
}) => {
	const [isError, setIsError] = useState(false);
	const isFusion = backend === BACKENDS.FUSION.name;

	const getDataSource = () => {
		if (themeType === 'geo') return geoDefaultFields;
		return defaultDataFields;
	};

	const move = (from, to, arr) => {
		const newArr = [...arr];

		const item = newArr.splice(from, 1)[0];
		newArr.splice(to, 0, item);

		return newArr;
	};

	const handleItemReOrder = (result, value, onChange) => {
		const newArr = [...value];
		const sourcePosition = result.source.index;
		const destinationPosition = result.destination.index;
		const newDataSource = move(sourcePosition, destinationPosition, newArr);
		onChange(newDataSource);
	};

	const onError = (state) => {
		setIsError(state);
	};

	return (
		<div>
			<List
				dataSource={getDataSource()}
				bordered={false}
				renderItem={(item) => {
					if (item.id === 'metaDataFields') {
						if (isWizard) return <></>;
						return (
							<FieldControl name={item.id} strict={false}>
								{({ value: formValue = [], onChange }) => {
									let value = formValue || [];
									if (typeof formValue === 'string')
										value = JSON.parse(formValue);
									return (
										<div
											style={{
												padding: '12px 24px',
												borderBottom: '1px solid #e8e8e8',
											}}
										>
											{item.label}
											<div>
												<DragDropContext
													onDragEnd={(res) =>
														handleItemReOrder(res, value, onChange)
													}
												>
													<Droppable droppableId="droppable">
														{(provided, snapshot) => (
															<div
																ref={provided.innerRef}
																style={{
																	margin: 10,
																	backgroundColor:
																		snapshot.isDraggingOver
																			? 'transparent'
																			: 'transparent',
																}}
																{...provided.droppableProps}
															>
																{value && value.length
																	? value.map((ele, index) => (
																			<MetaDataFields
																				item={ele}
																				index={index}
																				onChange={onChange}
																				value={value}
																				onError={onError}
																				form={form}
																				fieldPicker={
																					fieldPicker
																				}
																			/>
																	  ))
																	: null}
																{provided.placeholder}
															</div>
														)}
													</Droppable>
												</DragDropContext>

												<Button
													style={{ marginLeft: 10 }}
													type="primary"
													size="small"
													ghost
													onClick={() => {
														const newValue = [
															...(value || []),
															{
																label: '',
																dataField: undefined,
																highlight: false,
															},
														];
														onChange(newValue);
													}}
													disabled={isError}
													icon={<PlusOutlined />}
												>
													Add additional metadata
												</Button>
											</div>
										</div>
									);
								}}
							</FieldControl>
						);
					}

					if (item.id === 'resultHandleViewer') {
						return (
							<FieldControl name={item.id} strict={false}>
								{(control) => {
									return (
										<Item
											actions={[
												<Radio.Group
													{...control.handler()}
													onChange={(value) => {
														control.markAsTouched();
														control.handler().onChange(value);
													}}
												>
													<Radio value="link">Link</Radio>
													<Radio value="button">Button</Radio>
												</Radio.Group>,
											]}
										>
											<Item.Meta
												title={
													typeof item.label === 'function'
														? item.label()
														: item.label
												}
											/>
										</Item>
									);
								}}
							</FieldControl>
						);
					}
					return (
						<FieldControl name={item.id} strict={false}>
							{/* eslint-disable-next-line */}
							{({ value, onChange }) => {
								setValidation(value);
								return (
									<Item
										actions={[
											<Actions
												form={form}
												item={item}
												value={value}
												onChange={onChange}
												pipeline={pipeline}
												isFusion={isFusion}
											/>,
										]}
									>
										<Item.Meta
											title={
												typeof item.label === 'function'
													? item.label(value)
													: item.label
											}
										/>
									</Item>
								);
							}}
						</FieldControl>
					);
				}}
			/>
		</div>
	);
};

DefaultResults.defaultProps = {
	pipeline: '',
	themeType: 'classic',
	setValidation: () => {},
	form: {},
	backend: BACKENDS.ELASTICSEARCH.name,
	fieldPicker: [],
	isWizard: false,
};

DefaultResults.propTypes = {
	pipeline: string,
	setValidation: func,
	themeType: string,
	form: object,
	backend: string,
	fieldPicker: array,
	isWizard: bool,
};

const mapStateToProps = (state) => ({
	backend: get(state, '$getAppPlan.results.backend'),
});

export default connect(mapStateToProps, null)(DefaultResults);
