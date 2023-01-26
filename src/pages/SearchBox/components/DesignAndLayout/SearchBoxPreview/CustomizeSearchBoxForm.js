import { Form, Input, Select, Switch } from 'antd';
import styled from 'react-emotion';
import React, { useEffect, useState } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { searchboxMessages } from '../../../../../utils/messages';
import SearchSvg from './SearchSVG';

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
const StyledSearchIcon = styled.div`
	width: 40px;
	height: 40px;
	display: block;
`;

const KeyboardShortcut = styled.div`
	font-size: 0.8rem;
	color: gray;
	font-weight: bold;
`;

const NEW_SHORTCUT_DELAY = 1000;

export default function CustomizeSearchBoxForm() {
	const [currentShortcuts, setCurrentShortcuts] = useState([]);
	const [debouncedShortcut, setDebouncedShortcut] = useState('');
	const iconURL = '';

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
				setCurrentShortcuts([...currentShortcuts, debouncedShortcut]);
				setDebouncedShortcut('');
			}
		}, NEW_SHORTCUT_DELAY);

		return () => clearTimeout(timerId);
	}, [debouncedShortcut]);

	return (
		<StyledForm labelWrap labelAlign="left" colon={false} labelCol={{ span: 8 }}>
			<Form.Item
				tooltip={{
					icon: <InfoCircleOutlined />,
					title: searchboxMessages.iconURL,
				}}
				label="Search Icon"
			>
				<IconInputContainer>
					<IconPreview>
						{iconURL ? (
							<IconImage src={iconURL} alt="Icon preview" />
						) : (
							<StyledSearchIcon>
								<SearchSvg />
							</StyledSearchIcon>
						)}
					</IconPreview>
					<StyledInput placeholder="Image URL" />
				</IconInputContainer>
			</Form.Item>
			<Form.Item
				label="Icon Position"
				tooltip={{
					icon: <InfoCircleOutlined />,
					title: searchboxMessages.iconPosition,
				}}
			>
				<div>
					<span>Left</span>
					<StyledSwitch />
					<span>Right</span>
				</div>
			</Form.Item>
			<Form.Item
				tooltip={{
					icon: <InfoCircleOutlined />,
					title: searchboxMessages.placeholder,
				}}
				label="Placeholder Text"
			>
				<StyledInput placeholder="Search for suggestions..." />
			</Form.Item>
			<Form.Item
				tooltip={{
					icon: <InfoCircleOutlined />,
					title: searchboxMessages.focusShortcuts,
				}}
				label="Keyboard Shortcut"
			>
				<StyledSelect
					placeholder="Not applied"
					onInputKeyDown={(e) => {
						e.preventDefault();
						handleShortcutKey(e.key);
					}}
					onDeselect={(option) =>
						setCurrentShortcuts(
							currentShortcuts.filter((shortcut) => shortcut !== option),
						)
					}
					mode="tags"
					open={false}
					value={currentShortcuts}
					searchValue=""
				/>
				<KeyboardShortcut>{debouncedShortcut}</KeyboardShortcut>
			</Form.Item>
			<Form.Item
				tooltip={{
					icon: <InfoCircleOutlined />,
					title: searchboxMessages.addonBefore,
				}}
				label="Addon Before"
			>
				<StyledInput placeholder="Enter <html> markup" />
			</Form.Item>
			<Form.Item
				tooltip={{
					icon: <InfoCircleOutlined />,
					title: searchboxMessages.addonAfter,
				}}
				label="Addon After"
			>
				<StyledInput placeholder="Enter <html> markup" />
			</Form.Item>
		</StyledForm>
	);
}
