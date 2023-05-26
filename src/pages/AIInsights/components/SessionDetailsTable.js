/* eslint-disable no-param-reassign */
import { RedoOutlined } from '@ant-design/icons';
import { Button, Card, Table, Tooltip, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { get, orderBy } from 'lodash';
import { object } from 'prop-types';
import moment from 'moment';
import Flex from '../../../batteries/components/shared/Flex';
import {
	dateRanges,
	getAISessionDocs,
	getTimeDuration,
} from '../../../batteries/components/analytics/utils';

import SessionDetailsModal from './SessionDetailsModal';

let lastIndex = 0;
const updateIndex = () => {
	lastIndex += 1;
	return lastIndex;
};

const columns = () => [
	{
		title: '#',
		key: 'index',
		render: (text, record, index) => index + 1,
	},
	{
		title: 'Question',
		dataIndex: 'question',
		render: (question) => {
			return <div>{question}</div>;
		},
		key: `question${updateIndex()}`,
	},
	{
		title: 'Feedback',
		dataIndex: 'useful',
		render: (useful) => {
			// eslint-disable-next-line no-nested-ternary
			return <div>{typeof useful === 'boolean' ? (useful ? '✅' : '❌') : '-'}</div>;
		},
		width: '140px',
		key: `useful${updateIndex()}`,
	},
	{
		title: 'Time',
		dataIndex: 'timeTaken',
		width: '100px',
		key: `timeTaken${updateIndex()}`,
		sorter: (a, b) => a.timestamp - b.timestamp,
		sortDirections: ['ascend', 'descend', 'ascend'],
	},
];
const normalizeData = (data) =>
	orderBy(data, ['timestamp'], ['desc']).map((i) => {
		const timeDuration = getTimeDuration(get(i, 'timestamp'));
		const timeTaken =
			timeDuration.time > 0
				? `${timeDuration.time} ${timeDuration.formattedUnit} ago`
				: 'some time ago';

		const id = get(i, 'session_id');
		const question = Array.isArray(i.messages)
			? i.messages.find((t) => t.role === 'user')?.content ?? ''
			: '';
		return {
			id,
			timeTaken,
			useful: i.useful,
			question,
			timestamp: i.timestamp,
		};
	});

const SessionDetailsTable = ({ filters }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState(null);
	// eslint-disable-next-line no-unused-vars
	const [currentPage, setCurrentPage] = useState(1);
	// const [total, setTotal] = useState(1);
	const [modalData, setModalData] = useState(null);

	const getQueryParams = useCallback(() => {
		const paramObject = {};
		let dateRange;
		if (!filters) {
			dateRange = [dateRanges['Last 30 days'].from, dateRanges['Last 30 days'].to];
		} else {
			dateRange = [filters.from, filters.to];
		}
		if (Array.isArray(dateRange) && dateRange.length === 2) {
			paramObject.from_timestamp = moment.unix(new Date(dateRange[0])).format('X');
			paramObject.to_timestamp = moment.unix(new Date(dateRange[1])).format('X');
		}

		return paramObject;
	}, [filters]);
	const handleRecordClick = (record) => {
		setModalData({ ...(data.hits.find((i) => i.session_id === record.id) ?? {}), ...record });
	};

	const onReloadClick = () => {
		// handle reload
		fetchAISessionDocs();
	};
	const renderTable = () => {
		return (
			<Table
				css=".ant-table-row { cursor: pointer }"
				rowKey={(record) => record.id}
				dataSource={normalizeData(data?.hits ?? [])}
				columns={columns()}
				pagination={{
					pageSize: 10,
					...(data?.count ? { total: data?.count } : {}),
					// current: currentPage,
					showSizeChanger: false,
				}}
				scroll={{ x: 700 }}
				onRow={(record) => ({
					onClick: () => handleRecordClick(record),
				})}
				loading={isLoading}
			/>
		);
	};

	const fetchAISessionDocs = async () => {
		try {
			setIsLoading(true);
			const apiData = await getAISessionDocs({
				...getQueryParams(),
				offset: currentPage,
			});
			setData(apiData);
		} catch (error) {
			message.error('There was an error fetching the AI session docs!');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAISessionDocs();
	}, [filters]);

	return (
		<>
			<Card
				title="AI Answer Session Details"
				extra={
					<Flex>
						<Tooltip placement="topLeft" title="Refresh AI Sessions">
							<Button
								style={{ marginLeft: 8 }}
								onClick={onReloadClick}
								icon={<RedoOutlined />}
							/>
						</Tooltip>
					</Flex>
				}
				style={{ marginTop: '1rem' }}
			>
				{renderTable()}
			</Card>
			<SessionDetailsModal
				onCancel={() => {
					setModalData(null);
				}}
				record={modalData}
			/>
		</>
	);
};

SessionDetailsTable.defaultProps = {
	filters: {
		from_timestamp: undefined,
		to_timestamp: undefined,
	},
};

SessionDetailsTable.propTypes = { filters: object };

export default SessionDetailsTable;
