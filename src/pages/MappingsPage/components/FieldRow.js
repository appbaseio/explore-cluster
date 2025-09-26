import React from 'react';
import get from 'lodash/get';
import {
	CopyOutlined,
	DeleteOutlined,
	MinusOutlined,
	PlusOutlined,
	CodeOutlined,
} from '@ant-design/icons';
import { Button, Row, Col, Popover, Input, Modal, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import UsecaseDropdown from './UsecaseDropdown';
import TypeDropdown from './TypeDropdown';
import { fieldRow } from './styles';
import MappingsTypeIcon from './MappingsTypeIcon';
import { VIEWS } from '../../../constants/props';
import { resolveTopFieldPath, updateObjectNestedProperty } from '../../../utils/mappings';

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
	showAdvanceOption,
	isAdvanceOption,
	onAdvanceStateChange,
	triggerCopyField,
	mappings,
	updateState,
}) => {
	const [fieldName, setFieldName] = React.useState(path);
	const [showFieldJson, setShowFieldJson] = React.useState(false);
	const [fieldJson, setFieldJson] = React.useState(JSON.stringify(mapping || {}, null, 2));
	const [isJsonValid, setIsJsonValid] = React.useState(true);

	const openJsonEditor = () => {
		setFieldJson(JSON.stringify(mapping || {}, null, 2));
		setIsJsonValid(true);
		setShowFieldJson(true);
	};

	const handleSaveJson = () => {
		let parsed;
		try {
			parsed = JSON.parse(fieldJson);
		} catch (e) {
			setIsJsonValid(false);
			return;
		}
		const TOP_FIELD = resolveTopFieldPath(mappings) || 'properties';
		const currentProps = get(mappings, TOP_FIELD) || {};
		const updatedProps = updateObjectNestedProperty({
			obj: currentProps,
			value: parsed,
			fields: path.split('.'),
		});

		let updatedMappings;
		if (TOP_FIELD === '_doc.properties') {
			updatedMappings = { _doc: { properties: updatedProps } };
		} else if (TOP_FIELD === 'mappings.properties') {
			updatedMappings = { mappings: { properties: updatedProps } };
		} else {
			updatedMappings = { properties: updatedProps };
		}

		updateState({ mappings: updatedMappings, forceHasMappingsChanged: true });
		setShowFieldJson(false);
	};

	return (
		<>
			<Row type="flex" justify="space-between" className={fieldRow}>
				<Col>
					<div data-cy={`field-name-${field}`}>
						<Popover
							content={
								<pre data-cy={`${field}-popover-content`}>
									{JSON.stringify(mapping, null, 2)}
								</pre>
							}
						>
							<div className="mappings-icon" data-cy={`${field}-popover-icon`}>
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
								style={{ width: 150 }}
							/>
						) : (
							field
						)}
						{showAdvanceOption && (
							<Button
								className="advance-btn"
								type="primary"
								size="small"
								onClick={() => onAdvanceStateChange(path, !isAdvanceOption)}
							>
								{isAdvanceOption ? <MinusOutlined /> : <PlusOutlined />}
								Advanced settings
							</Button>
						)}
						{view === VIEWS.SCHEMA && (
							<Button
								className="copy-field-trigger-btn"
								type="primary"
								size="small"
								onClick={triggerCopyField}
							>
								<CopyOutlined data-cy={`copy-field-${field}`} />
								Copy Field
							</Button>
						)}
						{view === VIEWS.SCHEMA && (
							<Tooltip title="Advanced: Edit field JSON">
								<Button
									className="copy-field-trigger-btn"
									size="small"
									onClick={openJsonEditor}
									data-cy={`json-field-${field}`}
									style={{ marginLeft: 8 }}
								>
									<CodeOutlined /> JSON
								</Button>
							</Tooltip>
						)}
						<Button
							className="delete-btn"
							danger
							size="small"
							onClick={() => onDelete(path)}
						>
							<DeleteOutlined data-cy={`remove-field-${field}`} />{' '}
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
							<Col xs={type === 'text' ? 12 : 24} data-cy={`data-type-${field}`}>
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
			<Modal
				title="Edit field JSON"
				open={showFieldJson}
				width={800}
				onCancel={() => setShowFieldJson(false)}
				footer={
					<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
						<Button onClick={() => setShowFieldJson(false)}>Cancel</Button>
						<Button type="primary" onClick={handleSaveJson} disabled={!isJsonValid}>
							Update Field Mapping
						</Button>
					</div>
				}
			>
				<Input.TextArea
					autoSize={{ minRows: 14 }}
					value={fieldJson}
					onChange={(e) => {
						const val = e.target.value;
						let valid = true;
						try {
							JSON.parse(val);
						} catch (_) {
							valid = false;
						}
						setFieldJson(val);
						setIsJsonValid(valid);
					}}
					style={{ borderColor: isJsonValid ? undefined : '#ff4d4f' }}
				/>
			</Modal>
		</>
	);
};

FieldRow.defaultProps = {
	mapping: {},
	// Search & Aggs Settings specific Props
	renderColumn: null,
	view: VIEWS.SCHEMA,
	isFieldNameEditable: false,
	onFieldNameChange: () => {},
	showAdvanceOption: false,
	isAdvanceOption: false,
	onAdvanceStateChange: () => {},
	triggerCopyField: () => {},
	// JSON editor integration
	mappings: {},
	updateState: () => {},
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
	showAdvanceOption: PropTypes.bool,
	isAdvanceOption: PropTypes.bool,
	onAdvanceStateChange: PropTypes.func,
	triggerCopyField: PropTypes.func,
	// JSON editor integration
	mappings: PropTypes.object,
	updateState: PropTypes.func,
};

export default FieldRow;
