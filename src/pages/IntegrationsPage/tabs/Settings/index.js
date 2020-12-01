import React, { useContext } from 'react';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { Form, Tabs, Select } from 'antd';
import ResultSettings from '../Search/Results';
import TextInput from '../../../../components/Form/Input';
import { FormContext } from '../../utils';
import LayoutTab from '../Layout';

const { TabPane } = Tabs;

const Settings = () => {
	const form = useContext(FormContext);
	return (
		<LayoutTab
			isRecommendation
			defaultActiveKey="action-setting"
			appendTabs={
				<TabPane tab="Products" key="action-setting">
					<FieldGroup
						control={form}
						render={() => (
							<Form colon={false}>
								<TextInput
									name="ctaTitle"
									label="Title"
									inputProps={{
										placeholder: 'Enter CTA title',
										style: {
											maxWidth: 300,
										},
									}}
								/>
								<Form.Item label="CTA Action">
									<FieldControl name="ctaAction">
										{({ handler }) => (
											<Select
												{...handler()}
												style={{
													maxWidth: 300,
												}}
											>
												<Select.Option key="redirect_to_product">
													Open product detail view
												</Select.Option>
											</Select>
										)}
									</FieldControl>
								</Form.Item>

								<div className="ant-col ant-form-item-label">
									<span
										style={{
											color: 'rgba(0, 0, 0, 0.85)',
										}}
									>
										Select Product card fields
									</span>
								</div>
								<ResultSettings
									dataSource={[
										{
											id: 'resultTitle',
											label: (
												<span>
													Select the data field to display the{' '}
													<strong>title</strong> of the result item
												</span>
											),
											value: true,
										},
										{
											id: 'resultDescription',
											label: (
												<span>
													Select the data field to display the{' '}
													<strong>description</strong> of the result item
												</span>
											),
											value: true,
										},
										{
											id: 'resultPrice',
											label: (
												<span>
													Select the data field to display the{' '}
													<strong>price</strong> of the result item
												</span>
											),
											value: true,
										},
										{
											id: 'resultImage',
											label: (
												<span>
													Select the data field to display the{' '}
													<strong>image</strong> of the result item
												</span>
											),
											value: true,
										},
										{
											id: 'resultHandle',
											label: (
												<span>
													Select the data field to define the{' '}
													<strong>redirect url</strong> for the result
													item
												</span>
											),
											value: true,
										},
									]}
									withoutForm
								/>
							</Form>
						)}
					/>
				</TabPane>
			}
		/>
	);
};

export default Settings;
