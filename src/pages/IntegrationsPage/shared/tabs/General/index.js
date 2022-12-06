import React, { useContext } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Form, Popover } from 'antd';
import { bool } from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import TextInput from '../../../../../components/Form/Input';
import EndpointDropdown from '../../Endpoint/EndpointDropdown';
import { FormContext } from '../../../utils';
import CredentialsModal from '../../../Credentials/CredentialsModal';

const General = ({ isRecommendation }) => {
	const form = useContext(FormContext);

	return (
		<Form layout="vertical">
			<FieldGroup control={form} strict={false}>
				{({ value }) => {
					return (
						<div>
							<div style={{ maxWidth: 500 }}>
								<div style={{ display: 'grid', gridGap: 5 }}>
									<TextInput
										name="name"
										label="Name"
										inputProps={{
											placeholder: `${
												isRecommendation
													? 'Enter Recommendation UI name'
													: 'Enter Search UI name'
											}`,
										}}
										formItemProps={{
											style: {
												margin: 0,
												padding: 0,
											},
										}}
									/>

									<TextInput
										name="description"
										label="Description"
										inputProps={{
											placeholder: `${
												isRecommendation
													? 'Describe your Recommendation UI (optional)'
													: 'Describe your search UI (optional)'
											}`,
										}}
										formItemProps={{
											style: {
												margin: 0,
												padding: 0,
											},
										}}
									/>
									<FieldGroup control={form.get('exportSettings')}>
										{() => (
											<div>
												<div
													style={{
														margin: '10px 0px',
														color: 'rgba(0, 0, 0, 0.85)',
													}}
												>
													<span>
														API Credentials
														<Popover
															content={
																<div>
																	API credentials allow secure UI
																	access to the reactivesearch.io
																	cluster. Check docs at{' '}
																	<a
																		target="blank"
																		href="https://docs.reactivesearch.io/docs/security/credentials/"
																	>
																		here
																	</a>
																	.
																</div>
															}
														>
															<InfoCircleOutlined
																style={{ marginLeft: '5px' }}
															/>
														</Popover>
													</span>
												</div>
												<FieldControl name="credentials" strict={false}>
													{({ value: formVal, onChange }) => (
														<CredentialsModal
															value={formVal}
															onChange={onChange}
														/>
													)}
												</FieldControl>
											</div>
										)}
									</FieldGroup>
								</div>
							</div>
							<EndpointDropdown formValue={value} form={form} />
						</div>
					);
				}}
			</FieldGroup>
		</Form>
	);
};

General.defaultProps = {
	isRecommendation: false,
};

General.propTypes = {
	isRecommendation: bool,
};

export default General;
