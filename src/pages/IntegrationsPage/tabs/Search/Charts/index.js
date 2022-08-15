import React from 'react';
import { FieldArray } from 'react-reactive-form';
import { func, object } from 'prop-types';
import FiltersWrapper from '../Filters/FiltersWrapper';
import FiltersControl from '../Filters/FiltersControl';

const Charts = ({ getPreferencesPayload, form }) => {
	return (
		<FieldArray name="charts">
			{({ controls }) => {
				return (
					<FiltersWrapper form={form}>
						<FiltersControl
							form={form}
							getPreferencesPayload={getPreferencesPayload}
							controls={controls}
						/>
					</FiltersWrapper>
				);
			}}
		</FieldArray>
	);
};

Charts.propTypes = {
	getPreferencesPayload: func.isRequired,
	form: object.isRequired,
};

export default Charts;
