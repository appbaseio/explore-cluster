import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { editorContainer } from './styles';

const Editor = ({ logs, errMsg, scrollType, setScrollType, deploymentStatus }) => {
	const logsEndRef = useRef(null);

	useEffect(() => {
		const state = deploymentStatus.status || deploymentStatus.state;

		if (state !== 'ERROR' && state !== 'READY') {
			scrollToBottom();
		}
	}, [logs]);

	useEffect(() => {
		if (scrollType === 'down') {
			scrollToBottom();
			setScrollType('');
		}
	}, [scrollType]);

	const scrollToBottom = () => {
		if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
	};

	return (
		<div css={editorContainer}>
			{Array.isArray(logs) ? (
				<>
					{logs.map((log) => {
						let bgClass = '';
						if (log.level === 'WARNING') {
							bgClass = 'bg-warning';
						} else if (
							log.type === 'stderr' ||
							(log.type === 'deployment-state' &&
								log?.payload?.info?.readyState === 'ERROR')
						) {
							bgClass = 'bg-error';
						} else {
							bgClass = '';
						}
						if (!log.created && !log.type && !log.payload === 1) {
							return (
								<div className={`log-line ${bgClass}`}>
									<div className="log-component">No logs found...!!!</div>
								</div>
							);
						}
						if (Object.keys(log).length)
							return (
								<div className={`log-line ${bgClass}`}>
									<div className="log-component width">{log.type}&nbsp;</div>
									<div className="log-component width">
										{new Date(log.created).toLocaleTimeString()}
										&nbsp;
									</div>
									<div className="log-component">
										{log?.payload?.text || log?.payload?.info?.readyState || ''}
									</div>
								</div>
							);
						return null;
					})}
					<div ref={logsEndRef} />
				</>
			) : (
				<div className="log-line bg-error" style={{ paddingLeft: 15 }}>
					{errMsg}
				</div>
			)}
		</div>
	);
};

Editor.propTypes = {
	logs: PropTypes.array,
	errMsg: PropTypes.string,
	scrollType: PropTypes.string,
	setScrollType: PropTypes.func,
	deploymentStatus: PropTypes.object,
};

Editor.defaultProps = {
	logs: [],
	errMsg: '',
	scrollType: '',
	deploymentStatus: {},
	setScrollType: () => {},
};

export default Editor;
