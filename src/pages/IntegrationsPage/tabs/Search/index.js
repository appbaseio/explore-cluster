import React, { useContext } from 'react';
import { FieldGroup } from 'react-reactive-form';
import { Tabs } from 'antd';
import { FormContext, verticalTab } from '../../utils';
import Search from './Search';
import Filters from './Filters';
import CustomMessages from './CustomMessages';

const { TabPane } = Tabs;

const SearchSettings = () => {
	const form = useContext(FormContext);
	return (
		<Tabs defaultActiveKey="1" tabPosition="left" className={verticalTab}>
			<TabPane tab="Search" key="1">
				<FieldGroup control={form} render={() => <Search />} />
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

export default SearchSettings;
