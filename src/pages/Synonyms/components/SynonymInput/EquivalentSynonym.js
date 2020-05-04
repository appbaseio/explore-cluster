/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

const EquivalentSynonym = (props) => {
	const { synonyms, onChange } = props;

	const handleChange = (value) => {
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

EquivalentSynonym.propTypes = {
	synonyms: PropTypes.array,
	onChange: PropTypes.func.isRequired,
};

EquivalentSynonym.defaultProps = {
	synonyms: undefined,
};

export default EquivalentSynonym;
