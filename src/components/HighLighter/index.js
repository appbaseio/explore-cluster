import React from 'react';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';

const highlighter = css`
	width: 6px;
	height: 6px;
	padding: 5px;
	border-radius: 50%;
	position: absolute;
	display: block;
	left: 50%;
	transform: translateX(-50%);
	background: #1890ff;
	bottom: -5px;
	z-index: 10;
	margin: 0 !important;
	@keyframes grow {
		0% {
			transform: scale(0.9);
			box-shadow: 0 0 0 0 #1890ff;
		}

		70% {
			transform: scale(1);
			box-shadow: 0 0 0 5px rgba(0, 0, 0, 0);
		}

		100% {
			transform: scale(0.9);
			box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
		}
	}
	animation: grow 1s infinite ease;
`;

const HighLighter = ({ title }) =>
	title ? (
		<Tooltip placement="bottom" title={title}>
			<span className={highlighter} />
		</Tooltip>
	) : (
		<span className={highlighter} />
	);

HighLighter.defaultProps = {
	title: '',
};

HighLighter.propTypes = {
	title: PropTypes.string,
};

export default HighLighter;
