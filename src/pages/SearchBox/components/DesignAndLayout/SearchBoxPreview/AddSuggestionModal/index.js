import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Button, Input, Modal, Select } from 'antd';
import {
	FieldControl,
	FieldGroup,
	FormBuilder,
	FormControl,
	Validators,
} from 'react-reactive-form';
import { uniqueId } from 'lodash';
import Flex from '../../../../../../batteries/components/shared/Flex';
import InputElement from '../../../../../../components/InputElement';
import Grid from '../../../../../../components/CreateCredentials/Grid';
import { isUrlValid } from '../../../../utils';
import FunctionEditor, { FUNCTION_EDITOR_TABS_KEYS } from './FunctionEditor';

const container = css`
	width: 80vw !important;
	height: 100vh;
	top: 0;
	padding-bottom: 0;

	& * {
		box-sizing: border-box;
	}
	.ant-modal-content {
		width: 100% !important;
		height: 100%;

		.ant-modal-body {
			height: calc(100% - 108px);
			.form-container {
				gap: 4rem;
				row-gap: 2rem;
				flex-wrap: wrap;
				.pos-rel {
					position: relative;

					input {
						width: 300px !important;
					}
					& > span {
						color: red;
						position: absolute;
						left: -8px;
						top: -2px;
						font-weight: 600;
					}
					& > div {
						align-items: start;
						flex-direction: column;
						margin-bottom: 0;
						& > div {
							&:first-child {
								width: 200px;
								margin-bottom: 10px;
							}
							&:nth-child(2) {
								margin-left: 0;
							}
							& > div:first-child {
								width: max-content;
							}
						}
					}

					&.sugg-description {
						width: calc(100% - 4rem);
						& > div {
							& > div {
								&:nth-child(2) {
									margin-left: 0;
									width: 100%;

									input {
										width: 100% !important;
										float: unset;
									}
								}
							}
						}
					}
				}

				.error {
					color: red;
				}

				.input-error {
					border-color: red;
				}

				.select-error {
					.ant-select-selection {
						border-color: red;
					}
				}
			}
		}
	}
	label {
		display: inline-block;
		width: 100%;

		span {
			display: inline-block;
			margin-bottom: 10px;
			font-weight: 500;
		}

		.error {
			border: 1px solid red;
			box-shadow: 0 0 2px red;
		}
	}

	.error-message {
		color: red;
	}
`;

const ALLOWED_ACTIONS = {
	NAVIGATE: { value: 'navigate', label: 'Navigate' },
	FUNCTION: { value: 'function', label: 'Function' },
};

const NAVIGATION_TYPES = { 'Same Tab': '_self', 'New Tab': '_blank' };

const linkValidator = async (control) => {
	return new Promise((resolve, reject) => {
		if (!control.value || isUrlValid(control.value)) {
			return resolve(null);
		}
		// eslint-disable-next-line no-throw-literal
		// eslint-disable-next-line prefer-promise-reject-errors
		return reject({ invalidLink: true });
	});
};
const AddSuggestion = (props) => {
	const { onSave, editMode, parentSectionId, onCloseModal, suggestion } = props;
	const DEFAULT_FUNCTION_VALUE =
		"/* Put your logic inside \n the function body */ \n \n /* CAUTION: MAKE CHANGES ONLY \nINSIDE THE FUNCTION BODY */ \n \n return function( suggestion, value, customEvents) {    \n /* change code below this line */ \n console.log('Hello World!');\n };";
	const [functionValue, setFunctionValue] = useState(DEFAULT_FUNCTION_VALUE);

	const getFormControls = () => {
		const {
			label = '',
			value = '',
			description = '',
			iconURL = '',
			action = '',
			subAction = '',
		} = suggestion ?? {};

		if (editMode) {
			let navigationType = '';
			let link = '';

			if (action === ALLOWED_ACTIONS.NAVIGATE.value) {
				navigationType = JSON.parse(subAction).target;
				// eslint-disable-next-line prefer-destructuring
				link = JSON.parse(subAction).link;
			}
			return {
				label: [label, Validators.required],
				value: [value, Validators.required],
				description,
				action: [action, Validators.required],
				...(action === ALLOWED_ACTIONS.NAVIGATE.value && {
					navigationType: [navigationType, Validators.required],
					link: [link, Validators.required, linkValidator],
				}),
				iconURL: [iconURL, null, linkValidator],
			};
		}
		return {
			label: ['', Validators.required],
			value: ['', Validators.required],
			description: '',
			action: [ALLOWED_ACTIONS.NAVIGATE.value, Validators.required],
			navigationType: [NAVIGATION_TYPES['New Tab'], Validators.required],
			link: ['', Validators.required, linkValidator],
			iconURL: ['', null, linkValidator],
		};
	};

	const form = useRef(FormBuilder.group(getFormControls()));

	useEffect(() => {
		form.current.valueChanges.subscribe((value) => {
			// do something

			if (
				form.current.get('navigationType') &&
				form.current.get('link') &&
				value.action === ALLOWED_ACTIONS.FUNCTION.value
			) {
				form.current.removeControl('navigationType');
				form.current.removeControl('link');
			} else if (
				!form.current.get('navigationType') &&
				!form.current.get('link') &&
				value.action === ALLOWED_ACTIONS.NAVIGATE.value
			) {
				form.current.addControl('navigationType', new FormControl('', Validators.required));
				form.current.addControl('link', new FormControl('', Validators.required));
			}
		});
	}, []);

	useEffect(() => {
		if (suggestion.action === ALLOWED_ACTIONS.FUNCTION.value && editMode) {
			let newFuncValue = suggestion.subAction;
			if (newFuncValue !== functionValue) {
				if (!newFuncValue.includes('return function')) {
					newFuncValue = newFuncValue.replace('function', 'return function');
				}
				setFunctionValue(newFuncValue);
			}
		}
	}, [suggestion]);

	const onSaveFunction = (funcString) => {
		setFunctionValue(funcString);
	};
	const constructSuggestion = ({ label, value, description, action, iconURL, ...rest }) => {
		const suggestionObject = {
			id: suggestion?.id ?? uniqueId(label),
			label,
			value,
			description,
			action,
			iconURL,
		};

		if (action === ALLOWED_ACTIONS.FUNCTION.value) {
			suggestionObject.subAction = functionValue.replace('return function', 'function'); // to remove 'return' keyword
		} else if (action === ALLOWED_ACTIONS.NAVIGATE.value) {
			suggestionObject.subAction = JSON.stringify({
				link: rest.link,
				...(rest.navigationType ? { target: rest.navigationType } : {}),
			});
		}

		return suggestionObject;
	};
	const handleSave = () => {
		if (form.current.invalid) {
			return;
		}
		const suggestionObject = constructSuggestion(form.current.value);
		onSave(parentSectionId, suggestionObject);
	};

	return (
		<>
			<Modal
				visible
				onCancel={onCloseModal}
				title={`${editMode ? 'Edit' : 'Add'} Suggestion`}
				className={container}
				footer={
					<Flex flexDirection="row-reverse" style={{ gap: '1.5rem' }}>
						<Button onClick={handleSave} type="primary">
							Save
						</Button>
						<Button onClick={onCloseModal} type="danger">
							Cancel
						</Button>
					</Flex>
				}
			>
				<FieldGroup
					control={form.current}
					render={() => {
						return (
							<div
								style={{
									height: '100%',
									overflow: 'auto',
									overflowX: 'hidden',
									paddingLeft: '7px',
								}}
							>
								<Flex className="form-container">
									<FieldControl
										strict={false}
										name="iconURL"
										render={({ handler, hasError, touched }) => {
											const { value: iconURLValue } =
												form.current.get('iconURL');
											return (
												<div className="pos-rel">
													<Grid
														label="Icon URL"
														toolTipMessage="Icon URL has to be specified here"
														component={
															<Flex flexDirection="column">
																<Input
																	{...handler()}
																	type="text"
																	placeholder="Icon URL has to be specified here"
																	value={iconURLValue}
																	style={{
																		marginBottom: '10px',
																		borderColor:
																			touched &&
																			hasError('invalidLink')
																				? 'red'
																				: '#d9d9d9',
																	}}
																/>
																<div>
																	<span style={{ color: 'red' }}>
																		{touched &&
																			hasError(
																				'invalidLink',
																			) &&
																			'Invalid URL'}
																	</span>
																</div>
															</Flex>
														}
													/>
												</div>
											);
										}}
									/>
									<div className="pos-rel">
										<span>*</span>
										<InputElement
											name="label"
											label="Suggestion Label"
											toolTipMessage="Enter Suggestion Label"
											placeholder="Enter Suggestion Label"
											inputProps={{
												style: {
													float: 'right',
												},
												type: 'text',
											}}
										/>
									</div>
									<div className="pos-rel">
										<span>*</span>
										<InputElement
											name="value"
											label="Suggestion Value"
											toolTipMessage="Enter Suggestion Value"
											placeholder="Enter Suggestion Value"
											inputProps={{
												style: {
													float: 'right',
												},
												type: 'text',
											}}
										/>
									</div>
									<div className="pos-rel sugg-description">
										{' '}
										<InputElement
											name="description"
											label="Suggestion Description"
											toolTipMessage="Enter Suggestion Description"
											placeholder="Enter Suggestion Description"
											inputProps={{
												style: {
													float: 'right',
													width: '100%',
												},
												type: 'text',
											}}
											gridRatio={1}
										/>
									</div>
									<Flex
										style={{ gap: '4rem', flexWrap: 'wrap' }}
										alignItems="center"
									>
										<FieldControl
											strict={false}
											name="action"
											render={({ handler, touched, hasError }) => {
												const inputHandler = handler();
												const { value: actionValue } =
													form.current.get('action');
												return (
													<div className="pos-rel">
														<span>*</span>
														<Grid
															label="Action Type"
															toolTipMessage="Select Action Type"
															component={
																<Flex flexDirection="column">
																	<Select
																		placeholder="Select Action Type"
																		style={{
																			width: '300px',
																		}}
																		className={
																			touched &&
																			hasError('required')
																				? 'select-error'
																				: ''
																		}
																		value={
																			actionValue || undefined
																		}
																		{...inputHandler}
																		onChange={(val) => {
																			inputHandler.onChange(
																				val,
																			);
																		}}
																	>
																		{Object.values(
																			ALLOWED_ACTIONS,
																		).map((item) => {
																			return (
																				<Select.Option
																					key={item.value}
																				>
																					{item.label}
																				</Select.Option>
																			);
																		})}
																	</Select>
																	<div>
																		<span
																			style={{ color: 'red' }}
																		>
																			{touched &&
																				hasError(
																					'required',
																				) &&
																				'Action value is required'}
																		</span>
																	</div>
																</Flex>
															}
														/>
													</div>
												);
											}}
										/>
										{form.current.get('action').value ===
											ALLOWED_ACTIONS.NAVIGATE.value &&
											form.current.get('navigationType') &&
											form.current.get('link') && (
												<>
													<FieldControl
														strict={false}
														name="navigationType"
														render={({
															handler,
															touched,
															hasError,
														}) => {
															const inputHandler = handler();
															const { value: navigationTypeValue } =
																form.current.get('navigationType');

															return (
																<div className="pos-rel">
																	<span>*</span>
																	<Grid
																		label="Navigation Type"
																		toolTipMessage="Select Navigation Type"
																		component={
																			<Flex flexDirection="column">
																				<Select
																					placeholder="Select Navigation Type"
																					style={{
																						width: '300px',
																					}}
																					className={
																						touched &&
																						hasError(
																							'required',
																						)
																							? 'select-error'
																							: ''
																					}
																					value={
																						navigationTypeValue
																					}
																					{...inputHandler}
																					onChange={(
																						val,
																					) => {
																						inputHandler.onChange(
																							val,
																						);
																					}}
																				>
																					{Object.keys(
																						NAVIGATION_TYPES,
																					).map(
																						(index) => {
																							return (
																								<Select.Option
																									key={
																										NAVIGATION_TYPES[
																											index
																										]
																									}
																								>
																									{
																										index
																									}
																								</Select.Option>
																							);
																						},
																					)}
																				</Select>{' '}
																				<div>
																					<span
																						style={{
																							color: 'red',
																						}}
																					>
																						{touched &&
																							hasError(
																								'required',
																							) &&
																							'Navigation Type is required'}
																					</span>
																				</div>
																			</Flex>
																		}
																	/>
																</div>
															);
														}}
													/>
													<FieldControl
														strict={false}
														name="link"
														render={({
															handler,
															hasError,
															touched,
														}) => {
															const { value: linkValue } =
																form.current.get('link');
															return (
																<div className="pos-rel">
																	<span>*</span>
																	<Grid
																		label="Navigation Link"
																		toolTipMessage="URL has to be specified here"
																		component={
																			<Flex flexDirection="column">
																				<Input
																					{...handler()}
																					type="text"
																					placeholder="URL has to be specified here"
																					value={
																						linkValue
																					}
																					style={{
																						borderColor:
																							hasError(
																								'invalidLink',
																							) ||
																							(touched &&
																								hasError(
																									'required',
																								))
																								? 'red'
																								: '#d9d9d9',
																					}}
																				/>
																				<div>
																					<span
																						style={{
																							color: 'red',
																						}}
																					>
																						{hasError(
																							'invalidLink',
																						) &&
																							'Invalid URL'}
																						{touched &&
																							hasError(
																								'required',
																							) &&
																							'URL is required'}
																					</span>
																				</div>
																			</Flex>
																		}
																	/>
																</div>
															);
														}}
													/>
												</>
											)}
									</Flex>
								</Flex>
								{form.current.get('action').value ===
									ALLOWED_ACTIONS.FUNCTION.value && (
									<FunctionEditor
										onSaveFunction={onSaveFunction}
										defaultCode={DEFAULT_FUNCTION_VALUE}
										openAsModal={false}
										showSaveFunctionButton
										shouldAppendReturnToFunctionConstructor={false}
										allowedTabs={[
											FUNCTION_EDITOR_TABS_KEYS.CONSOLE_LOGS,
											FUNCTION_EDITOR_TABS_KEYS.EXECUTION_CONTEXT,
										]}
									/>
								)}
							</div>
						);
					}}
				/>
			</Modal>
		</>
	);
};
AddSuggestion.propTypes = {
	editMode: PropTypes.bool.isRequired,
	onSave: PropTypes.func.isRequired,
	parentSectionId: PropTypes.string.isRequired,
	onCloseModal: PropTypes.func.isRequired,
	suggestion: PropTypes.object.isRequired,
};
export default AddSuggestion;
