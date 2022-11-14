import React from 'react';
import PropTypes from 'prop-types';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, Tooltip, Tag } from 'antd';
import { groupBy } from 'lodash';

const FileContentSearch = ({ searchAllContent, selectFile, setHighlightLine }) => {
	const groupedFiles = groupBy(searchAllContent, 'item.path');
	// sort by line numbers
	Object.values(groupedFiles).map((data) => {
		return data.sort((a, b) => a.item.line - b.item.line);
	});

	return searchAllContent.length ? (
		<Collapse
			bordered={false}
			expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
			defaultActiveKey={Object.keys(groupedFiles)}
		>
			<div className="result-stats">
				{searchAllContent.length} results found in {Object.keys(groupedFiles).length} files
			</div>
			{Object.entries(groupedFiles).map(([key, val]) => {
				const fileNameArr = key.split('/');
				return (
					<Collapse.Panel
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
									selectFile(key);
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
					</Collapse.Panel>
				);
			})}
		</Collapse>
	) : null;
};

FileContentSearch.propTypes = {
	searchAllContent: PropTypes.array,
	setHighlightLine: PropTypes.func,
	selectFile: PropTypes.func,
};

FileContentSearch.defaultProps = {
	setHighlightLine: () => {},
	selectFile: () => {},
	searchAllContent: [],
};

export default FileContentSearch;
