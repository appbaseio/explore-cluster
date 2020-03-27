import { css } from 'emotion';
import { Icon, InputNumber, Popover, Table } from 'antd';
import React from 'react';
import { get } from 'lodash';
import JsonView from '../../../../../components/JsonView';

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
			rowKey={record => get(record, 'doc._id')}
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
