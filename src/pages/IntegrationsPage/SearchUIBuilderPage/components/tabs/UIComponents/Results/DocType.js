import React from 'react';
import { MultiDropdownList } from '@appbaseio/reactivesearch';
import { array, func, object } from 'prop-types';

const DocType = ({ value, onChange, form }) => {
	return (
		<div>
			<MultiDropdownList
				componentId="categoryFieldValue"
				dataField={form.get('categoryField') ? form.get('categoryField').value : ''}
				value={value}
				onChange={(val) => {
					onChange(val);
				}}
				style={{
					width: 200,
				}}
			/>
		</div>
	);
};

DocType.propTypes = {
	value: array,
	onChange: func,
	form: object.isRequired,
};

DocType.defaultProps = {
	value: [],
	onChange: () => {},
};

export default DocType;
