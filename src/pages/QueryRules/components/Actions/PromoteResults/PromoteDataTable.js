import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Icon, InputNumber, Popover, Table } from 'antd';
import get from 'lodash/get';
import JsonView from '../../../../../components/JsonView';
import { children } from '../../../../../utils/prop-types';

const popoverContent = css`
	overflow-y: auto;
	overflow-x: auto;
	word-wrap: break-word;
	max-width: 300px;
	max-height: 300px;
`;

const responsiveInput = css`
	width: 100%;
	min-width: 6vw;
	@media (max-width: 600px) {
		min-width: 8vw;
	}
`;

const overflow = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

export function PromoteDataTable({ positionRender, dataRender, dataSource, actionRender }) {
	return (
		<Table
			rowKey={(record) => get(record, 'doc._id')}
			style={{ background: '#fff', maxHeight: 400, overflowY: 'scroll' }}
			columns={[
				{
					title: 'Position',
					dataIndex: 'position',
					render: positionRender,
					width: 100,
				},
				{
					title: (
						<Popover
							content={
								<div css={popoverContent}>
									Clicking on {`{...}`} displays the JSON data.
								</div>
							}
							trigger="click"
						>
							<span
								css={{
									cursor: 'pointer',
									margin: '0 7px',
								}}
							>
								{` {...} `} id
							</span>
						</Popover>
					),
					render: dataRender,
				},
				{
					title: 'Action',
					render: actionRender,
				},
			]}
			dataSource={dataSource}
			pagination={false}
		/>
	);
}

PromoteDataTable.propTypes = {
	positionRender: children.isRequired,
	dataRender: children.isRequired,
	actionRender: children.isRequired,
	dataSource: PropTypes.array,
};

PromoteDataTable.defaultProps = {
	dataSource: [],
};

export function PromotePosition({ value, onChange }) {
	return (
		<InputNumber
			className={responsiveInput}
			value={Number(value)}
			onChange={onChange}
			min={1}
		/>
	);
}

PromotePosition.propTypes = {
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	onChange: PropTypes.func.isRequired,
};

export function PromoteJSONView({ record }) {
	return (
		<>
			<Popover
				content={
					<div css={popoverContent}>
						<JsonView json={record.doc} />
					</div>
				}
				trigger="click"
			>
				<div
					css={{
						cursor: 'pointer',
						margin: '0 7px',
						maxWidth: '75%',
						...overflow,
					}}
				>
					{` {...} `}
					{get(record, 'doc._id')}
				</div>
			</Popover>
		</>
	);
}

PromoteJSONView.propTypes = {
	record: PropTypes.object,
};

PromoteJSONView.defaultProps = {
	record: {},
};

export function PromoteActions({ onClick }) {
	return (
		<Icon
			style={{
				color: '#ff4d4f',
				cursor: 'pointer',
			}}
			type="delete"
			onClick={onClick}
		/>
	);
}

PromoteActions.propTypes = {
	onClick: PropTypes.func.isRequired,
};
