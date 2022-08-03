import React, { useEffect } from 'react';

const Dragger = () => {
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
		const mouseDownHandler = (e) => {
			// Get the current mouse position
			x = e.clientX;
			y = e.clientY;
			leftWidth = leftSide.getBoundingClientRect().width;

			// Attach the listeners to `document`
			document.addEventListener('mousemove', mouseMoveHandler);
			document.addEventListener('mouseup', mouseUpHandler);
		};

		const mouseMoveHandler = (e) => {
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

		const mouseUpHandler = () => {
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

	return <div className="resizer" id="dragMe" />;
};

export default Dragger;
