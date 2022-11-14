import React from 'react';
import { FieldArray } from 'react-reactive-form';
import { func, object, string } from 'prop-types';
import FiltersControl from '../Filters/FiltersControl';
import FiltersWrapper from '../Filters/FiltersWrapper';
import { BACKENDS } from '../../../../../batteries/utils';

const Charts = ({ getPreferencesPayload, form, backend }) => {
	return (
		<FieldArray name="charts">
			{({ controls }) => {
				if (backend === BACKENDS.FUSION.name)
					return (
						<FiltersControl
							form={form}
							getPreferencesPayload={getPreferencesPayload}
							controls={controls}
							backend={backend}
						/>
					);

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
	backend: string,
};

Charts.defaultProps = {
	backend: BACKENDS.ELASTICSEARCH.name,
};

export default Charts;
