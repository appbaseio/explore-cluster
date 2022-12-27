import React from 'react';
import { Button, Modal, Row, Col, Input, Select, Divider, Alert } from 'antd';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import conversionMap, { DenseVector } from '../../../utils/conversionMap';
import usecases from '../../../utils/usecases';
import { getVersion, isUsingOpenSearch } from '../../../constants/config';
import { capitalizeFirstLetter } from '../../../utils/helper';
import { compareVersion } from '../../../utils';
import { LATEST_COMPATIBLE_VERSION } from './constants';

const { Option } = Select;
const version = parseInt(getVersion()[0], 10);
const types = Object.keys(conversionMap).filter(
	(key) =>
		key !== 'object' &&
		(isUsingOpenSearch() ||
			(version < LATEST_COMPATIBLE_VERSION &&
				(key !== 'rank_features' || key !== 'rank_feature') &&
				key !== DenseVector)),
);

class CopyField extends React.Component {
	constructor(props) {
		super(props);
		const { useAsModal, visible, copiedFieldItem = {} } = props;
		this.state = {
			isVisible: useAsModal ? visible : false,
			fieldUsecase: usecases.none,
			fieldName: '',
			fieldType: copiedFieldItem?.fieldType ?? '',
			fieldNameError: false,
		};
	}

	handleVisible = () => {
		const { useAsModal, onCloseModal } = this.props;

		if (useAsModal) {
			onCloseModal();
		} else {
			this.setState((state) => ({
				isVisible: !state.isVisible,
			}));
		}
	};

	handleInput = (e) => {
		const {
			target: { name, value },
		} = e;
		const { fields } = this.props;

		this.setState({
			[name]: value,
			fieldNameError: fields.includes(value) ? 'Field Already exists' : null,
		});
	};

	handleUsecase = (usecase) => {
		this.setState({
			fieldUsecase: usecase,
		});
	};

	handleType = (type) => {
		this.setState({
			fieldType: type,
		});
	};

	copyField = () => {
		const { onCopyField, copiedFieldItem } = this.props;
		const { fieldName, fieldType, fieldUsecase } = this.state;
		this.handleVisible();

		onCopyField({
			path: fieldName,
			type: fieldType,
			usecase: fieldUsecase,
			script: `ctx._source.${fieldName} = ctx._source['${copiedFieldItem.fieldName}']`,
		});
	};

	render() {
		const { isVisible, fieldName, fieldType, fieldUsecase, fieldNameError } = this.state;
		const { copiedFieldItem, appVersion, useAsModal } = this.props;
		return (
			<React.Fragment>
				{useAsModal ? null : (
					<Button onClick={this.handleVisible} type="primary" data-cy="copy-field-button">
						Copy field
					</Button>
				)}
				{isVisible && (
					<Modal
						title="Copy Field"
						width="100%"
						okText={<span className="copy-field-modal-btn">Copy Field</span>}
						style={{
							maxWidth: '800px',
						}}
						open={isVisible}
						onOk={this.copyField}
						onCancel={this.handleVisible}
						okButtonProps={{
							disabled: fieldNameError || !fieldName.trim(),
						}}
					>
						{compareVersion(appVersion, '7.58.0') === -1 ? (
							<React.Fragment>
								<div
									style={{
										display: 'flex',
										height: '100%',
										width: '100%',
										alignItems: 'center',
										justifyContent: 'center',
										marginBottom: '13px',
									}}
								>
									<Alert
										type="error"
										message="This feature only works from v7.58.0 onwards. Upgrade your cluster"
										showIcon
										style={{
											marginBottom: 10,
											height: 'max-content',
											width: '100%',
										}}
									/>
								</div>
							</React.Fragment>
						) : null}
						{/* row to populate the reference field values
					from which the new field is copied */}
						<Row gutter={8}>
							<Col md={copiedFieldItem.fieldType === 'text' ? 14 : 19}>
								<Input type="text" value={copiedFieldItem.fieldName} disabled />
							</Col>

							{copiedFieldItem.fieldType === 'text' && (
								<Col md={5}>
									<Input
										type="text"
										value={usecases[copiedFieldItem.fieldUsecase]}
										disabled
									/>
								</Col>
							)}

							<Col md={5}>
								<Input type="text" value={copiedFieldItem.fieldType} disabled />
							</Col>
						</Row>
						<Divider style={{ margin: '2rem auto' }} />
						{/* row to populate the new field */}
						<Row gutter={8}>
							<Col md={fieldType === 'text' ? 14 : 19}>
								<Input
									type="text"
									name="fieldName"
									onChange={this.handleInput}
									placeholder="Enter field name to copy to"
									value={fieldName}
									style={
										fieldNameError
											? {
													borderColor: '#f5222d',
											  }
											: {}
									}
								/>
								{fieldNameError ? (
									<span
										style={{
											color: '#f5222d',
											margin: '5px 0',
											display: 'inline-block',
										}}
									>
										{fieldNameError}
									</span>
								) : null}
							</Col>
							{fieldType === 'text' ? (
								<Col md={5}>
									<Select
										style={{ width: '100%' }}
										value={fieldUsecase}
										onChange={this.handleUsecase}
									>
										{Object.keys(usecases).map((usecase) => (
											<Option key={usecase} value={usecase}>
												{usecases[usecase]}
											</Option>
										))}
									</Select>
								</Col>
							) : null}
							<Col md={5}>
								<Select
									style={{ width: '100%', textTransform: 'capitalize' }}
									value={fieldType}
									onChange={this.handleType}
								>
									{types.map((type) => (
										<Option key={type} value={type}>
											{capitalizeFirstLetter(type)}
										</Option>
									))}
								</Select>
							</Col>
						</Row>
					</Modal>
				)}
			</React.Fragment>
		);
	}
}

CopyField.defaultProps = {
	useAsModal: false,
	visible: false,
	onCloseModal: () => {},
	appVersion: undefined,
};

CopyField.propTypes = {
	fields: PropTypes.array.isRequired,
	onCopyField: PropTypes.func.isRequired,
	useAsModal: PropTypes.bool,
	visible: PropTypes.bool,
	copiedFieldItem: PropTypes.object.isRequired,
	onCloseModal: PropTypes.func,
	appVersion: PropTypes.string,
};

const mapStateToProps = (state) => ({
	appVersion: get(state, '$getAppPlan.results.version'),
});

export default connect(mapStateToProps)(CopyField);
