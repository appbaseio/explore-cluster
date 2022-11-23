import React, { useContext, useEffect } from 'react';
import { FieldGroup } from 'react-reactive-form';
import { func, string } from 'prop-types';
import { Tabs } from 'antd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { FormContext, verticalTab } from '../../utils';
import Search from './Search';
import Results from './Results';
import Filters from './Filters';
import CustomMessages from './CustomMessages';
import FusionSearch from './FusionSearch';
import Charts from './Charts';
import PageRoutes from '../../PageRoutes';
import EndpointDropdown from '../../Endpoint/EndpointDropdown';
import { BACKENDS } from '../../../../batteries/utils';
import { getTemplate } from '../../utils/index';

const { TabPane } = Tabs;

const SearchSettings = ({ getPreferencesPayload, getPreferences, setIsEditorLoading, backend }) => {
	const form = useContext(FormContext);
	const isFusion = backend === BACKENDS.FUSION.name;

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
			const control = filtersControl[sourcePosition];
			filtersControl.removeAt(sourcePosition);
			filtersControl.insert(destinationPosition, control);
		}
	};

	const themeType = form && form.get('themeType') ? form.get('themeType').value : 'classic';
	const templateObj = getTemplate(themeType);
	return (
		<div>
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
			<FieldGroup parent={form} name="indexSettings" strict={false}>
				{(formControl) => {
					const endpointControl = formControl.get('endpoint');

					return (
						<EndpointDropdown
							formValue={endpointControl.value}
							form={form}
							endpointControl={endpointControl}
							isPageLevel
						/>
					);
				}}
			</FieldGroup>
			<Tabs defaultActiveKey="1" tabPosition="left" className={verticalTab}>
				<TabPane tab="Search" key="1">
					<FieldGroup
						control={form}
						render={() =>
							isFusion ? (
								<FusionSearch
									form={form}
									getPreferencesPayload={getPreferencesPayload}
								/>
							) : (
								<Search
									pipeline={
										form.get('pipeline')
											? form.get('pipeline').value
											: undefined
									}
									form={form}
									backend={backend}
									getPreferencesPayload={getPreferencesPayload}
								/>
							)
						}
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
												backend={backend}
											/>
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</DragDropContext>
						)}
					/>
				</TabPane>
				{templateObj.template !== 'vue' && (
					<TabPane tab="Charts" key="3">
						<FieldGroup
							control={form}
							render={() => (
								<DragDropContext
									onDragEnd={(idx) => handleItemReOrder(idx, 'charts')}
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
												<Charts
													getPreferencesPayload={getPreferencesPayload}
													form={form}
													backend={backend}
												/>
												{provided.placeholder}
											</div>
										)}
									</Droppable>
								</DragDropContext>
							)}
						/>
					</TabPane>
				)}
				<TabPane tab="Results" key="4">
					<FieldGroup
						control={form}
						strict={false}
						render={({ value }) => {
							const secondaryPipeline = get(value, 'indexSettings.index', '');
							return (
								<Results
									form={form}
									getPreferencesPayload={getPreferencesPayload}
									secondaryPipeline={secondaryPipeline}
								/>
							);
						}}
					/>
				</TabPane>
				<TabPane tab="Custom Messages" key="5">
					<FieldGroup control={form} render={() => <CustomMessages />} />
				</TabPane>
			</Tabs>
		</div>
	);
};

SearchSettings.defaultProps = {
	backend: BACKENDS.ELASTICSEARCH.name,
};

SearchSettings.propTypes = {
	getPreferencesPayload: func.isRequired,
	getPreferences: func.isRequired,
	setIsEditorLoading: func.isRequired,
	backend: string,
};

const mapStateToProps = (state) => ({
	backend: get(state, '$getAppPlan.results.backend'),
});

export default connect(mapStateToProps, null)(SearchSettings);
