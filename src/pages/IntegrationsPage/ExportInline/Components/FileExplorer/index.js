import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSandpack } from '@codesandbox/sandpack-react';
import SandpackSearch from '../Search'; // eslint-disable-line
import ModuleList from './ModuleList'; // eslint-disable-line
// eslint-disable-next-line
import { FileIcon } from './icons';
import { searchFilesContainer } from './styles';
import SearchList from './SearchList';

const FileExplorer = ({ setHighlightLine, iframeHeight, collapsed, searchType, setSearchType }) => {
	const [searchAllContent, setSearchAllContent] = useState([]);
	const [value, setValue] = useState('');

	const { sandpack } = useSandpack();

	return (
		<div
			css={searchFilesContainer}
			style={{
				height: iframeHeight,
				overflow: 'scroll',
				display: collapsed ? 'none' : 'block',
			}}
		>
			<SandpackSearch
				setSearchAllContent={setSearchAllContent}
				setSearchType={setSearchType}
				searchType={searchType}
				value={value}
				setValue={setValue}
				prefixedPath="/"
			/>

			{value ? (
				<SearchList
					searchType={searchType}
					searchAllContent={searchAllContent}
					selectFile={(key) => {
						sandpack.openFile(key);
					}}
					setHighlightLine={setHighlightLine}
				/>
			) : (
				<ModuleList
					activePath={sandpack.activePath}
					prefixedPath="/"
					selectFile={(key) => {
						sandpack.openFile(key);
					}}
				/>
			)}
		</div>
	);
};

FileExplorer.propTypes = {
	setHighlightLine: PropTypes.func,
	iframeHeight: PropTypes.number.isRequired,
	collapsed: PropTypes.bool,
	searchType: PropTypes.string,
	setSearchType: PropTypes.func,
};

FileExplorer.defaultProps = {
	setHighlightLine: () => {},
	collapsed: false,
	setSearchType: () => {},
	searchType: '',
};

export default FileExplorer;
