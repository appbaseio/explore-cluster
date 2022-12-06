import React, { useContext } from 'react';
import { string, element, bool } from 'prop-types';
import { FieldGroup } from 'react-reactive-form';
import { Tabs } from 'antd';
import { FormContext, verticalTab } from '../../../../utils';
import StylePresets from './StylePresets';
import Branding from './Branding';
import CustomCss from './CustomCss';
import CustomCssRecommendations from './CustomCssRecommendation';

const { TabPane } = Tabs;

const Layout = ({ defaultActiveKey, appendTabs, isRecommendation }) => {
	const form = useContext(FormContext);
	return (
		<Tabs defaultActiveKey={defaultActiveKey} tabPosition="left" className={verticalTab}>
			{appendTabs}
			<TabPane tab="Branding" key="branding">
				<FieldGroup control={form} render={() => <Branding control={form} />} />
			</TabPane>
			<TabPane tab="Style Presets" key="style-presets">
				<FieldGroup control={form} render={() => <StylePresets />} />
			</TabPane>
			<TabPane tab="Custom CSS" key="custom-css">
				<FieldGroup
					control={form}
					render={() => (isRecommendation ? <CustomCssRecommendations /> : <CustomCss />)}
				/>
			</TabPane>
		</Tabs>
	);
};

Layout.defaultProps = {
	defaultActiveKey: 'search-layout',
	appendTabs: null,
	isRecommendation: false,
};

Layout.propTypes = {
	appendTabs: element,
	defaultActiveKey: string,
	isRecommendation: bool,
};

export default Layout;
