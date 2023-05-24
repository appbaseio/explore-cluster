/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-danger */
/* eslint-disable camelcase */
import { Button, Card, List, Modal, Tooltip, Typography } from 'antd';
import React, { useState } from 'react';
import { func, object } from 'prop-types';
import { Remarkable } from 'remarkable';
import { css } from 'emotion';
import { get } from 'lodash';
import { ClockCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import Flex from '../../../batteries/components/shared/Flex';
import ErrorToaster from '../../../batteries/components/shared/ErrorToaster';
import { getTimeDuration } from '../../../batteries/components/analytics/utils';
import SaveAIFAQModal from '../../AIFAQs/components/SaveAIFAQModal';

const { Text } = Typography;

const md = new Remarkable();

md.set({
	html: true,
	breaks: true,
	xhtmlOut: true,
});
const messageHistoryContainer = css`
	margin-top: 1rem;

	.ant-list-item.chat-item.chat-item-user {
		border-block-end: none;
	}
	/* Chat container */
	.chat-list {
		height: 80vh;
		overflow: auto;
	}

	/* Chat items */
	.chat-item {
		padding: 8px;
		border-radius: 8px;
		display: flex;
	}

	.chat-item-user {
		justify-content: flex-end;
	}

	.chat-item-assistant {
		justify-content: flex-start;
	}

	/* Chat content */
	.chat-content {
		background-color: #f2f2f2;
		border-radius: 8px;
		padding: 8px;
		margin-left: 8px;
		margin-right: 8px;
		max-width: 75%;
		text-align: left;
		font-size: 16px;
		html,
		body,
		div,
		span,
		applet,
		object,
		iframe,
		h1,
		h2,
		h3,
		h4,
		h5,
		h6,
		p,
		blockquote,
		pre,
		a,
		abbr,
		acronym,
		address,
		big,
		cite,
		code,
		del,
		dfn,
		em,
		img,
		ins,
		kbd,
		q,
		s,
		samp,
		small,
		strike,
		strong,
		sub,
		sup,
		tt,
		var,
		b,
		u,
		i,
		center,
		dl,
		dt,
		dd,
		ol,
		ul,
		li,
		fieldset,
		form,
		label,
		legend,
		table,
		caption,
		tbody,
		tfoot,
		thead,
		tr,
		th,
		td,
		article,
		aside,
		canvas,
		details,
		embed,
		figure,
		figcaption,
		footer,
		header,
		hgroup,
		menu,
		nav,
		output,
		ruby,
		section,
		summary,
		time,
		mark,
		audio,
		video {
			margin: 0;
			padding: 0;
			border: 0;
			font-size: 100%;
			font: inherit;
			vertical-align: baseline;
		}
		pre {
			margin: 10px auto;
		}
		table {
			margin: 10px auto;
			border-collapse: collapse;
			border-spacing: 0;
		}
		tr {
			border-bottom: 1px solid #ccc;
		}
		th,
		td {
			text-align: left;
			padding: 4px;
			border: 1px solid;
			border-collapse: collapse;
		}
		pre,
		code {
			padding: 0.6em 0.4em;
		}
		code {
			line-height: normal;
			border-radius: 3px;
			font-size: 85%;
			padding: 0.2em 0.4em;
			margin-top: 5px;
			display: inline-block;
			overflow: auto;
			width: fit-content;
			max-width: 100%;
		}
		ul,
		ol {
			list-style-position: inside;
		}
		overflow-wrap: anywhere;
	}

	.chat-item-user .chat-content {
		background-color: #007aff;
		color: white;
	}

	/* Chat avatars */
	.ant-avatar {
		margin-right: 8px;
	}

	.ant-avatar-icon {
		background-color: #007aff;
		color: white;
	}

	.ant-list-item-meta-title {
		margin-bottom: 0;
	}
`;
const SessionDetailsModal = ({ record, onCancel }) => {
	const [showFAQModal, setShowFAQModal] = useState(false);
	const timeDuration = getTimeDuration(get(record, 'timestamp'));
	const timeTaken =
		timeDuration.time > 0
			? `${timeDuration.time} ${timeDuration.formattedUnit} ago`
			: 'some time ago';
	if (!record) {
		return null;
	}

	const FAQRecord = JSON.parse(
		JSON.stringify({
			question: record.question,
			answer:
				[...(record.messages ?? [])].filter((message) => message.role === 'assistant').pop()
					?.content || undefined,
			model: record.model,
		}),
	);

	return (
		<>
			<Modal
				title={null}
				open={record}
				onCancel={onCancel}
				footer={null}
				width={0.7 * window.innerWidth}
			>
				<ErrorToaster>
					<Flex flexDirection="column" style={{ margin: '1rem 0 10px', gap: '1rem' }}>
						<Flex alignItems="center" justifyContent="space-between">
							<div style={{ maxWidth: '50%' }}>
								<Tooltip
									placement="bottom"
									title={
										<div
											className="chat-content"
											dangerouslySetInnerHTML={{
												__html: md.render(record.question ?? ''),
											}}
										/>
									}
								>
									<Text ellipsis>
										<QuestionCircleOutlined style={{ marginRight: '8px' }} />
										{record.question ?? ''}
									</Text>
								</Tooltip>{' '}
							</div>
							<Flex style={{ gap: '10px', alignItems: 'center' }}>
								<span role="img" aria-label="feedback">
									{typeof record?.useful === 'boolean'
										? record?.useful
											? '👍🏻 Useful'
											: '👎🏻 Not Useful'
										: null}
								</span>
								<span>
									<ClockCircleOutlined />
									&nbsp;
									{timeTaken}
								</span>
							</Flex>
						</Flex>

						<Flex alignItems="center" justifyContent="space-between">
							<span>Model: {record?.model}</span>
							<div style={{ maxWidth: '70%' }}>
								<Tooltip title={record?.reason ?? ''}>
									<Text ellipsis>{record?.reason ?? ''}</Text>
								</Tooltip>{' '}
							</div>
						</Flex>
						<Flex alignItems="center" justifyContent="space-between">
							<span>
								Tokens used:{' '}
								{(record?.input_tokens ?? 0) + (record?.input_tokens ?? 0)} (
								{typeof record?.input_tokens === 'number'
									? `${record?.input_tokens} Input`
									: ''}
								{typeof record?.output_tokens === 'number'
									? `, ${record?.output_tokens} Output`
									: ''}
								)
							</span>
							<Button type="primary" onClick={() => setShowFAQModal(true)}>
								Add as FAQ
							</Button>
						</Flex>
					</Flex>

					<Card className={messageHistoryContainer}>
						<List
							className="chat-list"
							itemLayout="horizontal"
							dataSource={(record?.messages ?? []).filter((_) => _.role !== 'system')}
							renderItem={(message) => (
								<List.Item className={`chat-item chat-item-${message.role}`}>
									{/* {message.role === 'user' && <Avatar icon={<UserOutlined />} />}
									{message.role === 'assistant' && (
										<Avatar icon={<RobotOutlined />} />
									)} */}
									<div
										className="chat-content"
										dangerouslySetInnerHTML={{
											__html: md.render(message.content),
										}}
									/>
								</List.Item>
							)}
						/>
					</Card>
				</ErrorToaster>
			</Modal>
			<SaveAIFAQModal
				visible={!!showFAQModal}
				record={FAQRecord}
				onClose={() => setShowFAQModal(false)}
				onSaveFAQ={() => setShowFAQModal(false)}
			/>
		</>
	);
};

SessionDetailsModal.defaultProps = {
	record: null,
};

SessionDetailsModal.propTypes = { record: object, onCancel: func.isRequired };

export default SessionDetailsModal;
