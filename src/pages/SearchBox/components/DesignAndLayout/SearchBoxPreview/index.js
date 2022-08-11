import { Input, Icon, Empty } from 'antd';
import { css } from 'emotion';
import React, { useContext, useEffect, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import PropTypes from 'prop-types';
import { uniqueId } from 'lodash';
import AddSectionModal from './AddSectionModal';
import AddSuggestion from './AddSuggestionModal';
import RenderSections from './RenderSections';
import { generateFeaturedSuggestionPayload } from '../../../utils';
import { FormContext } from '../../../../IntegrationsPage/utils';

const container = css`
	position: relative;
	margin-left: auto;
	max-width: 500px;
	@media only screen and (max-width: 980px), (min-width: 1400px) {
		max-width: 1000px;
	}
	.add-section-wrapper {
		position: absolute;
		right: 0px;
		top: -45px;
	}

	.input-wrapper {
		border-radius: 6px;
		border-radius: 6px 6px 0px 0px;
		box-shadow: rgb(0 0 0 / 20%) 0px 0px 6px;
		overflow: hidden;
		input {
			border: 1px solid transparent;
			border-color: transparent !important;
			border-radius: 0px;
			&:focus {
				background-color: white;
			}

			&:focus {
				outline: none;
			}
		}

		&:hover,
		&:focus-within {
			box-shadow: rgb(0 0 0 / 20%) 0px 0px 15px;
		}

		svg {
			fill: #1890ff;
		}
	}
	.sections-container {
		border-radius: 0px 0px 6px 6px;
		box-shadow: rgb(0 0 0 / 20%) 0px 10px 15px;
		border-top: 1px solid rgb(242, 240, 240);
		overflow: auto;
		max-height: 400px;
		min-height: 300px;
	}
`;

const DEFAULT_ADD_EDIT_SUGGESTION_STATE = {
	suggestion: null,
	parentSectionId: '',
	openAddSuggestionModal: false,
};

const SearchBoxPreview = ({ stateCollector, searchBoxData }) => {
	const mainForm = useContext(FormContext);
	const form = mainForm.get('designAndLayout');
	const [inputValue, setInputValue] = useState('');
	const [addEditSuggestionState, setAddEditSuggestionState] = useState(
		DEFAULT_ADD_EDIT_SUGGESTION_STATE,
	);
	const [suggestions, setSuggestions] = useState({
		// 'sugg-1': {
		// 	id: 'sugg-1',
		// 	label: 'Sample Suggestion 1',
		// 	value: 'Sample Suggestion 1',
		// 	description: 'Sample description for sample sugegstion 1',
		// 	iconURL:
		// 		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyU88K-AykR1Xb8SG5XQdgdG3wVdPj3EgBKw&amp;usqp=CAU',
		// },
		// 'sugg-2': {
		// 	id: 'sugg-2',
		// 	label: 'Sample Suggestion 2',
		// 	value: 'Sample Suggestion 2',
		// 	description: 'Sample description for sample sugegstion 2',
		// 	iconURL:
		// 		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyU88K-AykR1Xb8SG5XQdgdG3wVdPj3EgBKw&amp;usqp=CAU',
		// },
		// 'sugg-3': {
		// 	id: 'sugg-3',
		// 	label: 'Sample Suggestion 3',
		// 	value: 'Sample Suggestion 3',
		// 	description: 'Sample description for sample sugegstion 3',
		// 	iconURL:
		// 		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyU88K-AykR1Xb8SG5XQdgdG3wVdPj3EgBKw&amp;usqp=CAU',
		// },
		// 'sugg-4': {
		// 	id: 'sugg-4',
		// 	label: 'Sample Suggestion 4',
		// 	value: 'Sample Suggestion 4',
		// 	description: 'Sample description for sample sugegstion 4',
		// 	iconURL:
		// 		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyU88K-AykR1Xb8SG5XQdgdG3wVdPj3EgBKw&amp;usqp=CAU',
		// },
	});
	const [sections, setSections] = useState({
		// 'section-1': {
		// 	id: 'section-1',
		// 	title: 'Sample Section 1',
		// 	suggestionsIds: ['sugg-1', 'sugg-2', 'sugg-3', 'sugg-4'],
		// },
		// 'section-2': {
		// 	id: 'section-2',
		// 	title: 'Sample Section 2',
		// 	suggestionsIds: [],
		// },
		// 'section-3': {
		// 	id: 'section-3',
		// 	title: 'Sample Section 3',
		// 	suggestionsIds: [],
		// },
	});

	const [sectionsOrder, setSectionsOrder] = useState([
		// 'section-1', 'section-2', 'section-3'
	]);

	const inputChangeHandler = (e) => {
		setInputValue(e.target.value);
	};

	const onDragEnd = (result) => {
		// 		const result = {
		//    draggableId: 'task-1',
		//    type: 'TYPE',
		//    reason: 'DROP',
		//    source: {
		//        droppableId: 'column-1,
		//        index: 0,
		//    },
		//    destination: {
		//        droppableId: 'column-1',
		//        index: 1,
		//    },
		// }

		const { destination, source, draggableId, type } = result;

		if (!destination) {
			return;
		}

		if (source.droppableId === destination.droppableId && source.index === destination.index) {
			return;
		}

		// re-ordering sections
		if (type === 'section') {
			const newSectionsOrder = Array.from(sectionsOrder);
			newSectionsOrder.splice(source.index, 1);
			newSectionsOrder.splice(destination.index, 0, draggableId);

			setSectionsOrder(newSectionsOrder);
			return;
		}

		const sourceSection = sections[source.droppableId];
		const destinationSection = sections[destination.droppableId];
		// re-ordering logic
		if (sourceSection === destinationSection) {
			const newSuggestionsIds = Array.from(sourceSection.suggestionsIds);
			newSuggestionsIds.splice(source.index, 1);
			newSuggestionsIds.splice(destination.index, 0, draggableId);

			const newSection = {
				...sourceSection,
				suggestionsIds: newSuggestionsIds,
			};

			// set sections state with new order of suggestions in the target section
			setSections({ ...sections, [newSection.id]: newSection });
		} else {
			const sourceSuggestionsIds = Array.from(sourceSection.suggestionsIds);
			sourceSuggestionsIds.splice(source.index, 1);

			const newSourceSection = {
				...sourceSection,
				suggestionsIds: sourceSuggestionsIds,
			};

			const destinationSuggestionsIds = Array.from(destinationSection.suggestionsIds);
			destinationSuggestionsIds.splice(destination.index, 0, draggableId);
			const newDestinationSection = {
				...destinationSection,
				suggestionsIds: destinationSuggestionsIds,
			};

			setSections({
				...sections,
				[newSourceSection.id]: newSourceSection,
				[newDestinationSection.id]: newDestinationSection,
			});
		}
	};

	const handleAddSection = (sectionLabel) => {
		const newSectionId = uniqueId(sectionLabel);
		setSections({
			...sections,
			[newSectionId]: {
				id: newSectionId,
				title: sectionLabel,
				suggestionsIds: [],
			},
		});
		setSectionsOrder([newSectionId, ...sectionsOrder]);
	};

	const getFilteredSuggestions = () => {
		const filteredSuggestions = { ...suggestions };
		if (inputValue) {
			Object.keys(suggestions).forEach((suggestionId) => {
				if (
					!suggestions[suggestionId]?.label
						?.toLowerCase()
						.includes(inputValue.toLowerCase()) &&
					!suggestions[suggestionId]?.description
						?.toLowerCase()
						.includes(inputValue.toLowerCase())
				) {
					delete filteredSuggestions[suggestionId];
				}
			});
		}
		return filteredSuggestions;
	};

	const applySectionLabel = (sectionId, sectionLabel) => {
		const newSections = { ...sections };
		newSections[sectionId] = { ...newSections[sectionId], title: sectionLabel };
		setSections(newSections);
	};

	const handleDeleteSection = (sectionId) => {
		const suggestionsToDelete = sections[sectionId].suggestionsIds;
		const newSuggestions = { ...suggestions };
		suggestionsToDelete.forEach((suggestionId) => {
			delete newSuggestions[suggestionId];
		});
		setSuggestions(newSuggestions);

		const newSections = { ...sections };
		delete newSections[sectionId];
		setSections(newSections);

		setSectionsOrder(sectionsOrder.filter((key) => key !== sectionId));
	};

	const handleSuggestionSave = (sectionId, suggestion) => {
		if (!sections[sectionId].suggestionsIds.includes(suggestion.id)) {
			setSections({
				...sections,
				[sectionId]: {
					...sections[sectionId],
					suggestionsIds: [...sections[sectionId].suggestionsIds, suggestion.id],
				},
			});
		}
		setSuggestions({
			...suggestions,
			[suggestion.id]: {
				...suggestion,
			},
		});

		setAddEditSuggestionState({ ...DEFAULT_ADD_EDIT_SUGGESTION_STATE });
	};

	const handleSuggestionDelete = (suggestionId, sectionId) => {
		const newSuggestions = { ...suggestions };
		delete newSuggestions[suggestionId];

		setSuggestions(newSuggestions);

		const newSections = {
			...sections,
			[sectionId]: {
				...sections[sectionId],
				suggestionsIds: sections[sectionId].suggestionsIds.filter(
					(item) => item !== suggestionId,
				),
			},
		};

		setSections(newSections);
	};

	const triggerAddSuggestionModal = (sectionId) => {
		setAddEditSuggestionState({
			...DEFAULT_ADD_EDIT_SUGGESTION_STATE,
			parentSectionId: sectionId,
			openAddSuggestionModal: true,
		});
	};
	const handleSuggestionEdit = (suggestionId, sectionId) => {
		setAddEditSuggestionState({
			...DEFAULT_ADD_EDIT_SUGGESTION_STATE,
			parentSectionId: sectionId,
			openAddSuggestionModal: true,
			suggestion: suggestions[suggestionId],
		});
	};

	useEffect(() => {
		const payloadSections = generateFeaturedSuggestionPayload({
			sectionsOrder,
			sections,
			suggestions,
		});
		if (payloadSections) {
			stateCollector({
				sectionsOrder,
				sections: payloadSections.sections,
			});
		}
	}, [sections, suggestions]);

	useEffect(() => {
		// listen to subsequent changes
		// let's say the first render isn't enough to catch the changed value
		// we assign a listener

		if (searchBoxData?.searchbox?.featured?.layout) {
			const initialData = searchBoxData.searchbox.featured.layout;
			if (Array.isArray(initialData.sections) && initialData.sections.length) {
				const newSectionsState = {};
				const newSuggestionsState = {};
				initialData.sections.forEach((section) => {
					newSectionsState[section.id] = {
						id: section.id,
						title: section.label,
						suggestionsIds: section.suggestions.map((suggItem) => suggItem.id),
					};

					section.suggestions.forEach((suggItem) => {
						newSuggestionsState[suggItem.id] = { ...suggItem };
					});
				});

				setSections(newSectionsState);
				setSuggestions(newSuggestionsState);
				setSectionsOrder(initialData.sectionsOrder);
			}
		}

		form.get('searchbox').valueChanges.subscribe((value) => {
			console.log('value', value);
		});
	}, []);

	return (
		<>
			<div className={container}>
				<AddSectionModal onSave={handleAddSection} />
				<div className="input-wrapper">
					<Input
						type="text"
						name="queryText"
						className="input-field"
						value={inputValue}
						onChange={inputChangeHandler}
						placeholder="Search across suggestions..."
						prefix={<Icon style={{ transform: 'scale(1.25)' }} type="search" />}
					/>
				</div>
				<DragDropContext className="suggestions-wrapper" onDragEnd={onDragEnd}>
					<Droppable droppableId="dropable-sections-area" type="section">
						{(provided) => (
							<div
								{...provided.droppableProps}
								ref={provided.innerRef}
								className="sections-container"
							>
								{
									<RenderSections
										sections={sections}
										suggestions={getFilteredSuggestions()}
										sectionsOrder={sectionsOrder}
										applySectionLabel={applySectionLabel}
										inputValue={inputValue}
										triggerAddSuggestionModal={triggerAddSuggestionModal}
										deleteSection={handleDeleteSection}
										onSuggestionDelete={handleSuggestionDelete}
										onSuggestionEdit={handleSuggestionEdit}
									/>
								}
								{sectionsOrder.length === 0 ? (
									<Empty
										image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
										imageStyle={{
											height: 70,
										}}
										description="No sections/ suggestions present"
										style={{ margin: '19% auto' }}
									/>
								) : null}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>

			{addEditSuggestionState.openAddSuggestionModal && (
				<AddSuggestion
					onSave={handleSuggestionSave}
					editMode={!!addEditSuggestionState.suggestion}
					parentSectionId={addEditSuggestionState.parentSectionId}
					onCloseModal={() => {
						setAddEditSuggestionState(DEFAULT_ADD_EDIT_SUGGESTION_STATE);
					}}
					suggestion={addEditSuggestionState.suggestion ?? {}}
				/>
			)}
		</>
	);
};

SearchBoxPreview.propTypes = {
	stateCollector: PropTypes.func.isRequired,
	searchBoxData: PropTypes.object,
};
SearchBoxPreview.defaultProps = {
	searchBoxData: null,
};

export default React.memo(SearchBoxPreview);
