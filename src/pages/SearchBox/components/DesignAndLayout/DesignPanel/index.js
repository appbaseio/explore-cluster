import { Col, Row, Select, Switch, Tooltip } from 'antd';
import { object } from 'prop-types';
import React, { useContext } from 'react';
import styled from 'react-emotion';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { InfoCircleOutlined } from '@ant-design/icons';
import ColorPicker from './ColorPicker';
import { Heading, Section } from './styles';
import { FormContext } from '../../../../IntegrationsPage/utils/utils';
import { DEFAULT_DESIGN_COLORS } from '../../../utils';

const StyledRow = styled(Row)`
	align-items: center;
	margin: 1rem 0rem;
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
				<Row>
					<Section>
						<Heading>Design</Heading>
						<FieldControl
							name="theme"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>Theme</Col>
									<Col xs={10}>
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
									</Col>
								</StyledRow>
							)}
						/>
						<FieldControl
							name="textColor"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>Text color</Col>
									<Col xs={10}>
										<ColorPicker {...handler()} />
									</Col>
								</StyledRow>
							)}
						/>
						<FieldControl
							name="primaryColor"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>Accent color</Col>
									<Col xs={10}>
										<ColorPicker {...handler()} />
									</Col>
								</StyledRow>
							)}
						/>
						<FieldControl
							name="enableVoiceSearch"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>Voice search</Col>
									<Col xs={10}>
										<Switch {...handler('checkbox')} />
									</Col>
								</StyledRow>
							)}
						/>
						<FieldControl
							name="enableImageSearch"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>Image search</Col>
									<Col xs={10}>
										<Switch {...handler('checkbox')} />
									</Col>
								</StyledRow>
							)}
						/>
						<FieldControl
							name="highlight"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>Highlight</Col>
									<Col xs={10}>
										<Switch {...handler('checkbox')} />
									</Col>
								</StyledRow>
							)}
						/>
					</Section>
					<Section>
						<Heading>Display Suggestions</Heading>
						<FieldControl
							name="enablePopularSuggestions"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>Popular</Col>
									<Col xs={10}>
										<Switch {...handler('checkbox')} />
									</Col>
								</StyledRow>
							)}
						/>

						<FieldControl
							name="enableRecentSuggestions"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>Recent</Col>
									<Col xs={10}>
										<Switch {...handler('checkbox')} />
									</Col>
								</StyledRow>
							)}
						/>
						<FieldControl
							name="enableEndpointSuggestions"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>Endpoint</Col>
									<Col xs={10}>
										<Switch {...handler('checkbox')} />
									</Col>
								</StyledRow>
							)}
						/>
						<FieldControl
							name="enableFAQSuggestions"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>
										<span>FAQs </span>
										<Tooltip
											title={
												<div style={{ color: 'black' }}>
													Set FAQs from{' '}
													<a href="/cluster/ai-faqs">this page</a> and
													associate them with the searchbox id(
													<code>{mainForm.value.id}</code>) for FAQ
													suggestions to be displayed here. Currently,
													they only show when the searchbox is exported.
												</div>
											}
											color="white"
										>
											<InfoCircleOutlined />
										</Tooltip>
									</Col>
									<Col xs={10}>
										<Switch {...handler('checkbox')} />
									</Col>
								</StyledRow>
							)}
						/>
						<FieldControl
							name="enableFeaturedSuggestions"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>Featured</Col>
									<Col xs={10}>
										<Switch {...handler('checkbox')} />
									</Col>
								</StyledRow>
							)}
						/>
						<FieldControl
							name="enableAI"
							render={({ handler }) => (
								<StyledRow>
									<Col xs={14}>
										<span>AI Answer </span>
										<Tooltip
											title={
												<div style={{ color: 'black' }}>
													Configure AI Preferences from{' '}
													<a href="/cluster/ai-preferences">this page</a>{' '}
													to enable AI Answer
												</div>
											}
											color="white"
										>
											<InfoCircleOutlined />
										</Tooltip>
									</Col>
									<Col xs={10}>
										<Switch {...handler('checkbox')} />
									</Col>
								</StyledRow>
							)}
						/>
					</Section>
				</Row>
			)}
		/>
	);
}

DesignPanel.propTypes = {
	form: object.isRequired,
};
