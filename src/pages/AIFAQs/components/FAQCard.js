import React, { useEffect, useState } from 'react';
import {
	Button,
	Card,
	Col,
	InputNumber,
	Popconfirm,
	Row,
	Tooltip,
	Typography,
	notification,
} from 'antd';
import { css } from 'emotion';
import {
	CheckCircleTwoTone,
	DeleteOutlined,
	DragOutlined,
	LoadingOutlined,
	EditFilled,
	EditTwoTone,
} from '@ant-design/icons';
import { bool, func, object, oneOf, string } from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import Flex from '../../../batteries/components/shared/Flex';
import { getAIFAQs, patchAIFAQ, removeAIFAQ } from '../../../batteries/modules/actions/AI';

const card = css`
	@media (hover: hover) {
		.show-on-hover {
			transform: rotateX(90deg);
			opacity: 0;
			transition: all ease 0.3s;
		}
		&:hover {
			.show-on-hover {
				transform: rotateX(0deg);
				opacity: 1;
			}
		}
	}
	.ant-input-number-handler-wrap {
		display: none;
	}
`;
const dragIcon = css`
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	padding: 2px;
	border-radius: 2px;
	transition: all ease 0.2s;
	&:hover {
		background: #f5f5f5;
	}
`;

const actions = css`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	justify-content: flex-end;

	button:not(:first-child),
	a {
		margin-left: 5px;
	}
	@media (max-width: 1024px) {
		button {
			margin-top: 5px;
		}
	}
`;

const FAQCard = (props) => {
	const {
		dragSnapshot,
		fetchAIFAQs,
		deleteAIFAQ,
		dragProvided,
		faq,
		isDeletingFAQ,
		updateAIFAQOrder,
		onEdit,
	} = props;

	const [isEdit, setIsEdit] = useState(false);
	const [order, setOrder] = useState(0);

	const handleOrderInputEnterPress = (targetValue) => {
		if (targetValue !== faq.order) {
			updateAIFAQOrder(faq.faq_id, {
				order: targetValue,
			})
				.then((res) => {
					if (res?.error) {
						const errorMessage =
							res?.error?.actual?.message ??
							res?.error?.message ??
							'Oops! there was a problem re-ordering the FAQ';

						notification.error({
							message: 'Error',
							description: errorMessage,
						});
					} else {
						notification.success({
							message: 'Success',
							description: `FAQ re-ordered successfully from ${faq.order} to ${targetValue}`,
						});
					}
				})
				.catch(() => {
					notification.error({
						message: 'Error',
						description: 'Oops! there was a problem re-ordering the FAQ',
					});
				});
			setIsEdit(false);
		} else {
			setIsEdit(false);
		}
	};

	const handleDeleteFAQ = (faqId) => {
		deleteAIFAQ(faqId)
			.then((res) => {
				if (res.error) {
					throw res.error;
				}
				notification.success({
					message: 'FAQ successfully deleted.',
				});
				fetchAIFAQs();
			})
			.catch((e) => {
				notification.error({
					message:
						e?.actual?.message ||
						e?.message ||
						'Oops! There was a problem deleting the FAQ.',
				});
			});
	};

	const handleEditClick = () => {
		if (onEdit) onEdit(faq);
	};

	useEffect(() => {
		if (isEdit) setIsEdit(false);
	}, [dragSnapshot.isDragging]);

	useEffect(() => {
		setOrder(faq.order);
	}, [faq.order]);

	return (
		<Card
			hoverable
			className={card}
			style={{
				background: dragSnapshot.isDragging ? '#e6f7ff' : 'white',
			}}
		>
			<Row style={{ position: 'relative', justifyContent: 'space-between' }} gutter={8}>
				<Col flex="auto" xs={3} lg={3} md={3} sm={3}>
					<div style={{ display: 'flex', width: 'max-content' }}>
						<Tooltip title="Drag to update the ordering of FAQs.">
							<div {...dragProvided.dragHandleProps} className={dragIcon}>
								<DragOutlined />
							</div>
						</Tooltip>

						<div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
							{isEdit ? (
								<InputNumber
									style={{
										width: 50,
									}}
									min={1}
									value={order}
									onChange={(val) => {
										setOrder(val);
									}}
									onPressEnter={(e) =>
										handleOrderInputEnterPress(parseInt(e.target.value, 10))
									}
								/>
							) : (
								<div>{faq.order}</div>
							)}
							<Tooltip title="Click to edit the order.">
								{isEdit ? (
									<CheckCircleTwoTone
										onClick={() => {
											// TODO: add funcitonality code
											handleOrderInputEnterPress(order);
										}}
										style={{ position: 'relative', zIndex: 3 }}
									/>
								) : (
									<EditTwoTone
										onClick={() => {
											setIsEdit(true);
										}}
									/>
								)}
							</Tooltip>
						</div>
					</div>
				</Col>
				<Col xl={16} lg={12} md={12} sm={24}>
					<div style={{ flexGrow: 1, paddingLeft: '26px' }}>
						<Tooltip title={faq.question}>
							<Typography.Text ellipsis>{faq.question}</Typography.Text>
						</Tooltip>
					</div>
				</Col>
				<Col lg={3} md={6} sm={12} xs={24}>
					<Flex
						alignItems="center"
						justifyContent="flex-end"
						style={{ textAlign: 'right', minWidth: '120px', height: '100%' }}
					>
						{faq.updatedAt}
					</Flex>
				</Col>
				<Col xl={3} lg={5} sm={9} xs={24} style={{ marginLeft: '10px' }}>
					<div className={actions}>
						<Tooltip title="Edit">
							<Button type="default" onClick={handleEditClick}>
								<EditFilled />
							</Button>{' '}
						</Tooltip>{' '}
						<div
							className="show-on-hover"
							style={{
								marginLeft: 10,
								color: '#999',
							}}
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<Popconfirm
								title="Are you sure you want to delete the FAQ?"
								okText="Yes"
								cancelText="No"
								onConfirm={(e) => {
									e.stopPropagation();
									handleDeleteFAQ(faq.faq_id);
								}}
								disabled={isDeletingFAQ === faq.faq_id}
							>
								<Tooltip title="Delete">
									<Button type="default">
										{isDeletingFAQ === faq.faq_id ? (
											<LoadingOutlined />
										) : (
											<DeleteOutlined />
										)}
									</Button>{' '}
								</Tooltip>
							</Popconfirm>
						</div>
					</div>
				</Col>
			</Row>
		</Card>
	);
};

FAQCard.defaultProps = {
	faq: {},
	dragProvided: {},
	dragSnapshot: {},
};

FAQCard.propTypes = {
	faq: object,
	dragProvided: object,
	dragSnapshot: object,
	isDeletingFAQ: oneOf([bool, string]).isRequired,
	deleteAIFAQ: func.isRequired,
	fetchAIFAQs: func.isRequired,
	updateAIFAQOrder: func.isRequired,
	onEdit: func.isRequired,
};

const mapStateToProps = (state) => ({
	isDeletingFAQ: get(state, '$getAIReducer.faqs.isDeleting', false),
});

const mapDispatchToProps = (dispatch) => ({
	fetchAIFAQs: () => dispatch(getAIFAQs()),
	deleteAIFAQ: (id) => dispatch(removeAIFAQ(id)),
	updateAIFAQOrder: (id, payload) => dispatch(patchAIFAQ(id, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FAQCard);
