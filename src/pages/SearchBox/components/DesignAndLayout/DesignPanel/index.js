import { Select, Switch } from 'antd';
import { object } from 'prop-types';
import React, { useContext } from 'react';
import styled from 'react-emotion';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import Grid from '../../../../../components/CreateCredentials/Grid';
import ColorPicker from './ColorPicker';
import { Heading, Section } from './styles';
import { FormContext } from '../../../../IntegrationsPage/utils';
import { DEFAULT_DESIGN_COLORS } from '../../../utils';

const DesignGrid = styled(Grid)`
	margin: 20px 0px;
	justify-content: center;
	align-items: center;

	& > div:first-child {
		& > div:first-child {
			span:first-child {
				white-space: nowrap;
			}
		}
	}
`;

// Component
export default function DesignPanel() {
	const mainForm = useContext(FormContext);
	const form = mainForm.get('designAndLayout');

	return (
		<FieldGroup
			control={form}
			strict={false}
			render={(
				{ invalid: invalidForm }, // eslint-disable-line
			) => (
				<>
					<Section>
						<Heading>Design</Heading>
						<FieldControl
							name="theme"
							render={({ handler }) => (
								<DesignGrid
									label="Theme"
									component={
										<Select
											{...handler()}
											onChange={(value) => {
												form.patchValue({
													theme: value,
													primaryColor:
														DEFAULT_DESIGN_COLORS[value].primaryColor,
													textColor:
														DEFAULT_DESIGN_COLORS[value].textColor,
												});
											}}
										>
											<Select.Option value="dark">Dark</Select.Option>
											<Select.Option value="light">Light</Select.Option>
										</Select>
									}
								/>
							)}
						/>
						<FieldControl
							name="textColor"
							render={({ handler }) => (
								<DesignGrid
									gridRatio={0.35}
									label="Text color"
									component={<ColorPicker {...handler()} />}
								/>
							)}
						/>
						<FieldControl
							name="primaryColor"
							render={({ handler }) => (
								<DesignGrid
									gridRatio={0.35}
									label="Accent color"
									component={<ColorPicker {...handler()} />}
								/>
							)}
						/>
						<FieldControl
							name="enableVoiceSearch"
							render={({ handler }) => (
								<DesignGrid
									gridRatio={0.35}
									label="Voice search"
									component={<Switch {...handler('checkbox')} />}
								/>
							)}
						/>
						<FieldControl
							name="highlight"
							render={({ handler }) => (
								<DesignGrid
									gridRatio={0.35}
									label="Highlight"
									component={<Switch {...handler('checkbox')} />}
								/>
							)}
						/>
					</Section>
					<Section>
						<Heading>Display Suggestions</Heading>

						<FieldControl
							name="enableFeaturedSuggestions"
							render={({ handler }) => (
								<DesignGrid
									label="Featured"
									component={<Switch {...handler('checkbox')} />}
								/>
							)}
						/>

						<FieldControl
							name="enablePopularSuggestions"
							render={({ handler }) => (
								<DesignGrid
									label="Popular"
									component={<Switch {...handler('checkbox')} />}
								/>
							)}
						/>

						<FieldControl
							name="enableRecentSuggestions"
							render={({ handler }) => (
								<DesignGrid
									label="Recent"
									component={<Switch {...handler('checkbox')} />}
								/>
							)}
						/>
						<FieldControl
							name="enableEndpointSuggestions"
							render={({ handler }) => (
								<DesignGrid
									label="Endpoint"
									component={<Switch {...handler('checkbox')} />}
								/>
							)}
						/>
					</Section>
				</>
			)}
		/>
	);
}

DesignPanel.propTypes = {
	form: object.isRequired,
};
