import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import Text from 'antd/lib/typography/Text';

const renderTextItemCss = css`
	display: flex;
	align-items: flex-start;
	width: 100%;
	.ellipsis-toggle-arrow {
		cursor: pointer !important;
		transform: rotate(0deg) !important;
		transition: all 0.1s ease-in !important;
		position: relative;
		top: -1px;
		margin-right: 4px !important;
		&.expanded {
			transform: rotate(90deg) !important;
		}
	}

	span:last-child {
		white-space: nowrap;
	}
`;

export default function RenderTextItem({ text }) {
	const [ellipsis, setEllipsis] = useState(false);
	const showExpandArrow = useRef(false);
	const textId = new Date().getTime() + Math.random();
	useEffect(() => {
		const textElement = document.getElementById(textId);
		if (textElement.scrollWidth > textElement.offsetWidth) {
			setEllipsis(true);
			showExpandArrow.current = true;
		}
	}, []);

	return (
		<div css={renderTextItemCss} id="text-item">
			{showExpandArrow.current && (
				<span
					className={`ellipsis-toggle-arrow ${!ellipsis ? 'expanded' : ''}`}
					onClick={() => setEllipsis(!ellipsis)}
				>
					▶
				</span>
			)}
			<Text
				id={textId}
				style={{
					maxWidth: '85%',
					...(showExpandArrow.current && {
						whiteSpace: ellipsis ? 'nowrap' : 'pre-wrap',
					}),
				}}
				ellipsis={ellipsis}
				title={text}
			>
				{text}
			</Text>
		</div>
	);
}

RenderTextItem.propTypes = {
	text: PropTypes.string.isRequired,
};
