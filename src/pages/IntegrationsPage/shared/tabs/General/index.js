import React, { useContext } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Form, List, Popover } from 'antd';
import { bool, func, object } from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import TextInput from '../../../../../components/Form/Input';
import EndpointDropdown from '../../Endpoint/EndpointDropdown';
import { FormContext } from '../../../utils/utils';
import CredentialsModal from '../../Credentials/CredentialsModal';
import { deleteSearchPreference as deleteSearchPreferenceAction } from '../../../../../batteries/modules/actions';
import { deleteUIBuilderStyles } from './styles';
import Flex from '../../../../../batteries/components/shared/Flex';
import DeleteModal from '../../../../../components/DeleteModal';

const General = ({ isRecommendation, deleteSearchPreference, history }) => {
	const form = useContext(FormContext);

	const handleDelete = () => {
		const preferenceId = form.get('id') ? form.get('id').value : '';
		if (preferenceId)
			deleteSearchPreference(preferenceId).then((action) => {
				if (!(action && action.error)) {
					history.push(`/cluster/search-builder`);
				}
			});
	};

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
															onChange={(val) => {
																onChange(val);
																if (form.get('indexSettings')) {
																	const indexSettingsControl =
																		form.get('indexSettings');
																	if (
																		indexSettingsControl.get(
																			'endpoint',
																		)
																	) {
																		const endpointControl =
																			indexSettingsControl.get(
																				'endpoint',
																			);
																		if (
																			endpointControl.get(
																				'headers',
																			)
																		) {
																			const headersControl =
																				endpointControl.get(
																					'headers',
																				);
																			headersControl.setValue(
																				`{"Authorization":"Basic ${btoa(
																					val || '',
																				)}"}`,
																			);
																		}
																	}
																}
															}}
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
			{!isRecommendation ? (
				<List className={deleteUIBuilderStyles} bordered>
					<List.Item>
						<List.Item.Meta
							description={
								<div className="delete-message">
									<b>Delete this search UI</b>
									<Flex alignItems="center" justifyContent="space-between">
										<div>
											Once you delete a search UI, there is no going back.
											Please be certain.
										</div>
										<DeleteModal
											name="Search UI builder"
											value={form.get('id') ? form.get('id').value : ''}
											title="Delete Search UI builder"
											onDelete={handleDelete}
											valueType="id"
										>
											{({ handleModal }) => (
												<Button
													type="primary"
													onClick={handleModal}
													className="delete-button"
												>
													Delete
												</Button>
											)}
										</DeleteModal>
									</Flex>
								</div>
							}
						/>
					</List.Item>
				</List>
			) : null}
		</Form>
	);
};

General.defaultProps = {
	isRecommendation: false,
};

General.propTypes = {
	isRecommendation: bool,
	deleteSearchPreference: func.isRequired,
	history: object.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
	deleteSearchPreference: (id) => dispatch(deleteSearchPreferenceAction(id)),
});

export default connect(null, mapDispatchToProps)(withRouter(General));
