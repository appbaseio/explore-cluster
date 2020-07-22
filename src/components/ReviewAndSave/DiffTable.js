import React from 'react';
import PropTypes from 'prop-types';
import { Col, Icon, Row, Table } from 'antd';
import { get, keys } from 'lodash';
import settingsMap from './helper';

function DiffTable({ object, parseDiff, renderField }) {
	return (
		<Table
			rowKey="setting"
			pagination={false}
			columns={[
				{
					title: 'Setting',
					dataIndex: 'setting',
					render: (text) => (
						<>
							<div style={{ fontSize: 16, fontWeight: 600 }}>
								{get(settingsMap, [text, 'title'], text)}
							</div>
							<div>{get(settingsMap, [text, 'description'], null)}</div>
						</>
					),
					width: 500,
				},
				{
					title: 'Value',
					dataIndex: 'value',
					align: 'center',
					render: (text, record) => {
						const { value } = record;
						return (
							<Row gutter={22}>
								<Col span={11}>
									{renderField
										? renderField({
												value: get(value, 'old'),
												type: 'old',
												record,
										  })
										: JSON.stringify(get(value, 'old'), null, 2)}
								</Col>
								<Col span={2}>
									<Icon type="arrow-right" />
								</Col>
								<Col span={11}>
									{renderField
										? renderField({
												field: get(value, 'new'),
												type: 'new',
												record,
										  })
										: JSON.stringify(get(value, 'new'), null, 2)}
								</Col>
							</Row>
						);
					},
				},
			]}
			dataSource={keys(object).map(parseDiff)}
		/>
	);
}

DiffTable.propTypes = {
	object: PropTypes.object,
	parseDiff: PropTypes.func,
	renderField: PropTypes.func,
};

DiffTable.defaultProps = {
	object: {},
	parseDiff: () => {},
	renderField: null,
};

export default DiffTable;
