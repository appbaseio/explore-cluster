import React from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select } from 'antd';
import PropTypes from 'prop-types';
import styles from './styles';
import Grid from './Grid';
import Flex from '../../batteries/components/shared/Flex';
import { getSuggestionCode, ipValidator, Suggestions } from './utils';

class WhiteList extends React.Component {
	constructor(props) {
		super(props);
		this.inputRef = undefined;
		this.state = {
			text: undefined,
		};
	}

	handleSelectOption = (value) => {
		this.setState((prev) => {
			const { control } = this.props;
			let finalValue = value;
			if (typeof value !== 'string') {
				finalValue = prev.text;
			}
			if (finalValue && !control.value.includes(finalValue)) {
				control.onChange([...control.value, finalValue]);
				return {
					text: undefined,
				};
			}
			return {
				text: undefined,
			};
		});
	};

	handleOnChange = (value) => {
		this.setState({
			text: value,
		});
	};

	handleOnSearch = (value) => {
		if (!(value && value.startsWith('**'))) {
			this.setState({
				text: value.trim(),
			});
		}
	};

	removeItem = (item) => {
		const { control } = this.props;
		const { value } = control;
		const index = value.indexOf(item);
		if (index > -1) {
			value.splice(index, 1);
			control.onChange(value);
			control.markAsTouched();
			control.markAsDirty();
		}
	};

	submitOnBlur = () => {
		const { control } = this.props;
		const { text } = this.state;
		if (!control.value.includes(text)) {
			if (ipValidator(text)) {
				control.onChange([...control.value, text]);
				this.setState({
					text: undefined,
				});
			} else if (text) {
				control.setErrors({ invalidIP: true });
			} else {
				control.setErrors(undefined);
			}
		} else {
			this.setState({
				text: undefined,
			});
			control.setErrors(undefined);
		}
	};

	render() {
		const {
			label,
			inputProps,
			labelClassName,
			defaultSuggestionValue,
			defaultValue,
			handleWarningMessage,
			control: { value, handler, hasError, disabled, enabled },
			type,
			toolTipMessage,
		} = this.props;
		const { text } = this.state;
		const { onChange } = handler();
		return (
			<Grid
				label={<span css={labelClassName}>{label}</span>}
				toolTipMessage={toolTipMessage}
				component={
					<Flex css="width: 100%;position: relative" flexDirection="column">
						{!(value && value.includes(defaultValue)) && (
							<Alert
								style={{ marginBottom: 10 }}
								message={
									<Flex justifyContent="space-between">
										<span
											style={{
												maxWidth: 280,
											}}
										>
											{handleWarningMessage(defaultValue)}
										</span>
										<Button onClick={() => onChange([defaultValue])}>
											Reset
										</Button>
									</Flex>
								}
								type="warning"
							/>
						)}

						{value.map((item) => (
							<Flex
								key={item}
								justifyContent="space-between"
								css={styles.addedWhiteList}
							>
								<div>
									<div>{item}</div>
									{type === 'dropdown' && (
										<div css="font-size: 12px;font-weight: normal">
											{getSuggestionCode(item)}
										</div>
									)}
								</div>
								{enabled && (
									<div css="cursor:pointer">
										<CloseCircleOutlined
											onClick={() => this.removeItem(item)}
										/>
									</div>
								)}
							</Flex>
						))}
						<div>
							{type === 'dropdown' ? (
								<Select
									showSearch
									{...inputProps}
									value={text}
									onSearch={this.handleOnSearch}
									onSelect={this.handleSelectOption}
									onBlur={this.handleSelectOption}
									defaultActiveFirstOption={!!text}
									showArrow={false}
									filterOption={false}
									disabled={disabled}
									style={{ width: '100%' }}
								>
									{text === '*' && text.length === 1 ? (
										<Select.Option key="*">
											<Flex justifyContent="space-between">
												<span>*</span>
												<span css={styles.description}>
													{getSuggestionCode('*')}
												</span>
											</Flex>
										</Select.Option>
									) : (
										Object.keys(Suggestions).map((k) => {
											const suggestion = Suggestions[k];
											if (text) {
												const suggestionValue = `${suggestion.prefix}${text}${suggestion.suffix}`;
												return (
													<Select.Option key={suggestionValue}>
														<Flex justifyContent="space-between">
															<span>{suggestionValue}</span>
															<span css={styles.description}>
																{suggestion.description}
															</span>
														</Flex>
													</Select.Option>
												);
											}
											return (
												<Select.Option css="pointer-events: none" key={k}>
													<Flex
														justifyContent="space-between"
														css="color: #d9d9d9;font-weight: 100;font-size: 12px"
													>
														<span>
															{suggestion.prefix}
															{defaultSuggestionValue}
															{suggestion.suffix}
														</span>
														<span css={styles.description}>
															{suggestion.description}
														</span>
													</Flex>
												</Select.Option>
											);
										})
									)}
								</Select>
							) : (
								<Input
									{...inputProps}
									{...handler()}
									value={text}
									onChange={(e) => {
										this.handleOnChange(e.target.value);
									}}
									onBlur={this.submitOnBlur}
									onKeyPress={(event) => {
										if (event.key === 'Enter') {
											this.submitOnBlur();
										}
									}}
								/>
							)}
							{hasError('invalidIP') && (
								<div css={styles.error}>
									An IP source should be a valid IPv4 or IPv6 CIDR address
								</div>
							)}
						</div>
					</Flex>
				}
			/>
		);
	}
}
WhiteList.propTypes = {
	handleWarningMessage: PropTypes.func,
	defaultValue: PropTypes.string,
	label: PropTypes.string.isRequired,
	toolTipMessage: PropTypes.any.isRequired,
	inputProps: PropTypes.object,
	defaultSuggestionValue: PropTypes.string,
	control: PropTypes.object.isRequired,
	type: PropTypes.oneOf(['dropdown']),
	labelClassName: PropTypes.string,
};

WhiteList.defaultProps = {
	handleWarningMessage: () => {},
	defaultValue: undefined,
	inputProps: {},
	type: undefined,
	defaultSuggestionValue: undefined,
	labelClassName: '',
};

export default WhiteList;
