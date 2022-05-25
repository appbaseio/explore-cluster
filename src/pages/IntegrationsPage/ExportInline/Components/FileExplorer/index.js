import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSandpack } from '@codesandbox/sandpack-react';
import { groupBy } from 'lodash';
import { Collapse, Tooltip, Icon, Tag } from 'antd';
import SandpackSearch from '../Search'; // eslint-disable-line
import ModuleList from './ModuleList'; // eslint-disable-line
// eslint-disable-next-line
import { FileIcon } from './icons';
import { searchFilesContainer } from './styles';

const { Panel } = Collapse;

const FileExplorer = ({ setHighlightLine, iframeHeight }) => {
	const [searchAllContent, setSearchAllContent] = useState([]);
	const [value, setValue] = useState('');

	const { sandpack } = useSandpack();

	const groupedFiles = groupBy(searchAllContent, 'item.path');
	// sort by line numbers
	Object.values(groupedFiles).map((data) => {
		return data.sort((a, b) => a.item.line - b.item.line);
	});

	return (
		<div css={searchFilesContainer} style={{ height: iframeHeight, overflow: 'scroll' }}>
			<SandpackSearch
				setSearchAllContent={setSearchAllContent}
				value={value}
				setValue={setValue}
			/>
			{value && searchAllContent.length ? (
				<Collapse
					bordered={false}
					expandIcon={({ isActive }) => (
						<Icon type="caret-right" rotate={isActive ? 90 : 0} />
					)}
					defaultActiveKey={Object.keys(groupedFiles)}
				>
					<div className="result-stats">
						{searchAllContent.length} results found in{' '}
						{Object.keys(groupedFiles).length} files
					</div>
					{Object.entries(groupedFiles).map(([key, val]) => {
						const fileNameArr = key.split('/');
						return (
							<Panel
								header={
									<Tooltip title={key}>
										<div className="search-content">
											{fileNameArr[fileNameArr.length - 1]}
										</div>
									</Tooltip>
								}
								key={key}
							>
								{val.map((line) => (
									<div
										className="search-content sub-search-content"
										key={line.item.line}
										onClick={() => {
											sandpack.openFile(key);
											setTimeout(() => {
												setHighlightLine({
													path: line.item.path,
													line: line.item.line,
													lines: val.map((i) => i.item.line),
												});
											}, 0);
										}}
									>
										<Tooltip title={line.item.text}>
											<Tag>{line.item.line}</Tag>
											{line.item.text}
										</Tooltip>
									</div>
								))}
							</Panel>
						);
					})}
				</Collapse>
			) : (
				<ModuleList
					activePath={sandpack.activePath}
					prefixedPath="/"
					selectFile={sandpack.openFile}
				/>
			)}
		</div>
	);
};

FileExplorer.propTypes = {
	setHighlightLine: PropTypes.func,
	iframeHeight: PropTypes.number.isRequired,
};

FileExplorer.defaultProps = {
	setHighlightLine: () => {},
};

export default FileExplorer;
