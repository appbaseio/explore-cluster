/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { Input, Select } from 'antd';
import { hideDropdown } from './styles';

const OneWaySynonym = (props) => {
	const { searchTerm, alternatives, onChange } = props;

	const handleInput = (e) => {
		onChange('searchTerm', e.target.value);
	};

	const handleChange = (value) => {
		onChange('alternatives', value);
	};

	return (
		<React.Fragment>
			<label>Search term</label>
			<Input value={searchTerm} onChange={handleInput} placeholder="Enter search term" />

			<label>Alternatives</label>
			<Select
				mode="tags"
				popupClassName={hideDropdown}
				style={{ width: '100%' }}
				placeholder="Add comma separated alternatives"
				value={alternatives}
				onChange={handleChange}
				tokenSeparators={[',']}
			/>
		</React.Fragment>
	);
};

OneWaySynonym.propTypes = {
	searchTerm: PropTypes.string,
	alternatives: PropTypes.array,
	onChange: PropTypes.func.isRequired,
};

OneWaySynonym.defaultProps = {
	searchTerm: undefined,
	alternatives: undefined,
};

export default OneWaySynonym;
