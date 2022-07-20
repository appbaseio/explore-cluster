import React, { useContext, useState } from 'react';
import CustomizeFilter from './CustomizeFilter';
import { getFilterConfigurationForm, FormContext, getDynamicFilterKey } from '../../../utils';

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
		resetTempControl(getFilterConfigurationForm(null, true));
	};
	const handleCancel = () => {
		// Reset temporary control
		resetTempControl(getFilterConfigurationForm(null, true));
	};
	return (
		<CustomizeFilter
			// Use key to unmount the stale form
			key={key}
			control={tempControl.get('customize')}
			buttonLabel="Add Filter"
			buttonProps={{
				type: 'primary',
			}}
			pipeline={form.get('pipeline') ? form.get('pipeline').value : undefined}
			onSave={addControl}
			onCancel={handleCancel}
			tempControl={tempControl}
			form={form}
			getPreferencesPayload={getPreferencesPayload}
		/>
	);
};

export default DynamicFilters;
