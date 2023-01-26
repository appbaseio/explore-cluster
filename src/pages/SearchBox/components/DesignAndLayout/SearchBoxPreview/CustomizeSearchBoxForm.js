import { Form, Input, Select, Switch } from 'antd';
import styled from 'react-emotion';
import React, { useEffect, useState } from 'react';

const StyledInput = styled(Input)`
	width: 70%;
`;
const IconPreview = styled.div`
	display: inline-block;
	padding: 5px;
	border: 2px solid #ddd;
`;

const IconImage = styled.img`
	width: 40px;
	height: 40px;
	display: block;
`;

const IconInputContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
`;

const StyledSwitch = styled(Switch)`
	margin: 0 1rem;
`;
const StyledForm = styled(Form)`
	.ant-form-item-label {
		display: flex;
		align-items: center;
	}
`;

const StyledSelect = styled(Select)`
	width: 70% !important;
`;

const KeyboardShortcut = styled.div`
	font-size: 0.8rem;
	color: gray;
	font-weight: bold;
`;

const TEMP_ICON_URL =
	'https://static.vecteezy.com/system/resources/previews/009/876/396/original/realistic-magnifying-glass-clip-art-free-png.png';

const NEW_SHORTCUT_DELAY = 1000;

export default function CustomizeSearchBoxForm() {
	const [currentShortcut, setCurrentShortcut] = useState('');
	const [debouncedShortcut, setDebouncedShortcut] = useState('');

	const handleShortcutKey = (key) => {
		if (debouncedShortcut) {
			setDebouncedShortcut(`${debouncedShortcut} + ${key.toUpperCase()}`);
		} else {
			setDebouncedShortcut(key.toUpperCase());
		}
	};

	useEffect(() => {
		const timerId = setTimeout(() => {
			if (debouncedShortcut) {
				setCurrentShortcut(debouncedShortcut);
				setDebouncedShortcut('');
			}
		}, NEW_SHORTCUT_DELAY);

		return () => clearTimeout(timerId);
	}, [debouncedShortcut]);

	return (
		<StyledForm labelWrap labelAlign="left" colon={false} labelCol={{ span: 8 }}>
			<Form.Item label="Search Icon">
				<IconInputContainer>
					<IconPreview>
						<IconImage src={TEMP_ICON_URL} alt="icon preview" />
					</IconPreview>
					<StyledInput />
				</IconInputContainer>
			</Form.Item>
			<Form.Item label="Icon Position">
				<div>
					<span>Left</span>
					<StyledSwitch />
					<span>Right</span>
				</div>
			</Form.Item>
			<Form.Item label="Placeholder Text">
				<StyledInput />
			</Form.Item>
			<Form.Item label="Keyboard Shortcut">
				<StyledSelect
					onInputKeyDown={(e) => {
						e.preventDefault();
						handleShortcutKey(e.key);
					}}
					onDeselect={() => setCurrentShortcut('')}
					mode="tags"
					open={false}
					value={currentShortcut ? [currentShortcut] : undefined}
					searchValue=""
				/>
				<KeyboardShortcut>{debouncedShortcut}</KeyboardShortcut>
			</Form.Item>
			<Form.Item label="Addon Before">
				<StyledInput />
			</Form.Item>
			<Form.Item label="Addon After">
				<StyledInput />
			</Form.Item>
		</StyledForm>
	);
}
