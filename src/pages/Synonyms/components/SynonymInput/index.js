import React from 'react';
import EquivalentSynonym from './EquivalentSynonym';
import OneWaySynonym from './OneWaySynonyms';
import { synonymTypes } from '../../../../utils/prop-types';

const SynonymInput = ({ type, ...rest }) => {
	switch (type) {
		case 'one-way':
			return <OneWaySynonym {...rest} />;
		case 'equivalent':
			return <EquivalentSynonym {...rest} />;
		default:
			return null;
	}
};

SynonymInput.propTypes = {
	type: synonymTypes,
};

SynonymInput.defaultProps = {
	type: null,
};

export default SynonymInput;
