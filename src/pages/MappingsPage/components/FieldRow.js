import React from 'react';
import get from 'lodash/get';
import { Button, Row, Col, Icon, Popover, Input } from 'antd';
import PropTypes from 'prop-types';
import UsecaseDropdown from './UsecaseDropdown';
import TypeDropdown from './TypeDropdown';
import { fieldRow } from './styles';
import MappingsTypeIcon from './MappingsTypeIcon';
import { VIEWS } from '../../../constants/props';

const FieldRow = ({
	path,
	field,
	usecase,
	type,
	mapping,
	renderColumn,
	onDelete,
	setMapping,
	view,
	isFieldNameEditable,
	onFieldNameChange,
}) => {
	const [fieldName, setFieldName] = React.useState(path);
	return (
		<Row type="flex" justify="space-between" className={fieldRow}>
			<Col>
				<div>
					<Popover content={<pre>{JSON.stringify(mapping, null, 2)}</pre>}>
						<div className="mappings-icon">
							<MappingsTypeIcon type={type} />
						</div>
					</Popover>
					{isFieldNameEditable ? (
						<Input
							defaultValue={path}
							onChange={(e) => {
								const val = get(e, 'target.value');
								if (val) {
									setFieldName(val);
								}
							}}
							onBlur={() => onFieldNameChange(path, fieldName)}
							placeholder="field name"
							style={{ width: 200 }}
						/>
					) : (
						field
					)}
					<Button
						className="delete-btn"
						type="danger"
						size="small"
						onClick={() => onDelete(path)}
					>
						<Icon type="delete" />{' '}
						{view === VIEWS.SCHEMA ? 'Remove field' : `Remove from ${view}`}
					</Button>
				</div>
			</Col>
			<Col>
				<Row gutter={16}>
					{view === VIEWS.SCHEMA && (
						<Col xs={type === 'text' ? 12 : 0}>
							<UsecaseDropdown
								value={usecase}
								type={type}
								onUsecaseChange={setMapping}
								path={path}
							/>
						</Col>
					)}
					{view === VIEWS.SCHEMA && (
						<Col xs={type === 'text' ? 12 : 24}>
							<TypeDropdown
								value={type}
								usecase={usecase}
								onTypeChange={setMapping}
								path={path}
							/>
						</Col>
					)}
					{renderColumn ? (
						<div style={{ paddingRight: 15 }}>
							{renderColumn({
								path,
								mapping,
							})}
						</div>
					) : null}
				</Row>
			</Col>
		</Row>
	);
};

FieldRow.defaultProps = {
	mapping: {},
	// Search & Aggs Settings specific Props
	renderColumn: null,
	view: VIEWS.SCHEMA,
	isFieldNameEditable: false,
	onFieldNameChange: () => {},
};

FieldRow.propTypes = {
	field: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
	usecase: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	mapping: PropTypes.object,
	// Search & Aggs Settings specific Props
	renderColumn: PropTypes.func,
	view: PropTypes.string,
	// Actions
	onDelete: PropTypes.func.isRequired,
	setMapping: PropTypes.func.isRequired,
	isFieldNameEditable: PropTypes.bool,
	onFieldNameChange: PropTypes.func,
};

export default FieldRow;
