import React from 'react';
import { Input } from 'antd';

const RemoveWord = ({ value = [], onChange }) => {
	return (
		<Input
			placeholder="Enter word(s) to remove"
			value={value.join(' ')}
			onChange={(e) => onChange(e.target.value.split(' '))}
		/>
	);
};

export default RemoveWord;
