import React, { useEffect, useState } from 'react';
import { Icon, notification, Skeleton, Tooltip } from 'antd';
import { fetchLogs } from '../../utils';

function Logs({ name, isOpen, toggleIsOpen }) {
	const [data, setData] = useState({
		isFetching: true,
		logs: [],
	});

	useEffect(() => {
		let isCancelled = false;
		const fetchData = async () => {
			const res = await fetchLogs(name);
			if (!isCancelled) {
				setData({
					isFetching: false,
					logs: res,
				});
			}
		};
		if (isOpen) {
			fetchData();
		}
		return function cleanup() {
			isCancelled = true;
		};
	}, [isOpen]);

	async function logsApi() {
		try {
			setData({
				...data,
				isFetching: true,
			});
			const response = await fetchLogs(name);
			setData({
				...data,
				isFetching: false,
				logs: response,
			});
		} catch (e) {
			setData({
				...data,
				isFetching: true,
			});
			notification.error({
				type: 'error',
				message: e,
			});
		}
	}

	return (
		<>
			<Tooltip title="Function logs">
				<Icon type="ordered-list" style={{ cursor: 'pointer' }} onClick={toggleIsOpen} />
			</Tooltip>
			{isOpen && (
				<div
					style={{
						height: 150,
						overflow: 'auto',
						position: 'absolute',
						bottom: 30,
						left: 80,
						right: 30,
						borderRadius: '3px',
					}}
				>
					<Skeleton loading={data.isFetching} active={data.isFetching}>
						<div
							style={{
								background: '#222222',
								color: '#d6d6d6',
								height: '100%',
								overflow: 'auto',
								position: 'relative',
								marginTop: 10,
								borderRadius: '3px',
							}}
						>
							<div
								style={{
									position: 'sticky',
									display: 'flex',
									justifyContent: 'flex-end',
									alignItems: 'center',
									height: 25,
									top: 0,
									zIndex: 100,
									padding: 5,
									paddingRight: 10,
									background: '#000',
								}}
							>
								<Icon onClick={logsApi} type="reload" />
								<Icon
									onClick={toggleIsOpen}
									type="close"
									style={{ marginLeft: 10 }}
								/>
							</div>
							<div style={{ padding: '5px 20px', zIndex: 90 }}>
								<pre>{data.logs}</pre>
							</div>
						</div>
					</Skeleton>
				</div>
			)}
		</>
	);
}

export default Logs;
