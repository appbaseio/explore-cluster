import React, { useState, useEffect, useContext } from 'react';
import { Icon, Input, Tooltip } from 'antd';
import Fuse from 'fuse.js';
import { css } from 'react-emotion';
import { func, string } from 'prop-types';
import get from 'lodash/get';
import { SandpackCodeContext } from '../..'; // eslint-disable-line
import { excludedArr, templateConfigMap } from '../../../utils/sandpack-generator';

const searchContainerStyles = css`
	.case-sensitive {
		width: 15px;
		background: #e6f6ff;
		border-radius: 3px;
		cursor: pointer;
	}
`;

const SandpackSearch = ({
	setSearchAllContent,
	value,
	setValue,
	prefixedPath,
	searchType,
	setSearchType,
}) => {
	const [filesArr, setFilesArr] = useState([]);

	const { sandpackCode: files, searchIndex, preferences } = useContext(SandpackCodeContext);
	const theme = get(preferences, 'themeSettings.type', 'classic');
	// eslint-disable-next-line
	const fileListWithTemplate = Object.keys(files || {}).filter((file) => {
		if (
			!(
				excludedArr.indexOf(file) !== -1 ||
				file.includes('build') ||
				file.includes('.vscode') ||
				templateConfigMap[theme]?.includes(file)
			)
		)
			return file;
	});

	const fileListWithoutPrefix = fileListWithTemplate
		.filter((file) => file.startsWith(prefixedPath))
		.map((file) => file.substring(prefixedPath.length));

	const filesToShow = fileListWithoutPrefix
		.filter((file) => file.includes('/'))
		.map((file) => ({ path: `${prefixedPath}${file}` }));

	useEffect(() => {
		if (searchType !== 'fileSearch') {
			let arr = [];
			Object.values(searchIndex).forEach((data) => {
				arr = [...arr, ...data];
			});
			setFilesArr(arr);
			if (value) {
				handleSearch(arr, value);
			}
		}
	}, [searchIndex]);

	useEffect(() => {
		if (searchType === 'fileSearch') handleSearch(filesToShow, value);
		else handleSearch(filesArr, value);
	}, [searchType]);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchType === 'fileSearch') handleSearch(filesToShow, value);
			else handleSearch(filesArr, value);
		}, 1000);

		return () => clearTimeout(delayDebounceFn);
	}, [value]);

	const handleSearch = (arr, val) => {
		const options = {
			isCaseSensitive: searchType === 'caseSensitive',
			includeScore: true,
			includeMatches: true,
			distance: 100,
			threshold: 0.1,
			ignoreLocation: true,
			keys: searchType === 'fileSearch' ? ['path'] : ['text'],
		};
		const fuse = new Fuse(arr, options);
		const data = fuse.search(val);

		if (!data.length && searchType === 'fileSearch' && val)
			setSearchAllContent([
				{
					item: {
						path: 'No Results Found',
					},
				},
			]);
		else setSearchAllContent(data);
	};

	const handleInputChange = (val) => {
		setValue(val);
	};

	return (
		<div css={searchContainerStyles}>
			<Input
				id="file-explorer-search"
				prefix={<Icon type="search" />}
				suffix={
					<>
						{searchType !== 'fileSearch' ? (
							<Tooltip title="Match Case">
								{/* eslint-disable-next-line */}
								<img
									src="/static/images/case-sensitive.svg"
									style={{
										background:
											searchType === 'caseSensitive'
												? 'rgb(205 231 246)'
												: 'none',
										marginRight: 3,
									}}
									alt="case-sensitive-icon"
									className="case-sensitive"
									onClick={() => {
										if (searchType === 'caseSensitive') setSearchType('');
										else setSearchType('caseSensitive');
									}}
								/>
							</Tooltip>
						) : null}

						<Tooltip title="File Search">
							<Icon
								type="file-search"
								style={{
									background:
										searchType === 'fileSearch' ? 'rgb(205 231 246)' : 'none',
								}}
								onClick={() => {
									if (searchType === 'fileSearch') setSearchType('');
									else setSearchType('fileSearch');
								}}
							/>
						</Tooltip>
					</>
				}
				style={{ margin: 5, width: 'auto' }}
				value={value}
				onChange={(e) => handleInputChange(e.target.value)}
			/>
		</div>
	);
};

SandpackSearch.propTypes = {
	setSearchAllContent: func,
	setValue: func,
	value: string,
	prefixedPath: string,
	searchType: string,
	setSearchType: func,
};

SandpackSearch.defaultProps = {
	setValue: () => {},
	setSearchAllContent: () => {},
	value: '',
	searchType: '',
	prefixedPath: '',
	setSearchType: () => {},
};

export default SandpackSearch;
