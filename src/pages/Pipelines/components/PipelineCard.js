import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
	Alert,
	Button,
	Card,
	Col,
	Icon,
	message,
	notification,
	Popover,
	Row,
	Switch,
	Tag,
	Tooltip,
	Typography,
	InputNumber,
} from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import get from 'lodash/get';
import moment from 'moment';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import yamlToJson from 'js-yaml';
import { Link } from 'react-router-dom';
import ClonePipeline from './ClonePipeline';
import DeleteModal from '../../../components/DeleteModal';
import MobileMenu from './MobileMenu';
import {
	deletePipeline,
	togglePipelineStatus,
	reorderPipelines,
} from '../../../batteries/modules/actions';
import Flex from '../../../batteries/components/shared/Flex';
import { generatePipelinePayload } from '../../../batteries/utils/helpers';

const title = css`
	font-size: 16px;
	color: rgba(0, 0, 0, 0.85);
	margin: 0;
	font-weight: bold;
	display: flex;

	& > span {
		max-width: 255px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.routes-popover-tag {
		margin-left: 5px;
		min-width: 50px;
	}
`;

const description = css`
	color: rgba(0, 0, 0, 0.65);
	font-size: 14px;
	margin: 0;
`;

const actions = css`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	justify-content: flex-end;
	width: max-content;
	width: 100%;
	gap: 5px;
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

const mobileMenu = css`
	display: none;
	@media (max-width: 992px) {
		display: block;
		position: absolute;
		top: 0;
		right: 0;
		z-index: 1;
	}
`;

const card = css`
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
	.ant-input-number-handler-wrap {
		display: none;
	}

	.date-column {
		p {
			margin: 0px auto;
			font-size: 14px;
			&:first-child {
				margin-top: 0;
			}
		}
	}

	.usage-alert {
		padding: 3px 10px 3px 30px;

		i {
			top: 7.5px;
			left: 10px;
		}
	}
	.view-logs-btn {
		height: max-content;
		span {
			text-decoration: underline;
			font-weight: 600;
			font-size: 14px;
		}
	}
`;
const popoverContent = css`
	overflow-y: auto;
	overflow-x: auto;
	word-wrap: break-word;
	max-width: 500px;
	max-height: 300px;

	span {
		margin: 12px auto;
		overflow: auto;
		max-width: 100%;
		display: block;
		code {
			white-space: nowrap;
		}
	}
`;
const overflow = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const PipelineCard = (props) => {
	const {
		pipeline,
		pipelineScripts,
		dragSnapshot,
		dragProvided,
		togglePipeline,
		removePipeline,
		reorderPipeline,
		showEdit,
		showDrag,
		showExport,
		history,
	} = props;

	const [isEditPriority, setIsEditPriority] = useState(false);

	const [priorityValue, setpriorityValue] = useState(false);

	const actionButtonSize = window.innerWidth < 1090 ? 'small' : 'default';

	const handlePipelineStatus = (value) => {
		const modifiedPipelineValue = yamlToJson.dump({
			...yamlToJson.load(pipeline.content),
			enabled: value,
		});
		const pipelinePayload = generatePipelinePayload(
			modifiedPipelineValue,
			pipelineScripts,
			'content',
		);

		togglePipeline({
			id: pipeline.id,
			enabled: value,
			pipelinePayload,
		}).then((res) => {
			if (res && res.error) {
				notification.error({
					message: 'Error',
					description: get(res.error, 'message'),
				});
			} else {
				message.success(`Pipeline toggled successfully`);
				if (!showEdit) history.push('/cluster/pipelines');
			}
		});
	};
	const handleZipExport = () => {
		const zip = new JSZip();
		const folder = zip.folder(`${pipeline.id}`);
		folder.file('pipeline.yaml', pipeline.content);
		if (Object.keys(pipelineScripts).length) {
			Object.keys(pipelineScripts).forEach((fileName) => {
				const { content, extension } = pipelineScripts[fileName];
				folder.file(`${fileName}.${extension}`, content);
			});
		}

		zip.generateAsync({ type: 'blob' }).then((content) => {
			FileSaver.saveAs(content, `${pipeline.id}.zip`);
		});
	};

	const handleReordering = (val) => {
		reorderPipeline({
			id: pipeline.id,
			priority: val,
		}).then((res) => {
			if (res && res.error) {
				notification.error({
					message: 'Error',
					description: get(res.error, 'message'),
				});
			} else {
				message.success(
					`Pipeline re-ordered successfully from ${pipeline.priority} to ${val}`,
				);
			}

			setIsEditPriority(false);
		});
	};
	const pipelinesRoutePaths = pipeline.routes?.map((route) => route.path) || null;

	const getCreatedUpdatedStats = () => {
		if (pipeline.updated_at) {
			return (
				<div>
					<p>Updated: {moment.unix(pipeline.updated_at).format('ddd D MMM, hh:mm A')}</p>
				</div>
			);
		}
		if (pipeline.created_at) {
			return (
				<div>
					<p>Created: {moment.unix(pipeline.created_at).format('ddd D MMM, hh:mm A')}</p>
				</div>
			);
		}
		return null;
	};

	return (
		<Card
			hoverable
			className={card}
			style={{
				background: dragSnapshot.isDragging ? '#e6f7ff' : 'white',
			}}
		>
			<Row style={{ position: 'relative' }} gutter={8}>
				<div className={mobileMenu}>
					<MobileMenu
						pipeline={pipeline}
						removePipeline={removePipeline}
						togglePipeline={togglePipeline}
					/>
				</div>
				<Col xs={2}>
					<div style={{ display: 'flex' }}>
						{showDrag && (
							<Tooltip title="Drag to update the ordering of rules.">
								<div {...dragProvided.dragHandleProps} className={dragIcon}>
									<Icon type="drag" />
								</div>
							</Tooltip>
						)}

						<div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
								{isEditPriority ? (
									<InputNumber
										style={{
											width: 50,
										}}
										min={1}
										value={pipeline.order}
										onChange={(val) => {
											setpriorityValue(val);
										}}
										onPressEnter={(e) => {
											if (
												parseInt(e.target.value, 10) !== pipeline.priority
											) {
												handleReordering(parseInt(e.target.value, 10));
											}
										}}
									/>
								) : (
									<div>{pipeline.priority}</div>
								)}
								<div title="Click to edit the order.">
									{isEditPriority ? (
										// eslint-disable-next-line
										<Icon
											type="check-circle"
											theme="twoTone"
											onClick={() => {
												if (
													parseInt(priorityValue, 10) !==
													pipeline.priority
												) {
													handleReordering(priorityValue);
												}
												setIsEditPriority(false);
											}}
										/>
									) : (
										// eslint-disable-next-line
										<Icon
											type="edit"
											theme="twoTone"
											onClick={() => {
												setIsEditPriority(true);
											}}
										/>
									)}
								</div>
							</div>
						</div>
					</div>
				</Col>
				<Col xl={8} lg={8} md={12} sm={24}>
					<h4 className={title}>
						<span>{pipelinesRoutePaths?.[0] ?? ''}</span>
						{pipelinesRoutePaths?.length > 1 && (
							<Tag className="routes-popover-tag" color="blue">
								<Popover
									content={
										<div css={popoverContent}>
											<h3>All Routes</h3>
											{pipelinesRoutePaths.map((route) => (
												<span>
													<code key={route}>{route}</code>
													<br />
												</span>
											))}
										</div>
									}
									trigger="click"
								>
									<div
										css={{
											cursor: 'pointer',
											margin: '0 7px',
											maxWidth: '95%',
											...overflow,
										}}
									>
										{` {...} `}
									</div>
								</Popover>
							</Tag>
						)}
					</h4>

					<p className={description}>{pipeline.description}</p>
				</Col>
				<Col lg={7} md={12} sm={24} className="date-column">
					{getCreatedUpdatedStats()}
				</Col>
				<Col xl={7} lg={7} xs={0}>
					<div className={actions}>
						<DeleteModal
							name="rule"
							value={pipeline.id}
							title="Delete Pipeline"
							onDelete={() => {
								removePipeline(pipeline.id).then((res) => {
									if (res?.error) {
										notification.error({
											message: 'Error',
											description: res.error?.actual
												? res.error?.actual?.message
												: res.error?.message,
										});
									} else if (res.payload) {
										message.success('successfully deleted pipeline');
										// means the current page is edit page
										if (!showEdit) {
											history.push('/cluster/pipelines');
										}
									}
								});
							}}
						>
							{({ handleModal }) => (
								<div
									className="show-on-hover"
									style={{
										marginRight: 10,
										marginBottom: 3,
										color: '#999',
									}}
									onClick={handleModal}
								>
									<Icon type={pipeline.isDeleting ? 'loading' : 'delete'} />{' '}
									Delete
								</div>
							)}
						</DeleteModal>
						<ClonePipeline
							pipeline={pipeline}
							pipelineScripts={pipelineScripts}
							buttonSize={actionButtonSize}
						/>
						{showEdit && (
							<Link to={`/cluster/pipelines/${pipeline.id}`}>
								<Button size={actionButtonSize} type="primary">
									<Icon type="edit" /> Edit
								</Button>
							</Link>
						)}
						{showExport && (
							<Button
								onClick={handleZipExport}
								size={actionButtonSize}
								type="primary"
							>
								<Icon type="download" /> Export as Zip
							</Button>
						)}
					</div>
				</Col>
			</Row>
			<Flex
				justifyContent="space-between"
				alignItems="center"
				style={{ width: '100%', marginTop: '24px' }}
			>
				<Alert
					className="usage-alert"
					type="info"
					showIcon
					message={
						23 < 0
							? `Used ${0} times in last ${30} days`
							: 'Not used in the last 30 days'
					}
				/>
				<Button
					type="link"
					onClick={() => {
						// todo
					}}
					className="view-logs-btn"
				>
					<span>View Logs</span>
				</Button>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'flex-end',
					}}
				>
					<Typography.Text strong style={{ marginRight: 5 }}>
						Pipeline Status
					</Typography.Text>
					<Tooltip
						title={`Toggle to ${pipeline.enabled ? 'disable' : 'enable'} the rule`}
					>
						<Switch
							loading={pipeline.isToggling}
							checked={pipeline.enabled}
							onChange={handlePipelineStatus}
						/>
					</Tooltip>
				</div>
			</Flex>
		</Card>
	);
};

PipelineCard.defaultProps = {
	pipeline: {},
	pipelineScripts: {},
	dragProvided: {},
	dragSnapshot: {},
	showEdit: true,
	showExport: false,
	showDrag: true,
	history: {},
};

PipelineCard.propTypes = {
	pipeline: PropTypes.object,
	dragProvided: PropTypes.object,
	dragSnapshot: PropTypes.object,
	removePipeline: PropTypes.func.isRequired,
	togglePipeline: PropTypes.func.isRequired,
	reorderPipeline: PropTypes.func.isRequired,
	showEdit: PropTypes.bool,
	showExport: PropTypes.bool,
	showDrag: PropTypes.bool,
	history: PropTypes.object,
	pipelineScripts: PropTypes.object,
};

const mapStateToProps = (state, props) => {
	return {
		pipelineScripts: get(state, '$getAppPipelines.scriptResults')?.[props.pipeline.id],
	};
};

const mapDispatchToProps = (dispatch) => ({
	removePipeline: (id) => dispatch(deletePipeline(id)),
	togglePipeline: (payload) => dispatch(togglePipelineStatus(payload)),
	reorderPipeline: (payload) => dispatch(reorderPipelines(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PipelineCard);
