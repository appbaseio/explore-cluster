import React from 'react';
import PropTypes from 'prop-types';
import FileContentSearch from './FileContentSearch';

const SearchList = ({ searchType, searchAllContent, selectFile, setHighlightLine }) => {
	const parseFilePath = (path) => {
		let newPath = path;
		if (path[0] === '/') newPath = path.slice(1);
		return newPath.split('/').join(' > ');
	};

	return searchType === 'fileSearch' ? (
		<>
			{!searchAllContent.length ? (
				<div className="padding">{searchAllContent.length} results found in</div>
			) : null}
			{Object.values(searchAllContent).map((data) => {
				const parsedPath = parseFilePath(data.item.path);
				return (
					<div className="padding cursor" onClick={() => selectFile(data.item.path)}>
						{parsedPath}
					</div>
				);
			})}
		</>
	) : (
		<FileContentSearch
			searchAllContent={searchAllContent}
			selectFile={selectFile}
			setHighlightLine={setHighlightLine}
		/>
	);
};

SearchList.propTypes = {
	searchType: PropTypes.string,
	searchAllContent: PropTypes.array,
	setHighlightLine: PropTypes.func,
	selectFile: PropTypes.func,
};

SearchList.defaultProps = {
	setHighlightLine: () => {},
	selectFile: () => {},
	searchAllContent: [],
	searchType: '',
};

export default SearchList;
