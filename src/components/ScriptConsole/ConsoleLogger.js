import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Icon } from 'antd';
import { isJson } from './utils';
import Flex from '../../batteries/components/shared/Flex';
import RenderTree from './components/RenderTree';
import RenderTextItem from './components/RenderTextItem';

const consoleLoggerCss = css`
	background: rgb(21, 21, 21);
	height: 100%;
	overflow-y: scroll;
	width: 101%;
	.log-item {
		width: 100%;
		padding: 6px 1.5rem 10px 10px;
		border-bottom: 1px solid rgba(128, 128, 128, 0.35);
		font-family: Menlo, monospace;
		white-space: pre-wrap;

		display: flex;
		align-items: flex-start;

		* {
			font-size: 13px;
			color: rgb(213, 213, 213);
			line-height: 1.1;
			margin: 0;
		}
		span#log-line-indicator {
			margin-right: 10px;
			transform: rotate(180deg);
			font-size: 12px;
			svg {
				position: relative;
				top: 4px;
			}
		}
	}

	.console-filter {
		width: 100%;
		position: relative;
		/* right: 0px; */
		padding: 8px 1rem;
		z-index: 1;
		border-bottom: 1px solid rgb(104 75 75 / 35%);
		margin-bottom: 2px;
		input {
			height: 2rem;
			background: rgb(52, 52, 52);
			color: white;
			width: 100%;
			padding-left: 34px;
			border: none;
		}
		i.anticon-search {
			color: white;
			position: absolute;
			left: 21px;
			top: 50%;
			transform: translateY(-50%);
			font-size: 21px;
		}
	}

	#json-item {
		ul:first-child {
			padding-left: 4px;
		}
	}

	#console-placeholder {
		color: white;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80%;
		text-align: center;
		font-weight: 400 !important;
	}
`;

const ArrowNoTailSvg = () => (
	<svg
		viewBox="64 64 896 896"
		focusable="false"
		data-icon="left"
		width="1em"
		height="1em"
		fill="currentColor"
		aria-hidden="true"
	>
		<path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 0 0 0 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z" />
	</svg>
);

const ConsoleLogger = ({ consoleArray }) => {
	const [filterValue, setFilterValue] = useState('');

	const renderConsoleLine = (item) => {
		if (isJson(item)) {
			return (
				<div id="json-item">
					<RenderTree item={JSON.parse(item)} />
				</div>
			);
		}
		return <RenderTextItem text={item} />;
	};

	const renderConsoleItems = () => {
		return consoleArray
			.filter((consoleItem) => consoleItem.toLowerCase().includes(filterValue.toLowerCase()))
			.map((consoleItem) => (
				<div key={(Math.random() + 1).toString(36).substring(7)} className="log-item">
					<span id="log-line-indicator">
						<ArrowNoTailSvg />
					</span>{' '}
					{renderConsoleLine(consoleItem)}
				</div>
			));
	};

	const handleFilterValueChange = (e) => {
		setFilterValue(e.target.value);
	};

	return (
		<Flex
			css={consoleLoggerCss}
			flexDirection="column"
			alignItems="flex-start"
			justifyContent="flex-start"
		>
			{consoleArray.length === 0 ? (
				<h2 id="console-placeholder">
					Any console.log(..) messages will show up here once you run the request
				</h2>
			) : (
				<>
					<div className="console-filter">
						<input
							name="console-filter-input"
							value={filterValue}
							onChange={handleFilterValueChange}
							placeholder="Search for logs..."
						/>
						<Icon type="search" style={{ color: 'white' }} />
					</div>
					{renderConsoleItems()}
				</>
			)}
		</Flex>
	);
};

ConsoleLogger.defaultProps = {
	consoleArray: [],
};

ConsoleLogger.propTypes = {
	consoleArray: PropTypes.array,
};

export default ConsoleLogger;
