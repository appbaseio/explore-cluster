import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowDownOutlined, ArrowUpOutlined, CopyOutlined } from '@ant-design/icons';
import { Modal, Card, Skeleton, Tooltip, Button } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import ndjsonStream from 'can-ndjson-stream';
import Editor from './Editor';
import { deployModalStyles, pastVersionsStyles } from './styles';
import '../styles.css';
import { deployStatusMapper, timeDifference } from '../../../utils/index';

const DeployLogsModal = ({ open, handleCancel, deploymentStatus, uiBuilderName, preferenceId }) => {
	const [deployLogs, setDeployLogs] = useState([]);
	const [errMsg, setErrMsg] = useState('');
	const [tmpReader, setReader] = useState(null);
	const [scrollType, setScrollType] = useState('');
	const logsStartRef = useRef(null);

	useEffect(() => {
		return () => {
			if (tmpReader) {
				tmpReader.cancel();
				setReader(null);
			}
		};
	}, []);

	useEffect(() => {
		if (deploymentStatus.uid || deploymentStatus.id) {
			if (tmpReader) {
				tmpReader.cancel();
				setReader(null);
			}
			getLogs();
		}
	}, [deploymentStatus.uid, deploymentStatus.id]);

	const getLogs = () => {
		let results = [];
		const clusterId = getClusterId();
		const url = `https://accapi.appbase.io/uibuilder/deploy/${clusterId}/${preferenceId}/${
			deploymentStatus.id || deploymentStatus.uid
		}/events?follow=1`;
		setDeployLogs([]);

		fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-ndjson',
			},
		}) // make a fetch request to a NDJSON stream service
			.then((response) => {
				return ndjsonStream(response.body); // ndjsonStream parses the response.body
			})
			.then((stream) => {
				const reader = stream.getReader();
				setReader(reader);
				let read;
				reader.read().then(
					(read = (result) => {
						if (result.done) {
							return;
						}

						results = [...results, { ...result.value }];
						setDeployLogs(results);

						reader.read().then(read);
					}),
				);
			})
			.catch((err) => {
				console.log('Error to fetch logs ', err);
				setErrMsg('Error to fetch logs');
			});
	};

	const getClusterId = () => {
		const url = localStorage.getItem('url');

		if (url) {
			const domain = new URL(url).host;
			return domain?.split('-').slice(0, 4).join('-');
		}
		return '';
	};

	const validDomain = (url) => {
		if (!url.includes('http')) return `https://${url}`;
		return url;
	};

	const scrollToTop = () => {
		if (logsStartRef.current) logsStartRef.current.scrollIntoView({ behavior: 'smooth' });
	};

	const status = deploymentStatus.status || deploymentStatus.state;

	return (
		<div css={deployModalStyles}>
			<Modal
				title={<div style={{ fontWeight: 'bold' }}>Deploy Status</div>}
				open={open}
				onOk={() => handleCancel()}
				onCancel={() => handleCancel()}
				footer={null}
				width={1000}
			>
				<div ref={logsStartRef} />
				<Card
					title={
						<div style={{ maxHeight: 200 }} css={pastVersionsStyles}>
							<div className="row-data">
								<div className="label">{uiBuilderName}</div>
								<div>
									<span className="label">Deploy Status: </span>
									{status} {deployStatusMapper[status]}
								</div>
							</div>
							<div className="row-data">
								<div className="max-width overflow">
									<span className="label">Deployment started: </span>
									{timeDifference(
										new Date(),
										new Date(
											deploymentStatus.createdAt ||
												deploymentStatus.buildingAt * 1000,
										),
									)}
								</div>

								<div className="max-width overflow">
									<span className="label">Environment:</span>{' '}
									{deploymentStatus.target}
								</div>
							</div>
							<div className="row-data">
								<div>
									{/* eslint-disable-next-line */}
									{deploymentStatus?.meta?.version_id ? (
										<>
											<span className="label">Version:</span>{' '}
											<Tooltip
												// eslint-disable-next-line
												title={deploymentStatus?.meta?.version_id || 'null'}
											>
												{/* eslint-disable-next-line */}
												{deploymentStatus?.meta?.version_id}
											</Tooltip>
										</>
									) : null}
								</div>

								<div>
									{status === 'READY' ? (
										<div style={{ display: 'flex', alignItems: 'center' }}>
											<span className="label">URL: </span>
											<Tooltip title={deploymentStatus.url}>
												<a
													href={validDomain(deploymentStatus.url)}
													target="_blank"
													rel="noreferrer"
												>
													<div className="max-width overflow clickable-url">
														{deploymentStatus.url}
													</div>
												</a>
											</Tooltip>
											<CopyToClipboard text={deploymentStatus.url}>
												<CopyOutlined className="icon-active" />
											</CopyToClipboard>
										</div>
									) : null}
								</div>
							</div>
							<div className="navigation-buttons-container">
								<Tooltip title="Go to top">
									<Button
										icon={<ArrowUpOutlined />}
										onClick={() => scrollToTop()}
									/>
								</Tooltip>
								<Tooltip title="Go to bottom">
									<Button
										icon={<ArrowDownOutlined />}
										onClick={() => setScrollType('down')}
									/>
								</Tooltip>
							</div>
						</div>
					}
					headStyle={{
						position: 'sticky',
						top: 0,
						background: '#fff',
					}}
				>
					{!deployLogs.length ? (
						<Skeleton active />
					) : (
						<Editor
							logs={deployLogs}
							errMsg={errMsg}
							scrollType={scrollType}
							setScrollType={setScrollType}
							deploymentStatus={deploymentStatus}
						/>
					)}
				</Card>
			</Modal>
		</div>
	);
};

DeployLogsModal.propTypes = {
	open: PropTypes.bool,
	handleCancel: PropTypes.func.isRequired,
	deploymentStatus: PropTypes.object,
	uiBuilderName: PropTypes.string,
	preferenceId: PropTypes.string,
};

DeployLogsModal.defaultProps = {
	open: false,
	deploymentStatus: {},
	uiBuilderName: '',
	preferenceId: '',
};

export default DeployLogsModal;
