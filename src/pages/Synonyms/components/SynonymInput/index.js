import React from 'react';
import EquivalentSynonym from './EquivalentSynonym';
import OneWaySynonym from './OneWaySynonyms';

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

export default SynonymInput;
