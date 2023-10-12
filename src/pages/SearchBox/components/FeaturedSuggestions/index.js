import React, { useCallback, useContext, useRef } from 'react';
import styled from 'react-emotion';
import { object } from 'prop-types';
import SearchBoxPreview from '../DesignAndLayout/SearchBoxPreview';
import { FormContext } from '../../../IntegrationsPage/utils/utils';

const SearchBoxPreviewContainer = styled.div`
	flex-grow: 1;
	padding: 1rem;
	height: 100%;
`;

export default function FeaturedSuggestions({ searchBoxData }) {
	const featuredSuggestionsPayload = useRef({});
	const form = useContext(FormContext);

	const collectSearchBoxPreviewState = useCallback(
		(stateObject) => {
			featuredSuggestionsPayload.current = stateObject;
			const designAndLayout = form.get('designAndLayout');
			designAndLayout.patchValue({
				searchbox: {
					...featuredSuggestionsPayload.current,
				},
			});
		},
		[featuredSuggestionsPayload],
	);
	return (
		<SearchBoxPreviewContainer>
			<SearchBoxPreview
				stateCollector={collectSearchBoxPreviewState}
				searchBoxData={searchBoxData}
			/>
		</SearchBoxPreviewContainer>
	);
}

FeaturedSuggestions.propTypes = {
	searchBoxData: object.isRequired,
};
