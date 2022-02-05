import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';

const renderJsonItemCss = css`
	padding-left: 20px;
	li {
	}

	.expand-group-arrow {
		transition: all 0.2s ease-in;
		display: inline-block;
		margin-right: 5px !important;

		&.expanded {
			transform: rotate(90deg);
		}
	}
`;

function RenderRowLi({ keyProp: key, value }) {
	const [expandGroup, setExpandGroup] = useState(false);

	const renderLabel = (keyParam, valueParam) => {
		const label = () => {
			if (typeof valueParam === 'object') {
				if (Array.isArray(valueParam)) {
					return valueParam.length ? `Array(${valueParam.length})` : '[]';
				}

				return Object.keys(valueParam).length ? 'Object' : '{}';
			}
			return valueParam;
		};

		return (
			<span>
				<span>{keyParam} : </span>
				<span style={{ textTransform: 'capitalize' }}>{label()}</span>
			</span>
		);
	};

	let showExpansionSymbol = false;
	if (typeof value === 'object' && Object.keys(value).length) {
		showExpansionSymbol = true;
	}
	return (
		<li key={String(key)}>
			<div>
				{showExpansionSymbol && (
					<span
						className={`expand-group-arrow ${expandGroup ? 'expanded' : ''}`}
						onClick={() => {
							setExpandGroup(!expandGroup);
						}}
					>
						▶
					</span>
				)}
				{renderLabel(key, value)}
			</div>
			{expandGroup && <RenderTree item={value} />}
		</li>
	);
}

RenderRowLi.propTypes = {
	keyProp: PropTypes.string.isRequired,
	value: PropTypes.any.isRequired,
};

export default function RenderTree({ item }) {
	let createTree = false;
	if (typeof item === 'object' && Object.keys(item).length) {
		createTree = true;
	}

	const levelIterables = Object.keys(item);

	return (
		<ul style={{ listStyle: 'none' }} css={renderJsonItemCss}>
			{createTree &&
				levelIterables.map((key) => {
					return <RenderRowLi key={key} keyProp={key} value={item[key]} />;
				})}
		</ul>
	);
}

RenderTree.propTypes = {
	item: PropTypes.any.isRequired,
};
