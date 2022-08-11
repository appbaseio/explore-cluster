import React from 'react';

import PropTypes from 'prop-types';
import SuggestionItem from './SuggestionItem';

const RenderSuggestions = (props) => {
	const { suggestions, onSuggestionDelete, onSuggestionEdit } = props;

	return suggestions.map((item, index) => {
		return (
			<SuggestionItem
				key={item.id}
				suggestion={item}
				index={index}
				onDelete={() => onSuggestionDelete(item.id)}
				onEdit={() => onSuggestionEdit(item.id)}
			/>
		);
	});
};
RenderSuggestions.propTypes = {
	suggestions: PropTypes.array.isRequired,
	onSuggestionDelete: PropTypes.func.isRequired,
	onSuggestionEdit: PropTypes.func.isRequired,
};

export default React.memo(RenderSuggestions);
