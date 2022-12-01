/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { PlusOutlined } from '@ant-design/icons';

import { Button, Input, Modal } from 'antd';
import { css } from 'emotion';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { validateHtmlStr } from '../../../utils';
import Flex from '../../../../../batteries/components/shared/Flex';

const container = css`
	max-width: 800px;
	width: 500px;

	label {
		display: inline-block;
		width: 100%;

		span {
			display: inline-block;
			margin-bottom: 10px;
			font-weight: 500;
		}

		.error {
			border: 1px solid red;
			box-shadow: 0 0 2px red;
		}
	}

	.error-message {
		color: red;
	}
`;
const AddSectionModalContent = (props) => {
	const { onSave } = props;

	const [visible, setVisible] = useState(false);
	const [value, setValue] = useState('');
	const [error, setError] = useState(false);
	const onCancel = () => {
		setVisible(false);
	};

	const triggerModal = () => {
		setVisible(true);
	};

	const handleChange = (e) => {
		const val = e.target.value;
		setValue(val);
	};

	const handleSave = () => {
		if (validateHtmlStr(value)) {
			onSave(value);
			setVisible(false);
			if (error) {
				setError(false);
			}
		} else {
			setError(true);
		}
	};
	return (
		<>
			<Button
				className="add-section-wrapper"
				type="primary"
				onClick={triggerModal}
				icon={<PlusOutlined />}
			>
				Add Section
			</Button>{' '}
			<Modal
				visible={visible}
				onCancel={onCancel}
				title="Add Section"
				className={container}
				footer={
					<Flex flexDirection="row-reverse">
						<Button onClick={handleSave} type="primary">
							Save
						</Button>
					</Flex>
				}
			>
				<label>
					<span>Section Label</span>
					<Input
						name="sectionLabel"
						id="sectionLabel"
						value={value}
						onChange={handleChange}
						placeholder="Accepts valid HTML"
						className={error ? 'error' : ''}
					/>
					{error && <span className="error-message">Invalid HTML</span>}
				</label>
			</Modal>
		</>
	);
};
AddSectionModalContent.propTypes = {
	onSave: PropTypes.func.isRequired,
};
export default AddSectionModalContent;
