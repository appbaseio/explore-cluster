import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Icon, Input, Row } from 'antd';
import { css } from 'emotion';
import { commonRowPad } from '../helper';
import { modalHeading } from '../../../pages/HomePage/styles';

const deleteIcon = css`
	color: red;
	margin-top: 9px;
	cursor: pointer;
`;

const EnvTable = ({ dataSource: data, setData }) => {
	const handleAdd = () => {
		const newData = [...data, { key: '', value: '' }];
		setData(newData);
	};
	const handleItemChange = (e, index, field) => {
		const { value } = e.target;

		setData([
			...data.slice(0, index),
			{
				...data[index],
				[field]: value,
			},
			...data.slice(index + 1),
		]);
	};
	const handleDelete = index => {
		setData([...data.slice(0, index), ...data.slice(index + 1)]);
	};
	return (
		<>
			<h3 className={modalHeading} style={{ fontSize: '16px' }}>
				Env Variables
			</h3>
			{data.map((dataItem, index) => (
				<Row className={commonRowPad} gutter={15} key={index}>
					<Col span={11}>
						<Input
							value={dataItem.key}
							placeholder="Key"
							onChange={e => handleItemChange(e, index, 'key')}
						/>
					</Col>
					<Col span={11}>
						<Input
							value={dataItem.value}
							placeholder="Value"
							onChange={e => handleItemChange(e, index, 'value')}
						/>
					</Col>
					{data.length > 1 && (
						<Icon
							onClick={() => handleDelete(index)}
							className={deleteIcon}
							type="minus-circle"
						/>
					)}
				</Row>
			))}
			<Row>
				<Button onClick={handleAdd}>Add</Button>
			</Row>
		</>
	);
};

EnvTable.propTypes = {
	dataSource: PropTypes.array,
};

EnvTable.defaultProps = {
	dataSource: [],
};

export default EnvTable;
