import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Row, Col, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { headerRow } from './styles';

const HeaderRow = ({ leftItems, rightItems }) => {
	return (
		<Row type="flex" className={headerRow} justify="space-between">
			<Col>
				{leftItems.map((item) => (
					<p key={item.title}>
						{item.title}
						<Tooltip title={item.info}>
							<InfoCircleOutlined />
						</Tooltip>
					</p>
				))}
			</Col>
			<Col>
				<Row gutter={8}>
					{rightItems.map((item) => (
						<Col key={item.title} xs={12}>
							<p style={{ width: 155 }}>
								{item.title}
								<Tooltip title={item.info}>
									<InfoCircleOutlined />
								</Tooltip>
							</p>
						</Col>
					))}
				</Row>
			</Col>
		</Row>
	);
};

HeaderRow.defaultProps = {
	leftItems: [
		{
			title: 'Field Name',
			info: 'Names of the fields and nested-fields are represented with relative indentation.',
		},
	],

	rightItems: [
		{
			title: 'Use case',
			info: 'We detect the appropriate analyzers and mappings here representing the usecase - search or aggregations.',
		},
		{
			title: 'Data Type',
			info: 'Type of data in the corresponding field.',
		},
	],
};

HeaderRow.propTypes = {
	leftItems: PropTypes.array,
	rightItems: PropTypes.array,
};

export default HeaderRow;
