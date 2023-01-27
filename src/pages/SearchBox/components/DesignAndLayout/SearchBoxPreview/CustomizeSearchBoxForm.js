import { Form, Input, Select, Switch } from 'antd';
import styled from 'react-emotion';
import React, { useContext } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { searchboxMessages } from '../../../../../utils/messages';
import SearchSvg from './SearchSVG';
import { FormContext } from '../../../../IntegrationsPage/utils/utils';
import { useKeyboardShortcutDebounce } from './useDebounce';

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

export default function CustomizeSearchBoxForm() {
	const mainForm = useContext(FormContext);
	const form = mainForm.get('designAndLayout');
	const focusShortcutsControl = form.get('focusShortcuts');
	const [debouncedShortcut, setDebouncedShortcut] = useKeyboardShortcutDebounce(
		focusShortcutsControl.handler,
	);
	const iconURL = '';

	return (
		<FieldGroup
			control={form}
			strict={false}
			render={(
				{ invalid: invalidForm }, // eslint-disable-line
			) => (
				<StyledForm labelWrap labelAlign="left" colon={false} labelCol={{ span: 8 }}>
					<FieldControl
						name="iconURL"
						render={({ handler }) => (
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
									<StyledInput placeholder="Image URL" {...handler()} />
								</IconInputContainer>
							</Form.Item>
						)}
					/>
					<FieldControl
						name="iconPosition"
						render={({ handler }) => {
							const { onChange, value } = handler();
							const handleOnChange = (v) => {
								onChange(v ? 'right' : 'left');
							};
							return (
								<Form.Item
									label="Icon Position"
									tooltip={{
										icon: <InfoCircleOutlined />,
										title: searchboxMessages.iconPosition,
									}}
								>
									<div>
										<span>Left</span>
										<StyledSwitch
											value={value === 'right'}
											onChange={handleOnChange}
										/>
										<span>Right</span>
									</div>
								</Form.Item>
							);
						}}
					/>
					<FieldControl
						name="placeholder"
						render={({ handler }) => (
							<Form.Item
								tooltip={{
									icon: <InfoCircleOutlined />,
									title: searchboxMessages.placeholder,
								}}
								label="Placeholder Text"
							>
								<StyledInput
									placeholder="Search for suggestions..."
									{...handler()}
								/>
							</Form.Item>
						)}
					/>
					<FieldControl
						name="focusShortcuts"
						strict={false}
						render={({ handler, value: focusShortcutsValue }) => (
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
										setDebouncedShortcut(e.key);
									}}
									onDeselect={(option) => {
										handler().onChange(
											focusShortcutsValue.filter(
												(shortcut) => shortcut !== option,
											),
										);
									}}
									mode="tags"
									open={false}
									value={focusShortcutsValue}
									searchValue=""
								/>
								<KeyboardShortcut>{debouncedShortcut}</KeyboardShortcut>
							</Form.Item>
						)}
					/>
					<FieldControl
						name="addonBefore"
						render={({ handler }) => (
							<Form.Item
								tooltip={{
									icon: <InfoCircleOutlined />,
									title: searchboxMessages.addonBefore,
								}}
								label="Addon Before"
							>
								<StyledInput placeholder="Enter <html> markup" {...handler()} />
							</Form.Item>
						)}
					/>
					<FieldControl
						name="addonAfter"
						render={({ handler }) => (
							<Form.Item
								tooltip={{
									icon: <InfoCircleOutlined />,
									title: searchboxMessages.addonAfter,
								}}
								label="Addon After"
							>
								<StyledInput placeholder="Enter <html> markup" {...handler()} />
							</Form.Item>
						)}
					/>
				</StyledForm>
			)}
		/>
	);
}
