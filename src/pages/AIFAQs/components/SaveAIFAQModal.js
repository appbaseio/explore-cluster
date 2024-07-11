/* eslint-disable react/no-danger */
/* eslint-disable camelcase */
import {
	Button,
	Card,
	Col,
	Input,
	InputNumber,
	Modal,
	Row,
	Select,
	Slider,
	Spin,
	Typography,
	message,
	notification,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { bool, func, object, string } from 'prop-types';
import { Remarkable } from 'remarkable';
import { FieldControl, FieldGroup, FormBuilder, Validators } from 'react-reactive-form';
import { css } from 'emotion';
import { MessageFilled } from '@ant-design/icons';
import { get } from 'lodash';
import { connect } from 'react-redux';
import Flex from '../../../batteries/components/shared/Flex';
import ErrorToaster from '../../../batteries/components/shared/ErrorToaster';
import Grid from '../../../components/CreateCredentials/Grid';
import {
	getAIPreferences,
	getSearchBoxes,
	createAISession,
	getAIAnswerByID,
} from '../../../batteries/utils/app';
import { patchAIFAQ, putAIFAQ } from '../../../batteries/modules/actions/AI';
import constants from '../../../batteries/modules/constants';

const md = new Remarkable();

md.set({
	html: true,
	breaks: true,
	xhtmlOut: true,
});

const modalCSS = css`
	.field-component {
		flex-direction: column;
		max-width: 50%;
		gap: 10px;
		min-width: 350px;
		flex: 1;

		& > div {
			flex: unset;
		}
		& > div:nth-child(2) {
			margin-left: 0;
		}

		.required-marker {
			color: red;
			font-size: 1rem;
		}
		.error {
			color: tomato;
			padding: 5px 0;
		}

		.select-error {
			border: 1px solid tomato;
			border-radius: 2px;
		}
		.input-error {
			border-color: tomato;
		}

		.field-component-wrapper {
			width: 100%;
			margin: auto 0;
		}
	}

	.ai-ask-section {
		background-color: #f2f5f7;
		width: 100%;

		.ant-card-body {
			width: 100%;
			display: flex;
			flex-wrap: wrap;
			gap: 10px;
			padding-top: 0;
		}
	}
`;

const temperatureRange = [0.1, 2.0]; // OpenAI acceptable range for temperature
const maxTokensRange = [0, 8000]; // OpenAI acceptable range for max tokens

const SaveAIFAQModal = ({
	visible,
	record,
	onClose,
	onSaveFAQ,
	isSaving,
	title,
	saveFAQ,
	updateFAQ,
}) => {
	const form = useRef(
		FormBuilder.group({
			question: ['', Validators.required],
			context: '',
			temperature: 1,
			maxTokens: 800,
			answer: ['', Validators.required],
			model: '',
			searchboxes: [[], Validators.required],
		}),
	);
	const [showModal, setShowModal] = useState(false);
	const [AIPrefs, setAIPrefs] = useState(null);
	const [searchboxIds, setSearchboxIds] = useState([]);
	const [loadingState, setLoadingState] = useState(false);
	const [isSmallScreen, setIsSmallScreen] = useState(false);
	const [disableAskAI, setDisableAskAI] = useState(false);
	const [isAskBtnLoading, setIsAskBtnLoading] = useState(false);
	const [disableSaveBtn, setDisableSaveBtn] = useState(false);

	const fetchAIPreferences = () => {
		setLoadingState((prev) => prev + 1);
		getAIPreferences()
			.then((res) => {
				setAIPrefs(res);
				form.current.patchValue({
					model: res.defaultModel || 'gpt-4o',
					maxTokens: res.defaultMaxTokens || 800,
				});
			})
			.catch(() => {
				message.error('Whoa! There was an error fetching the AI preferences.');
			})
			.finally(() => {
				setLoadingState((prev) => (prev === 0 ? 0 : prev - 1));
			});
	};

	const fetchSearchBoxes = () => {
		setLoadingState((prev) => prev + 1);
		getSearchBoxes()
			.then((res) => {
				setSearchboxIds(res.map((_) => _.id));
			})
			.catch(() => {
				message.error('Whoa! There was an error fetching the searchboxes.');
			})
			.finally(() => {
				setLoadingState((prev) => (prev === 0 ? 0 : prev - 1));
			});
	};

	const handleAskAI = () => {
		const formValues = form.current.value;
		const payload = {
			question: formValues.question,
			...(formValues.context
				? {
						olderContext: [
							{
								role: 'user',
								content: formValues.context,
							},
						],
				  }
				: {}),
			maxTokens: formValues.maxTokens,
			temperature: Array.isArray(formValues.temperature)
				? formValues.temperature[0]
				: formValues.temperature,
			model: formValues.model,
		};
		setIsAskBtnLoading(true);
		createAISession(payload)
			.then((res) => {
				if (res.AIsessionId) {
					getAIAnswerByID(res.AIsessionId)
						.then((res1) => {
							const lastAssistantMessage = res1?.answer?.text;

							if (lastAssistantMessage) {
								form.current.patchValue({
									answer: lastAssistantMessage,
								});
							}
						})
						.catch(() => {
							notification.error({
								description: 'There was an error fetching AI response',
							});
						})
						.finally(() => {
							setIsAskBtnLoading(false);
						});
				} else {
					notification.error({
						description: 'There was an error creating an AI session',
					});
				}
			})
			.catch(() => {
				notification.error({
					description: 'There was an error creating an AI session',
				});
				setIsAskBtnLoading(false);
			});
	};

	const handleSaveFAQ = () => {
		const { question, answer, searchboxes } = form.current.value;
		const payload = {
			question,
			answer,
			searchboxId: searchboxes,
		};

		let id = new Date().getTime();
		let saveFunc = saveFAQ;
		if (record?.faq_id) {
			saveFunc = updateFAQ;
			id = record?.faq_id;
		}

		saveFunc(id, payload)
			.then((res) => {
				if (
					res?.type === constants.APP.AI.CREATE_AI_FAQS_SUCCESS ||
					res?.type === constants.APP.AI.UPDATE_AI_FAQS_SUCCESS
				) {
					notification.success({
						message: 'Success',
						description: 'FAQ saved successfully',
					});
					setShowModal(false);
					if (onSaveFAQ) onSaveFAQ();
				} else if (
					res?.type === constants.APP.AI.CREATE_AI_FAQS_ERROR ||
					res?.type === constants.APP.AI.UPDATE_AI_FAQS_ERROR
				) {
					notification.error({
						message: 'Error',
						description: 'There was a problem saving the FAQ',
					});
				}
			})
			.catch(() => {
				notification.error({
					message: 'Error',
					description: 'There was a problem creating the FAQ',
				});
			});
	};

	useEffect(() => {
		fetchAIPreferences();
		fetchSearchBoxes();
		const handleResize = () => {
			setIsSmallScreen(window.innerWidth <= 768); // Adjust the breakpoint as needed
		};

		handleResize();
		window.addEventListener('resize', handleResize);

		const handleFormValueSubscription = (val) => {
			setDisableAskAI(!val.question);

			setDisableSaveBtn(!val.question || !val.answer || val.searchboxes.length === 0);
		};
		form.current.valueChanges.subscribe(handleFormValueSubscription);

		return () => {
			window.removeEventListener('resize', handleResize);
			form.current.valueChanges.unsubscribe(handleFormValueSubscription);
		};
	}, []);

	useEffect(() => {
		setShowModal(visible);
	}, [visible]);

	useEffect(() => {
		if (record) {
			form.current.patchValue({
				...form.current.value,
				...record,
				...(record.searchboxId ? { searchboxes: record.searchboxId } : {}),
			});
		}
	}, [record]);

	useEffect(() => {
		setDisableSaveBtn(isSaving);
	}, [isSaving]);

	useEffect(() => {
		if (AIPrefs) {
			form.current.patchValue({
				model: AIPrefs.defaultModel,
			});
		}
	}, [AIPrefs]);

	return (
		<Modal
			title={title}
			visible={showModal}
			onCancel={onClose}
			footer={null}
			width={isSmallScreen ? '80%' : 0.6 * window.innerWidth}
			destroyOnClose
			className={modalCSS}
		>
			<Spin spinning={!!loadingState}>
				<ErrorToaster>
					<FieldGroup
						strict={false}
						control={form.current}
						render={() => {
							return (
								<Flex
									style={{
										gap: '2rem',
										flexWrap: 'wrap',
										flexDirection: 'row',
										marginBottom: '2rem',
									}}
								>
									<FieldControl
										strict={false}
										control={form.current.get('question')}
										render={({ handler, errors, touched }) => (
											<Grid
												className="field-component"
												gridRatio={0.4}
												label={
													<span>
														<span className="required-marker">*</span>
														Question
													</span>
												}
												toolTipMessage={<span>Enter FAQ prompt</span>}
												component={
													<div className="field-component-wrapper">
														<Input.TextArea
															{...handler()}
															autoSize={{ minRows: 1, maxRows: 3 }}
															placeholder="Add a question to FAQ"
															className={
																errors?.required && touched
																	? 'input-error'
																	: ''
															}
														/>
														{touched && errors?.required && (
															<div className="error">
																This is a required field
															</div>
														)}
													</div>
												}
											/>
										)}
									/>{' '}
									<FieldControl
										strict={false}
										control={form.current.get('searchboxes')}
										render={({ handler, value, errors, touched }) => {
											const inputHandler = handler();
											return (
												<Grid
													className="field-component"
													gridRatio={0.4}
													label={
														<span>
															<span className="required-marker">
																*
															</span>
															Searchboxes
														</span>
													}
													toolTipMessage={
														<span>
															SearchBox points to the searchbox the
															FAQ should show alongside with.
														</span>
													}
													component={
														<div className="field-component-wrapper">
															<Select
																{...handler()}
																placeholder="Select searchboxes to associate the FAQ with"
																mode="tags"
																tokenSeparators={[',']}
																value={value}
																{...inputHandler}
																onChange={(val) => {
																	inputHandler.onChange(val);
																}}
																style={{ width: '100%' }}
																className={
																	errors?.required && touched
																		? 'select-error'
																		: ''
																}
															>
																{searchboxIds.map((index) => (
																	<Select.Option key={index}>
																		{index}
																	</Select.Option>
																))}
															</Select>
															{touched && errors?.required && (
																<div className="error">
																	This is a required field
																</div>
															)}
														</div>
													}
												/>
											);
										}}
									/>
									<Card className="ai-ask-section">
										<Typography.Paragraph strong style={{ width: '100%' }}>
											Ask AI for an answer for the FAQ
										</Typography.Paragraph>
										<FieldControl
											strict={false}
											control={form.current.get('model')}
											render={({ handler }) => (
												<Grid
													className="field-component"
													gridRatio={0.4}
													label="Model"
													toolTipMessage={<span>Select the model</span>}
													component={
														<Input
															{...handler()}
															value={handler().value || ''}
															style={{ width: '100%' }}
															placeholder="Enter model"
														/>
													}
												/>
											)}
										/>
										<FieldControl
											strict={false}
											control={form.current.get('context')}
											render={({ handler }) => (
												<Grid
													className="field-component"
													gridRatio={0.4}
													label="Context"
													toolTipMessage={
														<span>Provide additional context</span>
													}
													component={
														<Input.TextArea
															{...handler()}
															autoSize={{ minRows: 1, maxRows: 10 }}
															placeholder="additional info to set context to OpenAI along with the question"
														/>
													}
												/>
											)}
										/>
										<FieldControl
											strict={false}
											control={form.current.get('temperature')}
											render={({ handler }) => {
												return (
													<Grid
														className="field-component"
														gridRatio={0.4}
														label="Temperature"
														toolTipMessage={
															<span>
																[optional] A control for randomness,
																a lower value implies a more
																deterministic output. Defaults to 1,
																valid values are between [0, 2].
															</span>
														}
														component={
															<Row style={{ width: '100%' }}>
																<Col span={12}>
																	<Slider
																		{...handler()}
																		step={0.1}
																		range
																		min={temperatureRange[0]}
																		max={temperatureRange[1]}
																	/>
																</Col>
																<Col span={4}>
																	<InputNumber
																		min={temperatureRange[0]}
																		max={temperatureRange[1]}
																		style={{
																			marginLeft: '16px',
																		}}
																		step={0.1}
																		{...handler()}
																	/>
																</Col>
															</Row>
														}
													/>
												);
											}}
										/>
										<FieldControl
											strict={false}
											control={form.current.get('maxTokens')}
											render={({ handler }) => (
												<Grid
													className="field-component"
													gridRatio={0.4}
													label="Max Tokens"
													toolTipMessage={
														<span>
															[optional] The maximum tokens that can
															be used for the output. Defaults to a
															dynamically calculated value. Accepts a
															value between [1, 8000].
														</span>
													}
													component={
														<Row style={{ width: '100%' }}>
															<Col span={12}>
																<InputNumber
																	min={maxTokensRange[0]}
																	step={50}
																	{...handler()}
																/>
															</Col>
														</Row>
													}
												/>
											)}
										/>
										<div style={{ width: '100%', marginTop: '1rem' }}>
											<Button
												icon={<MessageFilled />}
												onClick={handleAskAI}
												disabled={disableAskAI}
												loading={isAskBtnLoading}
											>
												Ask AI
											</Button>
										</div>
									</Card>
									<FieldControl
										strict={false}
										control={form.current.get('answer')}
										render={({ handler, errors, touched }) => (
											<Grid
												className="field-component"
												style={{ width: '100%', maxWidth: '100%' }}
												gridRatio={0.4}
												label={
													<span>
														<span className="required-marker">*</span>
														Answer
													</span>
												}
												toolTipMessage={<span>AI response</span>}
												component={
													<div className="field-component-wrapper">
														<Input.TextArea
															{...handler()}
															autoSize={{ minRows: 2, maxRows: 10 }}
															placeholder="Answer FAQ with AI or write your own answer"
															className={
																errors?.required && touched
																	? 'input-error'
																	: ''
															}
														/>
														{touched && errors?.required && (
															<div className="error">
																This is a required field
															</div>
														)}
													</div>
												}
											/>
										)}
									/>{' '}
									<div style={{ width: '100%', marginTop: '1rem' }}>
										<Button
											type="primary"
											disabled={disableSaveBtn}
											onClick={handleSaveFAQ}
											loading={isSaving}
										>
											Save as FAQ
										</Button>
									</div>
								</Flex>
							);
						}}
					/>
				</ErrorToaster>
			</Spin>
		</Modal>
	);
};

SaveAIFAQModal.defaultProps = {
	record: null,
	onClose: () => {},
	isSaving: false,
	title: 'Add Question to FAQs',
	onSaveFAQ: () => {},
};

SaveAIFAQModal.propTypes = {
	record: object,
	onCancel: func.isRequired,
	visible: bool.isRequired,
	onClose: func,
	onSaveFAQ: func,
	isSaving: bool,
	title: string,
	saveFAQ: func.isRequired,
	updateFAQ: func.isRequired,
};

const mapStateToProps = (state) => ({
	isSaving:
		get(state, '$getAIReducer.faqs.isCreating', false) ||
		get(state, '$getAIReducer.faqs.isUpdating', false),
});

const mapDispatchToProps = (dispatch) => ({
	saveFAQ: (id, payload) => dispatch(putAIFAQ(id, payload)),
	updateFAQ: (id, payload) => dispatch(patchAIFAQ(id, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SaveAIFAQModal);
