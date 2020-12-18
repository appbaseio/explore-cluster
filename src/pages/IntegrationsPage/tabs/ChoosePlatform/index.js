import React, { useContext } from 'react';
import { FieldGroup } from 'react-reactive-form';
import { bool } from 'prop-types';
import { Tabs } from 'antd';
import { FormContext, verticalTab } from '../../utils';
import Platform from './Platform';
import StoreInfo from './StoreInfo';

const { TabPane } = Tabs;

const Layout = ({ isRecommendation }) => {
	const form = useContext(FormContext);
	return (
		<Tabs defaultActiveKey="1" tabPosition="left" className={verticalTab}>
			<TabPane tab="Platform" key="1">
				<FieldGroup
					control={form}
					render={() => <Platform isRecommendation={isRecommendation} />}
				/>
			</TabPane>
			<TabPane tab="Store Info" key="2">
				<FieldGroup control={form} render={() => <StoreInfo />} />
			</TabPane>
		</Tabs>
	);
};

Layout.defaultProps = {
	isRecommendation: false,
};

Layout.propTypes = {
	isRecommendation: bool,
};

export default Layout;
