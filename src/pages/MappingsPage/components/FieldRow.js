import React from 'react';
import { Button, Row, Col, Icon, Popover } from 'antd';
import PropTypes from 'prop-types';
import UsecaseDropdown from './UsecaseDropdown';
import TypeDropdown from './TypeDropdown';
import { fieldRow } from './styles';
import MappingsTypeIcon from './MappingsTypeIcon';

const FieldRow = ({ path, field, usecase, type, mapping, onDelete, setMapping }) => {
	return (
		<Row type="flex" justify="space-between" className={fieldRow}>
			<Col>
				<p>
					<Popover content={<pre>{JSON.stringify(mapping, null, 2)}</pre>}>
						<div className="mappings-icon">
							<MappingsTypeIcon type={type} />
						</div>
					</Popover>
					{field}
					<Button
						className="delete-btn"
						type="danger"
						size="small"
						onClick={() => onDelete(path)}
					>
						<Icon type="delete" /> Delete
					</Button>
				</p>
			</Col>
			<Col>
				<Row gutter={16}>
					<Col xs={type === 'text' ? 12 : 0}>
						<UsecaseDropdown
							value={usecase}
							type={type}
							onUsecaseChange={setMapping}
							path={path}
						/>
					</Col>
					<Col xs={type === 'text' ? 12 : 24}>
						<TypeDropdown
							value={type}
							usecase={usecase}
							onTypeChange={setMapping}
							path={path}
						/>
					</Col>
				</Row>
			</Col>
		</Row>
	);
};

FieldRow.defaultProps = {
	mapping: {},
};

FieldRow.propTypes = {
	field: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
	usecase: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	onDelete: PropTypes.func.isRequired,
	setMapping: PropTypes.func.isRequired,
	mapping: PropTypes.object,
};

export default FieldRow;
