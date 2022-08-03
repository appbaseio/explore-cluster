import React, { useContext, useState } from 'react';
import { func } from 'prop-types';
import CustomizeChart from './CustomizeChart';
import {
	FormContext,
	getChartConfigurationForm,
	chartConfigurationFormDefaultFields,
	getChartKey,
} from '../../../utils';

// DynamicCharts
const DynamicCharts = ({ getPreferencesPayload }) => {
	const form = useContext(FormContext);
	const [tempControl, resetTempControl] = useState(getChartConfigurationForm(null));
	const [key, setKey] = useState('chart-form');
	const addControl = () => {
		const chartsControl = form.get('charts');
		// eslint-disable-next-line
		tempControl.meta = {
			key: getChartKey(),
		};
		chartsControl.push(tempControl);
		// Set key
		setKey(`chart-form-${new Date().getTime()}`);
		// Creates a new temporary control
		resetTempControl(getChartConfigurationForm(null, true));
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
		resetTempControlValues(chartConfigurationFormDefaultFields);
	};
	return (
		<CustomizeChart
			// Use key to unmount the stale form
			key={key}
			control={tempControl.get('customize')}
			buttonLabel="Add Charts"
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

DynamicCharts.propTypes = {
	getPreferencesPayload: func.isRequired,
};

export default DynamicCharts;
