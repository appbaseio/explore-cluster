import React, { useContext } from 'react';
import { FieldGroup } from 'react-reactive-form';
import { Tabs } from 'antd';
import { func } from 'prop-types';
import { FormContext, verticalTab } from '../../utils';
import StoreInfo from './StoreInfo';
import ExportToShopify from './ExportToShopify';

const { TabPane } = Tabs;

const Export = ({ preferences }) => {
	const form = useContext(FormContext);
	return (
		<Tabs
			destroyInactiveTabPane
			defaultActiveKey="1"
			tabPosition="left"
			className={verticalTab}
		>
			<TabPane tab="Store Info" key="1">
				<FieldGroup control={form} render={() => <StoreInfo />} />
			</TabPane>
			<TabPane tab="Export to Shopify" key="2">
				<ExportToShopify preferences={preferences} />
			</TabPane>
		</Tabs>
	);
};

Export.propTypes = {
	preferences: func.isRequired,
};

export default Export;
