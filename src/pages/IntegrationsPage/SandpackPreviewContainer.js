import React, { useEffect, useRef } from 'react';
import {
	SandpackThemeProvider,
	SandpackPreview,
	useLoadingOverlayState,
	SandpackConsole,
} from '@codesandbox/sandpack-react';
import { CodeOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import ReactivesearchLoader from '../../components/ReactivesearchLoader/ReactivesearchLoader';

const SandpackPreviewContainer = () => {
	const iframeHeight = window.innerHeight - 60;
	const loading = useLoadingOverlayState();
	const logsEndRef = useRef(null);
	const logsStartRef = useRef(null);

	useEffect(() => {
		renderScrollToTop();
	}, []);

	const renderScrollToTop = () => {
		const consoleHandler = document.getElementsByClassName('sp-console');
		if (consoleHandler && consoleHandler.length) {
			const consoleEle = consoleHandler[0];
			const el = document.createElement('button');
			el.className = 'sp-button sp-icon-standalone arrow-up';
			el.innerHTML = `<svg viewBox="64 64 896 896" focusable="false" data-icon="arrow-up" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M868 545.5L536.1 163a31.96 31.96 0 00-48.3 0L156 545.5a7.97 7.97 0 006 13.2h81c4.6 0 9-2 12.1-5.5L474 300.9V864c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V300.9l218.9 252.3c3 3.5 7.4 5.5 12.1 5.5h81c6.8 0 10.5-8 6-13.2z"></path></svg>`;
			el.addEventListener('click', () => scrollToTop());
			consoleEle.appendChild(el);
		}
	};

	const scrollToTop = () => {
		if (logsStartRef.current) logsStartRef.current.scrollIntoView({ behavior: 'smooth' });
	};

	const scrollToBottom = () => {
		if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
	};

	return (
		<>
			<div ref={logsStartRef} />
			<SandpackThemeProvider>
				<SandpackPreview
					style={{ height: `${iframeHeight}px` }}
					showRefreshButton={false}
					showOpenInCodeSandbox={false}
					actionsChildren={
						<Tooltip title="View Console">
							<Button
								shape="circle"
								icon={<CodeOutlined />}
								size="small"
								className="sp-button sp-icon-standalone"
								style={{ marginBottom: 5 }}
								onClick={scrollToBottom}
							/>
						</Tooltip>
					}
				/>
				<SandpackConsole />
				{loading === 'LOADING' ? <ReactivesearchLoader /> : null}
			</SandpackThemeProvider>
			<div ref={logsEndRef} />
		</>
	);
};

export default SandpackPreviewContainer;
