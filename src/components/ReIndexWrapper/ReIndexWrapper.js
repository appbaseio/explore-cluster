import React, { useState, useEffect } from 'react';
import { Button, Alert, Row, Col } from 'antd';
import PropTypes from 'prop-types';

import getReIndexingData from '../../utils/reindex';

const ReIndexWrapper = ({ children, appName }) => {
	const [fetchState, setFetchState] = useState({
		loading: true,
		data: null,
		error: null,
	});

	useEffect(() => {
		let isCancelled = false;
		async function getData() {
			try {
				const res = await getReIndexingData(appName);
				if (!isCancelled) {
					setFetchState({
						loading: false,
						error: null,
						data: res,
					});
				}
			} catch (err) {
				if (!isCancelled) {
					setFetchState({
						loading: false,
						error: err,
						data: null,
					});
				}
			}
		}

		if (appName) {
			getData();
		}
		return () => {
			isCancelled = true;
		};
	}, []);

	const refetchData = async () => {
		setFetchState({ ...fetchState, loading: true });
		try {
			const res = await getReIndexingData(appName);
			setFetchState({
				loading: false,
				error: null,
				data: res,
			});
		} catch (err) {
			setFetchState({
				loading: false,
				error: err,
				data: null,
			});
		}
	};

	return (
		<>
			{fetchState.data && (
				<Alert
					showIcon
					type="warning"
					css={{
						position: 'fixed',
						top: 60,
						// TODO when upcoming PR for global review is merged add following
						// collapsed ? 80 : 260
						left: 260,
						right: 0,
						zIndex: 100,
					}}
					message={
						<Row type="flex" justify="space-between" gutter={16} align="middle">
							<Col md={16}>
								{fetchState.loading ? (
									`Fetching information ....`
								) : (
									<span>
										Re-indexing for <b>{appName}</b> is in progress,{' '}
										<b>
											{fetchState.data.currentDocCount}/
											{fetchState.data.originalDocCount}
										</b>{' '}
										documents have been indexed. Once the documents are
										re-indexed, it may take a while for the shards to be
										re-assigned. Changes you make will be saved but won&apos;t
										be deployed till the re-indexing process is completed.
									</span>
								)}
							</Col>
							<Col
								md={6}
								css={{
									display: 'flex',
									justifyContent: 'center',
								}}
							>
								<Button
									size="large"
									type="link"
									onClick={refetchData}
									icon="reload"
								>
									Reload
								</Button>
							</Col>
						</Row>
					}
				/>
			)}
			{children({ ...fetchState, refetch: refetchData })}
		</>
	);
};

ReIndexWrapper.propTypes = {
	appName: PropTypes.string.isRequired,
	children: PropTypes.func.isRequired,
};

export default ReIndexWrapper;
