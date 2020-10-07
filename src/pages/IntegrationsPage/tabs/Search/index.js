import React, { useContext } from 'react';
import { FieldGroup } from 'react-reactive-form';
import { Tabs } from 'antd';
import { FormContext, verticalTab } from '../../utils';
import Advanced from './Advanced';
import Filters from './Filters';
import CustomMessages from './CustomMessages';

const { TabPane } = Tabs;

const Search = () => {
	const form = useContext(FormContext);
	return (
		<Tabs defaultActiveKey="1" tabPosition="left" className={verticalTab}>
			<TabPane tab="Advanced Settings" key="1">
				<FieldGroup control={form} render={() => <Advanced />} />
			</TabPane>
			<TabPane tab="Filters" key="2">
				<FieldGroup control={form} render={() => <Filters />} />
			</TabPane>
			<TabPane tab="Custom Messages" key="3">
				<FieldGroup control={form} render={() => <CustomMessages />} />
			</TabPane>
		</Tabs>
	);
};

export default Search;
