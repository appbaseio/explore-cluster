import React from 'react';
import { Row, Col, Tooltip, Icon } from 'antd';
import { headerRow } from './styles';

const HeaderRow = () => {
	return (
		<Row type="flex" className={headerRow} justify="space-between">
			<Col>
				<p>
					Field Name
					<Tooltip title="Names of the fields and nested-fields are represented with relative indentation.">
						<Icon type="info-circle" />
					</Tooltip>
				</p>
			</Col>
			<Col>
				<Row gutter={8}>
					<Col xs={12}>
						<p style={{ width: 155 }}>
							Use case
							<Tooltip title="We detect the appropriate analyzers and mappings here representing the usecase - search or aggregations.">
								<Icon type="info-circle" />
							</Tooltip>
						</p>
					</Col>
					<Col xs={12}>
						<p style={{ width: 155 }}>
							Data Type
							<Tooltip title="Type of data in the corresponding field.">
								<Icon type="info-circle" />
							</Tooltip>
						</p>
					</Col>
				</Row>
			</Col>
		</Row>
	);
};

export default HeaderRow;
