import React, { useContext } from 'react';
import { FieldGroup } from 'react-reactive-form';
import { Tabs } from 'antd';
import { FormContext, verticalTab } from '../../utils';
import SearchLayout from './SearchLayout';
import StylePresets from './StylePresets';
import CustomCss from './CustomCss';

const { TabPane } = Tabs;

const Layout = () => {
	const form = useContext(FormContext);
	return (
		<Tabs defaultActiveKey="1" tabPosition="left" className={verticalTab}>
			<TabPane tab="Search Layout" key="1">
				<FieldGroup control={form} render={() => <SearchLayout />} />
			</TabPane>
			<TabPane tab="Style Presets" key="2">
				<FieldGroup control={form} render={() => <StylePresets />} />
			</TabPane>
			<TabPane tab="Custom CSS" key="3">
				<FieldGroup control={form} render={() => <CustomCss />} />
			</TabPane>
		</Tabs>
	);
};

export default Layout;
