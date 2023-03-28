import { Form, Input, Modal, Select, Switch } from 'antd';
import styled from 'react-emotion';
import React, { useContext, useEffect, useState } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { object, string } from 'prop-types';
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

const DebouncedIconImage = ({ src, alt }) => {
	const [latestIconURL, setLatestIconURL] = useState('');

	useEffect(() => {
		const DEBOUNCE_ICON_IMAGE_PREVIEW = 500;
		// latestIconURL is source of truth.
		// When iconURLControl.value changes it would always be in sync with latestIconURL.
		// Handle when the above is false
		const timerId = setTimeout(() => {
			setLatestIconURL(src);
		}, DEBOUNCE_ICON_IMAGE_PREVIEW);

		return () => clearTimeout(timerId);
	}, [src]);

	return <IconImage src={latestIconURL} alt={alt} />;
};

DebouncedIconImage.propTypes = {
	src: string.isRequired,
	alt: string.isRequired,
};

export default function CustomizeSearchBoxForm({ modalProps }) {
	const mainForm = useContext(FormContext);
	const designAndLayoutform = mainForm.get('designAndLayout');
	const form = designAndLayoutform.get('customizeSearchBox');
	const focusShortcutsControl = form.get('focusShortcuts');
	const [debouncedShortcut, setDebouncedShortcut] = useKeyboardShortcutDebounce(
		focusShortcutsControl.handler,
	);

	return (
		<FieldGroup
			control={form}
			strict={false}
			render={({ invalid: invalidForm, pristine: pristineForm }) => (
				<Modal
					{...modalProps}
					onCancel={() => {
						modalProps.onCancel();
					}}
					title="Customize Searchbox"
					okText="Save"
					width="75%"
					okButtonProps={{
						disabled: pristineForm || invalidForm,
					}}
					cancelButtonProps={{ style: { display: 'none' } }}
				>
					<StyledForm labelWrap labelAlign="left" colon={false} labelCol={{ span: 8 }}>
						<FieldControl
							name="iconURL"
							strict={false}
							render={({ errors, value: iconURL, touched, handler }) => {
								const invalidURL = touched && errors?.invalidLink;
								return (
									<Form.Item
										tooltip={{
											icon: <InfoCircleOutlined />,
											title: searchboxMessages.iconURL,
										}}
										label="Search Icon"
										hasFeedback={touched}
										validateStatus={invalidURL ? 'error' : 'success'}
										help={invalidURL ? 'Please provide a valid image URL.' : ''}
									>
										<IconInputContainer>
											<IconPreview>
												{iconURL && !invalidURL ? (
													<DebouncedIconImage
														src={iconURL}
														alt="Icon preview"
													/>
												) : (
													<StyledSearchIcon>
														<SearchSvg
															style={{
																fill: designAndLayoutform?.value
																	?.primaryColor,
															}}
														/>
													</StyledSearchIcon>
												)}
											</IconPreview>
											<StyledInput placeholder="Image URL" {...handler()} />
										</IconInputContainer>
									</Form.Item>
								);
							}}
						/>
						<FieldControl
							name="iconPosition"
							strict={false}
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
												checked={value === 'right'}
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
												focusShortcutsValue
													? focusShortcutsValue.filter(
															(shortcut) => shortcut !== option,
													  )
													: [],
											);
										}}
										mode="tags"
										open={false}
										value={focusShortcutsValue || []}
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
				</Modal>
			)}
		/>
	);
}

CustomizeSearchBoxForm.defaultProps = {
	modalProps: {},
};

CustomizeSearchBoxForm.propTypes = {
	modalProps: object, // eslint-disable-line react/forbid-prop-types
};
