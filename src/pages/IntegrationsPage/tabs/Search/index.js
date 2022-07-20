import React, { useContext, useEffect } from 'react';
import { FieldGroup } from 'react-reactive-form';
import { Tabs } from 'antd';
import { FormContext, verticalTab } from '../../utils';
import Search from './Search';
import Results from './Results';
import Filters from './Filters';
import CustomMessages from './CustomMessages';

const { TabPane } = Tabs;

const SearchSettings = ({ getPreferencesPayload }) => {
	const form = useContext(FormContext);

	useEffect(() => {
		const autoSuggestionSettingsControl = form.get('autoSuggestionSettings');

		if (form.value.autosuggest) {
			autoSuggestionSettingsControl.enable();
		} else {
			autoSuggestionSettingsControl.disable();
		}
	}, []);

	return (
		<Tabs defaultActiveKey="1" tabPosition="left" className={verticalTab}>
			<TabPane tab="Search" key="1">
				<FieldGroup
					control={form}
					render={() => (
						<Search
							pipeline={form.get('pipeline') ? form.get('pipeline').value : undefined}
						/>
					)}
				/>
			</TabPane>
			<TabPane tab="Filters" key="2">
				<FieldGroup
					control={form}
					render={() => <Filters getPreferencesPayload={getPreferencesPayload} />}
				/>
			</TabPane>
			<TabPane tab="Results" key="3">
				<FieldGroup
					control={form}
					render={() => (
						<Results
							pipeline={form.get('pipeline') ? form.get('pipeline').value : undefined}
							themeType={
								form.get('themeType') ? form.get('themeType').value : 'classic'
							}
						/>
					)}
				/>
			</TabPane>
			<TabPane tab="Custom Messages" key="4">
				<FieldGroup control={form} render={() => <CustomMessages />} />
			</TabPane>
		</Tabs>
	);
};

export default SearchSettings;
