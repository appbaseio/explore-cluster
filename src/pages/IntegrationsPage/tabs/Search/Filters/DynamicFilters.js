import React, { useContext, useState } from 'react';
import { func } from 'prop-types';
import get from 'lodash/get';
import CustomizeFilter from './CustomizeFilter';
import {
	filterConfigurationFormDefaultFields,
	getFilterConfigurationForm,
	FormContext,
	getDynamicFilterKey,
} from '../../../utils';

const DynamicFilters = ({ getPreferencesPayload }) => {
	const form = useContext(FormContext);
	const [tempControl, resetTempControl] = useState(getFilterConfigurationForm(null, true));
	const [key, setKey] = useState('dynamic-filter-form');
	const addControl = () => {
		const dynamicFiltersControl = form.get('dynamicFilters');
		// eslint-disable-next-line
		tempControl.meta = {
			key: getDynamicFilterKey(),
		};
		dynamicFiltersControl.push(tempControl);
		// Set key
		setKey(`dynamic-filter-form-${new Date().getTime()}`);
		// Reset temporary control
		// Creates a new temporary control
		resetTempControl(getFilterConfigurationForm(null, true));
	};
	const resetTempControlValues = (defaultValues) => {
		// Resets the current temp control
		tempControl.reset(defaultValues);
		tempControl.markAsUntouched();
		tempControl.markAsPristine();
		tempControl.markAsUnsubmitted();
	};
	const handleCancel = () => {
		// Reset temporary control
		resetTempControlValues({ customize: filterConfigurationFormDefaultFields() });
	};

	const pipeline = form.get('pipeline') ? form.get('pipeline').value : undefined;
	const indexSettings = form.get('indexSettings') ? form.get('indexSettings').value : {};
	const secondaryPipeline = get(indexSettings, 'index', '');
	return (
		<CustomizeFilter
			// Use key to unmount the stale form
			key={key}
			control={tempControl.get('customize')}
			buttonLabel="Add Facet"
			buttonProps={{
				type: 'primary',
			}}
			pipeline={secondaryPipeline || pipeline}
			onSave={addControl}
			onCancel={handleCancel}
			tempControl={tempControl}
			form={form}
			getPreferencesPayload={getPreferencesPayload}
		/>
	);
};
DynamicFilters.propTypes = {
	getPreferencesPayload: func.isRequired,
};

export default DynamicFilters;
