import React, { useContext } from 'react';
import { FieldGroup } from 'react-reactive-form';
import { Tabs } from 'antd';
import { FormContext, verticalTab } from '../../utils';
import SearchLayout from './SearchLayout';
import StylePresets from './StylePresets';
import StoreInfo from './StoreInfo';
import ChoosePlatform from './ChoosePlatform';
import CustomCss from './CustomCss';

const { TabPane } = Tabs;

const Layout = () => {
	const form = useContext(FormContext);
	return (
		<Tabs defaultActiveKey="1" tabPosition="left" className={verticalTab}>
			<TabPane tab="Choose Platform" key="1">
				<FieldGroup control={form} render={() => <ChoosePlatform />} />
			</TabPane>
			<TabPane tab="Search Layout" key="2">
				<FieldGroup control={form} render={() => <SearchLayout />} />
			</TabPane>
			<TabPane tab="Style Presets" key="3">
				<FieldGroup control={form} render={() => <StylePresets />} />
			</TabPane>
			<TabPane tab="Custom CSS" key="4">
				<FieldGroup control={form} render={() => <CustomCss />} />
			</TabPane>
			<TabPane tab="Store Info" key="5">
				<FieldGroup control={form} render={() => <StoreInfo />} />
			</TabPane>
		</Tabs>
	);
};

export default Layout;
