import React, { useContext } from 'react';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { Tabs, Select, Form } from 'antd';
import { css } from 'emotion';
import ResultSettings from './Results';
import TextInput from '../../../../components/Form/Input';
import { FormContext, CtaActions } from '../../utils/utils';
import LayoutTab from '../../SearchUIBuilderPage/components/tabs/Layout';

const formItemStyle = css`
	.ant-form-item-label {
		text-align: left;
	}
`;
const { TabPane } = Tabs;

const Settings = () => {
	const form = useContext(FormContext);
	return (
		<LayoutTab
			isRecommendation
			defaultActiveKey="action-setting"
			appendTabs={
				<TabPane tab="Product Card" key="action-setting">
					<FieldGroup
						control={form}
						render={() => (
							<Form
								labelCol={{ span: 4 }}
								wrapperCol={{ span: 14 }}
								className={formItemStyle}
								colon={false}
							>
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
												<Select.Option key={CtaActions.REDIRECT_TO_PRODUCT}>
													Open product detail view
												</Select.Option>
												<Select.Option key={CtaActions.NO_BUTTON}>
													Do not show button
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
									pipeline={
										form.get('pipeline')
											? form.get('pipeline').value
											: undefined
									}
									form={form}
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
