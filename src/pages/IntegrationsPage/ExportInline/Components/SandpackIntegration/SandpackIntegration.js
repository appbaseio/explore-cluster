import React, { useEffect, useRef, useState } from 'react';
import PropTypes, { string } from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { CodeOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import {
	SandpackConsole,
	SandpackLayout,
	SandpackPreview,
	useSandpack,
} from '@codesandbox/sandpack-react';
// eslint-disable-next-line
import FileExplorer from '../FileExplorer/index';
// eslint-disable-next-line
import MonacoEditor from './MonacoEditor';
import '../../styles.css';
import '../sandpack-css.css';

const SandPackIntegration = ({
	updatedCode,
	setUpdatedCode,
	trasformSearchIndex,
	collapsed,
	setOpenCommitModal,
	uiBuilderPremium,
	tier,
}) => {
	const logsEndRef = useRef(null);
	const logsStartRef = useRef(null);
	const [highlightLine, setHighlightLine] = useState({
		line: 0,
		lines: [],
	});
	const [searchType, setSearchType] = useState('');
	const { sandpack } = useSandpack();
	const { files, activeFile: activePath } = sandpack;
	const { code } = files[activePath] ?? {};

	const iframeHeight = window.innerHeight - 80;

	useEffect(() => {
		// Query the element
		const resizer = document.getElementById('dragMe');
		const leftSide = resizer.previousElementSibling;
		const rightSide = resizer.nextElementSibling;

		// The current position of mouse
		let x = 0;
		let y = 0;

		// Width of left side
		let leftWidth = 0;

		// Handle the mousedown event
		// that's triggered when user drags the resizer
		const mouseDownHandler = function (e) {
			// Get the current mouse position
			x = e.clientX;
			y = e.clientY;
			leftWidth = leftSide.getBoundingClientRect().width;

			// Attach the listeners to `document`
			document.addEventListener('mousemove', mouseMoveHandler);
			document.addEventListener('mouseup', mouseUpHandler);
		};

		const mouseMoveHandler = function (e) {
			// How far the mouse has been moved
			const dx = e.clientX - x;
			const dy = e.clientY - y; // eslint-disable-line

			const newLeftWidth =
				((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
			leftSide.style.maxWidth = `${newLeftWidth}%`;
			rightSide.style.maxWidth = `${100 - newLeftWidth}%`;

			resizer.style.cursor = 'col-resize';
			document.body.style.cursor = 'col-resize';

			leftSide.style.userSelect = 'none';
			leftSide.style.pointerEvents = 'none';

			rightSide.style.userSelect = 'none';
			rightSide.style.pointerEvents = 'none';
		};

		const mouseUpHandler = function () {
			resizer.style.removeProperty('cursor');
			document.body.style.removeProperty('cursor');

			leftSide.style.removeProperty('user-select');
			leftSide.style.removeProperty('pointer-events');

			rightSide.style.removeProperty('user-select');
			rightSide.style.removeProperty('pointer-events');

			// Remove the handlers of `mousemove` and `mouseup`
			document.removeEventListener('mousemove', mouseMoveHandler);
			document.removeEventListener('mouseup', mouseUpHandler);
		};

		// Attach the handler
		resizer.addEventListener('mousedown', mouseDownHandler);

		renderScrollToTop();

		return () => {
			resizer.removeEventListener('mousedown', mouseDownHandler);
		};
	}, []);

	useEffect(() => {
		if (Object.keys(updatedCode).length && updatedCode[activePath] !== code) {
			const newCode = {
				...updatedCode,
				[activePath]: code,
			};

			setUpdatedCode(newCode);
			trasformSearchIndex(newCode);
		}
	}, [code]);

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
		<div>
			<SandpackLayout>
				<div ref={logsStartRef} />
				<FileExplorer
					setHighlightLine={setHighlightLine}
					iframeHeight={iframeHeight}
					collapsed={collapsed}
					searchType={searchType}
					setSearchType={setSearchType}
				/>
				<MonacoEditor
					iframeHeight={iframeHeight}
					highlightLine={highlightLine}
					path={activePath}
					setOpenCommitModal={setOpenCommitModal}
					setSearchType={setSearchType}
				/>
				<div className="resizer" id="dragMe" />
				<SandpackPreview
					style={{ height: `${iframeHeight}px` }}
					showOpenInCodeSandbox={
						uiBuilderPremium || tier === 'production' || tier === 'enterprise'
					}
					actionsChildren={
						<Tooltip title="View Console">
							<Button
								shape="circle"
								icon={<CodeOutlined />}
								size="small"
								className="sp-button sp-icon-standalone"
								style={{ padding: 8 }}
								onClick={scrollToBottom}
							/>
						</Tooltip>
					}
				/>
			</SandpackLayout>
			<SandpackConsole />
			<div ref={logsEndRef} />
		</div>
	);
};

SandPackIntegration.propTypes = {
	updatedCode: PropTypes.object,
	setUpdatedCode: PropTypes.func,
	collapsed: PropTypes.bool,
	trasformSearchIndex: PropTypes.func.isRequired,
	setOpenCommitModal: PropTypes.func.isRequired,
	uiBuilderPremium: string.isRequired,
	tier: string.isRequired,
};

SandPackIntegration.defaultProps = {
	setUpdatedCode: () => {},
	updatedCode: {},
	collapsed: false,
};

const mapStateToProps = (state) => ({
	uiBuilderPremium: get(state, '$getAppPlan.results.feature_uibuilder_premium'),
	tier: get(state, '$getAppPlan.results.tier'),
});

export default connect(mapStateToProps, null)(SandPackIntegration);
