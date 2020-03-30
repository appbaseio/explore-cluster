import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

const EquivalentSynonym = props => {
	const { synonyms, onChange } = props;

	const handleChange = value => {
		onChange('synonyms', value);
	};

	return (
		<React.Fragment>
			<label>Synonyms</label>
			<Select
				mode="tags"
				style={{ width: '100%' }}
				value={synonyms}
				placeholder="Add comma separated synonyms"
				onChange={handleChange}
				tokenSeparators={[',']}
			/>
		</React.Fragment>
	);
};

export default EquivalentSynonym;
