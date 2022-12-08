import React from 'react';
import { FieldArray } from 'react-reactive-form';
import { func, object, string } from 'prop-types';
import FiltersWrapper from './Filters/FiltersWrapper';
import FiltersControl from './Filters/FiltersControl';
import { BACKENDS } from '../../../../../../batteries/utils';

const Filters = ({ getPreferencesPayload, form, backend }) => {
	return (
		<FieldArray name="dynamicFilters">
			{({ controls }) => {
				if (backend === BACKENDS.FUSION.name)
					return (
						<FiltersControl
							form={form}
							getPreferencesPayload={getPreferencesPayload}
							controls={controls}
							isFilter
						/>
					);
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
	backend: string,
};

Filters.defaultProps = {
	backend: BACKENDS.ELASTICSEARCH.name,
};

export default Filters;
