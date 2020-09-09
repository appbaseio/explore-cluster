import React from 'react';
import { Button, Row, Col, Icon, Popover } from 'antd';
import PropTypes from 'prop-types';
import UsecaseDropdown from './UsecaseDropdown';
import TypeDropdown from './TypeDropdown';
import { fieldRow } from './styles';
import MappingsTypeIcon from './MappingsTypeIcon';
import conversionMap from './utils/conversionMap';

const ALLOWED_AGGS_MAPPING = Object.keys(conversionMap);

const FieldRow = ({
	path,
	field,
	usecase,
	type,
	mapping,
	hideAggsFields,
	hideSearchFields,
	hideTypeColumn,
	renderColumn,
	onDelete,
	setMapping,
}) => {
	if (hideAggsFields && (usecase === 'none' || usecase === 'aggs' || type !== 'text')) {
		return null;
	}

	if (hideSearchFields && usecase === 'search') {
		return null;
	}

	if (hideSearchFields && !ALLOWED_AGGS_MAPPING.includes(type)) {
		/*
			hideSearchFields denotes that we only want to display aggs mappings and we
			dont want aggs to have unsupported type like rank_feature, rank_features, etc.
		*/
		return null;
	}

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
					{hideTypeColumn ? null : (
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
						<Col xs={12}>
							{renderColumn({
								path,
								mapping,
							})}
						</Col>
					) : null}
				</Row>
			</Col>
		</Row>
	);
};

FieldRow.defaultProps = {
	mapping: {},
	// Search & Aggs Settings specific Props
	hideSearchFields: false,
	hideAggsFields: false,
	hideTypeColumn: false,
	renderColumn: null,
};

FieldRow.propTypes = {
	field: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
	usecase: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	mapping: PropTypes.object,
	// Search & Aggs Settings specific Props
	hideSearchFields: PropTypes.bool,
	hideAggsFields: PropTypes.bool,
	hideTypeColumn: PropTypes.bool,
	renderColumn: PropTypes.func,
	// Actions
	onDelete: PropTypes.func.isRequired,
	setMapping: PropTypes.func.isRequired,
};

export default FieldRow;
