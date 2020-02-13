import React from 'react';
import { Input } from 'antd';

const ReplaceSearch = ({ value, onChange }) => {
	return (
		<Input
			placeholder="Enter search term"
			value={value}
			onChange={e => onChange(e.target.value)}
		/>
	);
};

export default ReplaceSearch;
