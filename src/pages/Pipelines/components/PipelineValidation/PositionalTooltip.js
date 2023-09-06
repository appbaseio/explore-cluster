import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import xss from 'xss';
import styled from 'react-emotion';
import { bool, number, shape, string } from 'prop-types';

const FONT_SIZE = 14;

const TooltipContainer = styled.div`
	position: fixed;
	background-color: white;
	color: black;
	padding: 5px;
	font-size: ${FONT_SIZE}px;
	z-index: 9999;
	pointer-events: auto;
	display: ${(props) => (props.visible ? 'block' : 'none')};
	top: ${(props) => props.position.y}px;
	left: ${(props) => props.position.x - props.width * 5 - 2 * 10}px;
	pre {
		white-space: nowrap;
	}
`;

export const PositionalTooltip = ({ content, visible, position }) => {
	return (
		<TooltipContainer
			width={content ? content.trim().length : 0}
			visible={visible}
			position={position}
		>
			<pre
				dangerouslySetInnerHTML={{
					__html: xss(content),
				}}
			/>
		</TooltipContainer>
	);
};

PositionalTooltip.propTypes = {
	content: string.isRequired,
	visible: bool.isRequired,
	position: shape({ x: number, y: number }).isRequired,
};
