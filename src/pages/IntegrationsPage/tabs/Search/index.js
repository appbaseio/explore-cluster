import React, { useContext, useEffect } from 'react';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { func, object } from 'prop-types';
import { Form, Select, Tabs } from 'antd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { get, keys } from 'lodash';
import { connect } from 'react-redux';
import { FormContext, verticalTab } from '../../utils';
import Search from './Search';
import Results from './Results';
import Filters from './Filters';
import CustomMessages from './CustomMessages';
import Charts from './Charts';
import PageRoutes from '../../PageRoutes';
import Flex from '../../../../batteries/components/shared/Flex';

const { TabPane } = Tabs;

const SearchSettings = ({ getPreferencesPayload, getPreferences, setIsEditorLoading, apps }) => {
	const form = useContext(FormContext);

	useEffect(() => {
		const autoSuggestionSettingsControl = form.get('autoSuggestionSettings');

		if (form.value.autosuggest) {
			autoSuggestionSettingsControl.enable();
		} else {
			autoSuggestionSettingsControl.disable();
		}
	}, []);

	const handleItemReOrder = (index, field) => {
		const sourcePosition = index.source.index;
		const destinationPosition = index.destination.index;
		if (form.get(field)) {
			const filtersControl = form.get(field);
			const control = filtersControl.at(sourcePosition);
			filtersControl.removeAt(sourcePosition);
			filtersControl.insert(destinationPosition, control);
		}
	};
	const filteredApps = keys(apps).filter((app) => !app.startsWith('.'));

	return (
		<div>
			<Flex
				alignItems="center"
				justifyContent="flex-start"
				style={{ marginBottom: '1.5rem', gap: '3rem', flexWrap: 'wrap' }}
			>
				<FieldGroup
					control={form}
					strict={false}
					render={() => (
						<div>
							<h2
								style={{
									fontSize: '14px',
									fontWeight: 500,
									marginBottom: 0,
									lineHeight: '39.9999px',
								}}
							>
								Current Page Route
							</h2>
							<PageRoutes
								getPreferencesPayload={getPreferencesPayload}
								preferences={getPreferences()}
								form={form}
								setIsEditorLoading={setIsEditorLoading}
							/>
						</div>
					)}
				/>{' '}
				<FieldGroup parent={form} name="indexSettings">
					{() => (
						<FieldControl strict={false} name="index">
							{({ handler }) => (
								<Form.Item
									style={{
										margin: 0,
										padding: 0,
									}}
									required
									label={
										<>
											Pipeline for{' '}
											<span style={{ color: '#7c7b7b' }}>
												{get(form.value, 'pageSettings.currentPage', '') ||
													''}
											</span>{' '}
											page route
										</>
									}
								>
									<Select
										{...handler()}
										value={handler().value || undefined}
										showSearch
										placeholder="Select an Index"
										style={{
											minWidth: 300,
										}}
										size="large"
									>
										{(filteredApps || [])
											.filter((k) => !k.includes('metricbeat'))
											.map((k) => (
												<Select.Option key={k}>{k}</Select.Option>
											))}
									</Select>
								</Form.Item>
							)}
						</FieldControl>
					)}
				</FieldGroup>
			</Flex>
			<Tabs defaultActiveKey="1" tabPosition="left" className={verticalTab}>
				<TabPane tab="Search" key="1">
					<FieldGroup
						control={form}
						render={() => (
							<Search
								pipeline={
									form.get('pipeline') ? form.get('pipeline').value : undefined
								}
							/>
						)}
					/>
				</TabPane>
				<TabPane tab="Facets" key="2">
					<FieldGroup
						control={form}
						render={() => (
							<DragDropContext
								onDragEnd={(idx) => handleItemReOrder(idx, 'dynamicFilters')}
							>
								<Droppable droppableId="droppable">
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											style={{
												backgroundColor: snapshot.isDraggingOver
													? 'transparent'
													: 'transparent',
											}}
											{...provided.droppableProps}
										>
											<Filters
												getPreferencesPayload={getPreferencesPayload}
												form={form}
											/>
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</DragDropContext>
						)}
					/>
				</TabPane>
				<TabPane tab="Charts" key="3">
					<FieldGroup
						control={form}
						render={() => (
							<DragDropContext onDragEnd={(idx) => handleItemReOrder(idx, 'charts')}>
								<Droppable droppableId="droppable">
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											style={{
												backgroundColor: snapshot.isDraggingOver
													? 'transparent'
													: 'transparent',
											}}
											{...provided.droppableProps}
										>
											<Charts
												getPreferencesPayload={getPreferencesPayload}
												form={form}
											/>
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</DragDropContext>
						)}
					/>
				</TabPane>
				<TabPane tab="Results" key="4">
					<FieldGroup
						control={form}
						render={() => (
							<Results form={form} getPreferencesPayload={getPreferencesPayload} />
						)}
					/>
				</TabPane>
				<TabPane tab="Custom Messages" key="5">
					<FieldGroup control={form} render={() => <CustomMessages />} />
				</TabPane>
			</Tabs>
		</div>
	);
};
SearchSettings.propTypes = {
	getPreferencesPayload: func.isRequired,
	getPreferences: func.isRequired,
	setIsEditorLoading: func.isRequired,
	apps: object.isRequired,
};

const mapStateToProps = (state) => ({
	apps: get(state, 'apps.data'),
});

export default connect(mapStateToProps, null)(SearchSettings);
