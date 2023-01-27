/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { EditOutlined, PlusOutlined } from '@ant-design/icons';

import { Button, Input, Modal } from 'antd';
import { css } from 'emotion';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { validateHtmlStr } from '../../../utils';
import Flex from '../../../../../batteries/components/shared/Flex';
import CustomizeSearchBoxForm from './CustomizeSearchBoxForm';

const buttonContainer = css`
	display: flex;
	padding: 10px;
	justify-content: flex-end;
`;

const button = css`
	margin-left: 1rem;
`;

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
const AllModalContent = (props) => {
	const { onSave } = props;

	const [visible, setVisible] = useState({ addSection: false, customizeSearchbox: false });
	const [value, setValue] = useState('');
	const [error, setError] = useState(false);

	const handleChangeAddSection = (e) => {
		const val = e.target.value;
		setValue(val);
	};

	const handleSaveAddSection = () => {
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
			<div className={buttonContainer}>
				<Button
					className={button}
					type="primary"
					onClick={() => setVisible({ customizeSearchbox: true })}
					icon={<EditOutlined />}
				>
					Customize
				</Button>
				<Button
					className={button}
					type="primary"
					onClick={() => setVisible({ addSection: true })}
					icon={<PlusOutlined />}
				>
					Add Section
				</Button>
			</div>
			<Modal
				open={visible.addSection}
				onCancel={() => setVisible({ addSection: false })}
				title="Add Section"
				className={container}
				footer={
					<Flex flexDirection="row-reverse">
						<Button onClick={handleSaveAddSection} type="primary">
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
						onChange={handleChangeAddSection}
						placeholder="Accepts valid HTML"
						className={error ? 'error' : ''}
					/>
					{error && <span className="error-message">Invalid HTML</span>}
				</label>
			</Modal>
			<CustomizeSearchBoxForm
				modalProps={{
					open: visible.customizeSearchbox,
					onCancel: () => setVisible({ customizeSearchbox: false }),
					onOk: () => setVisible({ customizeSearchbox: false }),
				}}
			/>
		</>
	);
};
AllModalContent.propTypes = {
	onSave: PropTypes.func.isRequired,
};
export default AllModalContent;
