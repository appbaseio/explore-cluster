import React, { useState, useEffect, useContext } from 'react';
import { Icon, Input, Tooltip } from 'antd';
import Fuse from 'fuse.js';
import { css } from 'react-emotion';
import { func, string } from 'prop-types';
import { SandpackCodeContext } from '../..'; // eslint-disable-line

const searchContainerStyles = css`
	.case-sensitive {
		width: 15px;
		background: #e6f6ff;
		border-radius: 3px;
		cursor: pointer;
	}
`;

const SandpackSearch = ({ setSearchAllContent, value, setValue }) => {
	const [filesArr, setFilesArr] = useState([]);
	const [caseSensitive, setCaseSensitive] = useState(false);
	const { searchIndex } = useContext(SandpackCodeContext);

	useEffect(() => {
		let arr = [];
		Object.values(searchIndex).forEach((data) => {
			arr = [...arr, ...data];
		});
		setFilesArr(arr);
		if (value) {
			handleSearch(arr, value);
		}
	}, [searchIndex]);

	useEffect(() => {
		handleSearch(filesArr, value);
	}, [caseSensitive]);

	const handleSearch = (arr, val) => {
		const options = {
			isCaseSensitive: caseSensitive,
			includeScore: true,
			includeMatches: true,
			distance: 100,
			threshold: 0.1,
			ignoreLocation: true,
			keys: ['text'],
		};
		const fuse = new Fuse(arr, options);
		const data = fuse.search(val);
		setSearchAllContent(data);
	};

	const handleInputChange = (val) => {
		setValue(val);
		handleSearch(filesArr, val);
	};

	return (
		<div css={searchContainerStyles}>
			<Input
				prefix={<Icon type="search" />}
				suffix={
					<Tooltip title="Match Case">
						{/* eslint-disable-next-line */}
						<img
							src="/static/images/case-sensitive.svg"
							style={{
								background: caseSensitive ? '#e6f6ff' : 'none',
							}}
							alt="case-sensitive-icon"
							className="case-sensitive"
							onClick={() => {
								setCaseSensitive(!caseSensitive);
							}}
						/>
					</Tooltip>
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
};

SandpackSearch.defaultProps = {
	setValue: () => {},
	setSearchAllContent: () => {},
	value: '',
};

export default SandpackSearch;
