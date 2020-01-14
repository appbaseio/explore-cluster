import React, { useEffect, useState } from 'react';
import { Icon, notification, Skeleton } from 'antd';
import { fetchLogs } from '../../utils';

function Logs({ name, style }) {
	const [logs, setLogs] = useState('');
	const [loading, setLoading] = useState(false);

	async function logsApi() {
		setLoading(true);
		try {
			const response = await fetchLogs(name);
			setLogs(response);
			setLoading(false);
		} catch (e) {
			setLoading(false);
			notification.error({
				type: 'error',
				message: e,
			});
		}
	}

	useEffect(() => {
		logsApi();
	}, []);

	if (loading) return <Skeleton />;

	return (
		<div
			style={{
				background: '#000000a8',
				color: '#f8fafc',
				padding: 10,
				borderRadius: 3,
				maxHeight: 500,
				overflow: 'auto',
			}}
		>
			<Icon
				onClick={logsApi}
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					cursor: 'pointer',
				}}
				type="reload"
			/>
			<pre style={style}>{logs}</pre>
		</div>
	);
}

export default Logs;
