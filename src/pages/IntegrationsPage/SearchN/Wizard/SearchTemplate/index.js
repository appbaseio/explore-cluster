import React from 'react';
import { func, object } from 'prop-types';
import { FieldControl } from 'react-reactive-form';
import { groupBy } from 'lodash';
import { Tabs } from 'antd';
import TemplateCard from './TemplateCard';
import templates from '../../../../../../template-sources-output.json';
import { SearchTemplateStyles } from '../styles';

const SearchTemplate = ({ tabsValidated, setTabsValidated }) => {
	const groupedVueTemplates = groupBy(
		templates.filter((i) => i.template === 'vue'),
		'section',
	);
	const groupedReactTemplates = groupBy(
		templates.filter((i) => i.template === 'react' || !i.template),
		'section',
	);

	return (
		<div css={SearchTemplateStyles}>
			<div className="description-container">
				A search template is a set of presets for your use-case and comes with an
				opinionated layout and design.
			</div>
			<FieldControl name="themeType" strict={false}>
				{({ value, onChange }) => {
					return (
						<Tabs defaultActiveKey="1" tabPosition="left" className="tab-container">
							<Tabs.TabPane tab="React" key="1">
								{Object.keys(groupedReactTemplates).map((theme) => (
									<div className="theme-container" key={theme}>
										<div
											// eslint-disable-next-line
											dangerouslySetInnerHTML={{
												__html:
													groupedReactTemplates[theme][0].section_label ||
													theme,
											}}
											className="heading"
										/>
										<div className="theme-templates-container">
											{groupedReactTemplates[theme].map((template) => (
												<TemplateCard
													key={template.name}
													template={template}
													setSelectedTemplate={(type) => {
														onChange(type);
														// onChange('classic');
														setTabsValidated({
															...tabsValidated,
															tab1: true,
														});
													}}
													selectedTemplate={value}
												/>
											))}
										</div>
									</div>
								))}
							</Tabs.TabPane>
							<Tabs.TabPane tab="Vue" key="2">
								{Object.keys(groupedVueTemplates).map((theme) => (
									<div className="theme-container" key={theme}>
										<div
											// eslint-disable-next-line
											dangerouslySetInnerHTML={{
												__html:
													groupedVueTemplates[theme][0].section_label ||
													theme,
											}}
											className="heading"
										/>
										<div className="theme-templates-container">
											{groupedVueTemplates[theme].map((template) => (
												<TemplateCard
													key={template.name}
													template={template}
													setSelectedTemplate={(type) => {
														onChange(type);
														// onChange('classic');
														setTabsValidated({
															...tabsValidated,
															tab1: true,
														});
													}}
													selectedTemplate={value}
												/>
											))}
										</div>
									</div>
								))}
							</Tabs.TabPane>
						</Tabs>
					);
				}}
			</FieldControl>
		</div>
	);
};

SearchTemplate.defaultProps = {
	tabsValidated: {},
	setTabsValidated: () => {},
};

SearchTemplate.propTypes = {
	tabsValidated: object,
	setTabsValidated: func,
};

export default SearchTemplate;
