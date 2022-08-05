import React from 'react';
import { func, object } from 'prop-types';
import { FieldControl } from 'react-reactive-form';
import { groupBy } from 'lodash';
import TemplateCard from './TemplateCard';
import templates from '../../../../../../template-sources-output.json';
import { SearchTemplateStyles } from '../styles';

const SearchTemplate = ({ tabsValidated, setTabsValidated }) => {
	const groupedTemplates = groupBy(templates, 'section');

	return (
		<div css={SearchTemplateStyles}>
			<div className="description-container">
				A search template is a set of presets for your use-case and comes with an
				opinionated layout and design.
			</div>
			<FieldControl name="themeType" strict={false}>
				{({ value, onChange }) => {
					return Object.keys(groupedTemplates).map((theme) => (
						<div className="theme-container" key={theme}>
							<div
								// eslint-disable-next-line
								dangerouslySetInnerHTML={{
									__html: groupedTemplates[theme][0].section_label || theme,
								}}
								className="heading"
							/>
							<div className="theme-templates-container">
								{groupedTemplates[theme].map((template) => (
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
					));
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
