import React from 'react';
import { Input, Select } from 'antd';

const OneWaySynonym = props => {
	const { searchTerm, alternatives, onChange } = props;

	const handleInput = e => {
		onChange('searchTerm', e.target.value);
	};

	const handleChange = value => {
		onChange('alternatives', value);
	};

	return (
		<React.Fragment>
			<label>Search term</label>
			<Input value={searchTerm} onChange={handleInput} placeholder="Enter search term" />

			<label>Alternatives</label>
			<Select
				mode="tags"
				style={{ width: '100%' }}
				placeholder="Add comma separated alternatives"
				value={alternatives}
				onChange={handleChange}
				tokenSeparators={[',']}
			/>
		</React.Fragment>
	);
};

export default OneWaySynonym;
