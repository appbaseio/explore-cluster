import React from 'react';
import { FieldArray } from 'react-reactive-form';
import { func, object } from 'prop-types';
import FiltersWrapper from './Filters/FiltersWrapper';
import FiltersControl from './Filters/FiltersControl';

const Filters = ({ getPreferencesPayload, form }) => {
	return (
		<FieldArray name="dynamicFilters">
			{({ controls }) => {
				return (
					<FiltersWrapper form={form}>
						<FiltersControl
							form={form}
							getPreferencesPayload={getPreferencesPayload}
							controls={controls}
							isFilter
						/>
					</FiltersWrapper>
				);
			}}
		</FieldArray>
	);
};

Filters.propTypes = {
	getPreferencesPayload: func.isRequired,
	form: object.isRequired,
};

export default Filters;
