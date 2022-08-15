import React from 'react';

import PropTypes from 'prop-types';
import SectionItem from './SectionItem';

const RenderSections = (props) => {
	const {
		sectionsOrder,
		sections,
		suggestions,
		applySectionLabel,
		inputValue,
		triggerAddSuggestionModal,
		deleteSection,
		onSuggestionDelete,
		onSuggestionEdit,
	} = props;

	return sectionsOrder.map((sectionId, index) => {
		const sectionObject = sections[sectionId];
		const suggestionsArray = [];
		if (sectionObject && Array.isArray(sectionObject.suggestionsIds)) {
			sectionObject.suggestionsIds.forEach((suggestionId) => {
				if (suggestions[suggestionId]) suggestionsArray.push(suggestions[suggestionId]);
			});
		}
		if (!sectionObject || (inputValue && suggestionsArray.length === 0)) {
			return null;
		}
		return (
			<SectionItem
				key={sectionObject.id}
				section={sectionObject}
				suggestions={suggestionsArray}
				sectionIndex={index}
				applySectionLabel={applySectionLabel}
				triggerAddSuggestionModal={triggerAddSuggestionModal}
				onDelete={() => deleteSection(sectionObject.id)}
				onSuggestionDelete={onSuggestionDelete}
				onSuggestionEdit={onSuggestionEdit}
			/>
		);
	});
};
RenderSections.propTypes = {
	sectionsOrder: PropTypes.array.isRequired,
	sections: PropTypes.object.isRequired,
	suggestions: PropTypes.object.isRequired,
	applySectionLabel: PropTypes.func.isRequired,
	inputValue: PropTypes.string.isRequired,
	triggerAddSuggestionModal: PropTypes.func.isRequired,
	deleteSection: PropTypes.func.isRequired,
	onSuggestionEdit: PropTypes.func.isRequired,
	onSuggestionDelete: PropTypes.func.isRequired,
};

export default React.memo(RenderSections);
