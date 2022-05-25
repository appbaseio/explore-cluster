import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SandpackLayout, SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';
// eslint-disable-next-line
import FileExplorer from '../FileExplorer/index';
import MonacoEditor from './MonacoEditor';
import '@codesandbox/sandpack-react/dist/index.css';
import '../../styles.css';

const SandPackIntegration = ({ updatedCode, setUpdatedCode, trasformSearchIndex }) => {
	const [highlightLine, setHighlightLine] = useState({
		line: 0,
		lines: [],
	});

	const { sandpack } = useSandpack();
	const { files, activePath } = sandpack;
	const { code } = files[activePath];

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

	return (
		<div>
			<SandpackLayout>
				<FileExplorer setHighlightLine={setHighlightLine} iframeHeight={iframeHeight} />
				<MonacoEditor
					iframeHeight={iframeHeight}
					highlightLine={highlightLine}
					path={activePath}
				/>
				<div className="resizer" id="dragMe" />
				<SandpackPreview viewportSize={{ height: `${iframeHeight}px` }} />
			</SandpackLayout>
		</div>
	);
};

SandPackIntegration.propTypes = {
	updatedCode: PropTypes.object,
	setUpdatedCode: PropTypes.func,
	trasformSearchIndex: PropTypes.func.isRequired,
};

SandPackIntegration.defaultProps = {
	setUpdatedCode: () => {},
	updatedCode: {},
};

export default SandPackIntegration;
