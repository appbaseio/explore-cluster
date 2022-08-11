import React, { useContext, useEffect } from 'react';
import { FieldGroup } from 'react-reactive-form';
import { func } from 'prop-types';
import { Tabs } from 'antd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { FormContext, verticalTab } from '../../utils';
import Search from './Search';
import Results from './Results';
import Filters from './Filters';
import CustomMessages from './CustomMessages';
import Charts from './Charts';

const { TabPane } = Tabs;

const SearchSettings = ({ getPreferencesPayload }) => {
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

	return (
		<Tabs defaultActiveKey="1" tabPosition="left" className={verticalTab}>
			<TabPane tab="Search" key="1">
				<FieldGroup
					control={form}
					render={() => (
						<Search
							pipeline={form.get('pipeline') ? form.get('pipeline').value : undefined}
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
						<Results
							pipeline={form.get('pipeline') ? form.get('pipeline').value : undefined}
							themeType={
								form.get('themeType') ? form.get('themeType').value : 'classic'
							}
						/>
					)}
				/>
			</TabPane>
			<TabPane tab="Custom Messages" key="5">
				<FieldGroup control={form} render={() => <CustomMessages />} />
			</TabPane>
		</Tabs>
	);
};
SearchSettings.propTypes = {
	getPreferencesPayload: func.isRequired,
};

SearchSettings.propTypes = {
	getPreferencesPayload: func.isRequired,
};

export default SearchSettings;
