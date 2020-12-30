import React, { useContext } from 'react';
import { FieldGroup } from 'react-reactive-form';
import { Tabs } from 'antd';
import { FormContext, verticalTab } from '../../utils';
import Platform from './Platform';
import StoreInfo from './StoreInfo';

const { TabPane } = Tabs;

const Layout = () => {
	const form = useContext(FormContext);
	return (
		<Tabs defaultActiveKey="1" tabPosition="left" className={verticalTab}>
			<TabPane tab="Platform" key="1">
				<FieldGroup control={form} render={() => <Platform />} />
			</TabPane>
			<TabPane tab="Store Info" key="2">
				<FieldGroup control={form} render={() => <StoreInfo />} />
			</TabPane>
		</Tabs>
	);
};

export default Layout;
