import React from 'react';
import PropTypes from 'prop-types';
import {
	Alert,
	Button,
	Card,
	Col,
	Icon,
	message,
	notification,
	Row,
	Switch,
	Tooltip,
	Typography,
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
import { deletePipeline, togglePipelineStatus } from '../../../batteries/modules/actions';
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
	max-height: 110px;

	span {
		margin: 12px 0;
		display: block;
		white-space: nowrap;
		padding: 0 10px 0 0;
		width: max-content;

		code {
			white-space: nowrap;
		}
	}
`;

const PipelineCard = (props) => {
	const {
		pipeline,
		pipelineScripts,
		togglePipeline,
		removePipeline,
		showEdit,
		showExport,
		history,
		usageStats,
	} = props;

	const actionButtonSize = window.innerWidth < 1090 ? 'small' : 'default';

	const handlePipelineStatus = (value) => {
		const modifiedPipelineValue = JSON.stringify({
			...yamlToJson.load(pipeline.content),
			enabled: value,
		});
		const pipelinePayload = generatePipelinePayload(
			modifiedPipelineValue,
			pipelineScripts,
			'content',
		);
		pipelinePayload.append('enabled', value);
		togglePipeline(pipeline.id, pipeline._version, {
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
		folder.file('pipeline.json', pipeline.content);
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

	const pipelinesRoutePaths =
		pipeline.routes?.map((route) => ({ path: route.path, method: route.method })) || null;

	const getCreatedUpdatedStats = () => {
		const stats = {};
		if (pipeline.updated_at) {
			stats.title = (
				<div>
					<p>{moment.unix(pipeline.updated_at).format('ddd D MMM, hh:mm A')}</p>
				</div>
			);
			stats.difftime = `Updated ${moment.unix(pipeline.updated_at).stdFromNow()}`;
			return stats;
		}
		if (pipeline.created_at) {
			stats.title = (
				<div>
					<p>{moment.unix(pipeline.created_at).format('ddd D MMM, hh:mm A')}</p>
				</div>
			);
			stats.difftime = `Created ${moment.unix(pipeline.created_at).stdFromNow()}`;
			return stats;
		}
		return stats;
	};
	return (
		<Card
			hoverable
			className={card}
			style={{
				background: 'white',
			}}
		>
			<Row style={{ position: 'relative' }} gutter={8}>
				<div className={mobileMenu}>
					<MobileMenu pipeline={pipeline} removePipeline={removePipeline} />
				</div>

				<Col xl={8} lg={8} md={12} sm={24}>
					<h4 className={title}>
						<Tooltip title={pipeline.id}>{pipeline.id}</Tooltip>
					</h4>

					<p className={description}>{pipeline.description}</p>
				</Col>
				<Col lg={9} md={14} sm={24} className="date-column">
					<div className={popoverContent}>
						{pipelinesRoutePaths.map(({ path, method }) => (
							<span>
								<b>{method} &nbsp;</b>
								<code key={path}>{path}</code>
								<br />
							</span>
						))}
					</div>
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
						<ClonePipeline pipeline={pipeline} buttonSize={actionButtonSize} />
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
				<Tooltip title={getCreatedUpdatedStats().title}>
					{getCreatedUpdatedStats().difftime}
				</Tooltip>
				<Alert
					className="usage-alert"
					type="info"
					showIcon
					message={
						usageStats?.count > 0
							? `Used ${usageStats?.count} times in last ${30} days`
							: 'Not used in the last 30 days'
					}
				/>
				<Button
					type="link"
					onClick={() => {
						history.push(`/cluster/pipelines/${pipeline.id}/logs`);
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
	showEdit: true,
	showExport: false,
	history: {},
};

PipelineCard.propTypes = {
	pipeline: PropTypes.object,
	removePipeline: PropTypes.func.isRequired,
	togglePipeline: PropTypes.func.isRequired,
	showEdit: PropTypes.bool,
	showExport: PropTypes.bool,
	history: PropTypes.object,
	pipelineScripts: PropTypes.object,
	usageStats: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => {
	const usageStats =
		get(state, '$getPipelinesUsageStats.results')?.pipelines?.find(
			(item) => item.key === props.pipeline.id,
		) ?? null;
	return {
		usageStats,
		pipelineScripts: get(state, '$getAppPipelines.scriptResults')?.[props.pipeline.id],
	};
};

const mapDispatchToProps = (dispatch) => ({
	removePipeline: (id) => dispatch(deletePipeline(id)),
	togglePipeline: (pipelineId, versionId, payload) =>
		dispatch(togglePipelineStatus(pipelineId, versionId, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PipelineCard);
