import React, { Component } from 'react';
import { Select, Row, Col } from 'antd';
import styled from 'react-emotion';
import { FieldControl } from 'react-reactive-form';
import ColorPicker from './ColorPicker';
import { fontWeights, webSafeFonts } from '../../../../../utils';
import ThemePreview from '../ThemePreview';

const { Option } = Select;

const InputContainer = styled.div`
	display: grid;
	grid-gap: 10px;
`;
const Label = styled.div`
	margin-right: 50px;
	font-weight: 500;
`;

const MainInput = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	max-width: 350px;
`;
const FontFamilySelect = styled(Select)`
	min-width: 200px;
	width: 50%;
`;
const Section = styled(Col)`
	padding-top: 10px;
`;

class StylePresets extends Component {
	state = {
		fontFamilies: [],
	};

	componentDidMount() {
		try {
			this.getFontFamily();
		} catch (error) {
			// eslint-disable-next-line
			console.error(error);
		}
	}

	getFontFamily = async () => {
		try {
			await fetch(
				'https://www.googleapis.com/webfonts/v1/webfonts?key=REDACTED_GOOGLE_API_KEY&sort=popularity',
			)
				.then((res) => res.json())
				.then((data) => {
					const { items } = data;
					const fontFamilies = items.map((item) => ({
						family: item.family,
					}));
					this.setState({
						fontFamilies: [...webSafeFonts, ...fontFamilies],
					});
				});
		} catch (error) {
			console.error('Some Error');
		}
	};

	// handleFontFamily = (value) => {
	// 	const { setPreference, preferences } = this.props;
	// 	let _theme = preferences._theme || {
	// 		typography: {},
	// 		colors: {},
	// 	};
	// 	// this is for exisiting user who already have _theme in preferences
	// 	if (_theme.typography) {
	// 		_theme.typography.fontFamily = value;
	// 	} else {
	// 		_theme = {
	// 			..._theme,
	// 			typography: { fontFamily: value },
	// 		};
	// 	}
	// 	preferences._theme = _theme;
	// 	setPreference(preferences);
	// };

	render() {
		const { fontFamilies } = this.state;
		// if (preferences._theme) {
		// 	// this is necessary since often batteries mess up with my code and resets preferences
		// 	primaryColor = preferences._theme.colors.primaryColor || primaryColor;
		// 	primaryTextColor = preferences._theme.colors.primaryTextColor || primaryTextColor;
		// 	textColor = preferences._theme.colors.textColor || textColor;
		// 	titleColor = preferences._theme.colors.titleColor || titleColor;
		// 	fontFamily =
		// 		(preferences._theme.typography && preferences._theme.typography.fontFamily) ||
		// 		fontFamily;
		// }

		// let fontFamilyLink = '';
		// if (fontFamily && fontFamily !== 'default') {
		// 	const parsedFontFamily = fontFamily.split(' ').join('+');
		// 	fontFamilyLink = (
		// 		<link
		// 			href={`https://fonts.googleapis.com/css?family=${parsedFontFamily}`}
		// 			rel="stylesheet"
		// 		/>
		// 	);
		// }

		// const themeConfig = {
		// 	colors: { primaryColor, titleColor, textColor, primaryTextColor },
		// 	typography: { fontFamily },
		// };
		return (
			<Row>
				<Section lg={12} md={24}>
					<h2>Style Presets</h2>
					<InputContainer>
						<FieldControl name="bodyBackgroundColor">
							{(control) => {
								// This line assumes this.form in PreferenceFormWrapperN is always filled with some defaultValue
								if (!control.value) {
									control.setValue(control.formState || '#000000');
								}
								return (
									<ColorPicker
										label="Body Background Color"
										value={control.value}
										onChange={(value) => {
											control.onChange(value && value.hex);
										}}
									/>
								);
							}}
						</FieldControl>
						<FieldControl name="navbarBackgroundColor">
							{(control) => {
								// This line assumes this.form in PreferenceFormWrapperN is always filled with some defaultValue
								if (!control.value) {
									control.setValue(control.formState || '#000000');
								}
								return (
									<ColorPicker
										label="Navbar Background Color"
										value={control.value}
										onChange={(value) => {
											control.onChange(value && value.hex);
										}}
									/>
								);
							}}
						</FieldControl>
						<FieldControl name="primaryColor">
							{({ value, onChange }) => (
								<ColorPicker
									label="Accent Color"
									value={value}
									onChange={({ hex }) => {
										onChange(hex);
									}}
								/>
							)}
						</FieldControl>
						<FieldControl name="titleColor">
							{({ value, onChange }) => (
								<ColorPicker
									label="Title Color"
									value={value}
									onChange={({ hex }) => onChange(hex)}
								/>
							)}
						</FieldControl>
						<FieldControl name="textColor">
							{({ value, onChange }) => (
								<ColorPicker
									label="Text Color"
									value={value}
									onChange={({ hex }) => onChange(hex)}
								/>
							)}
						</FieldControl>
						<FieldControl name="linkColor">
							{(control) => {
								// This line assumes this.form in PreferenceFormWrapperN is always filled with some defaultValue
								if (!control.value) {
									control.setValue(control.formState || '#000000');
								}
								return (
									<ColorPicker
										label="Link Color"
										value={control.value}
										onChange={(value) => {
											control.onChange(value && value.hex);
										}}
									/>
								);
							}}
						</FieldControl>
						<FieldControl strict={false} name="fontFamily">
							{({ value, onChange }) =>
								fontFamilies.length > 0 ? (
									<MainInput>
										<Label>Font Family</Label>
										<FontFamilySelect
											showSearch
											value={value}
											placeholder="Select Font family"
											optionFilterProp="children"
											onChange={onChange}
											filterOption={(input, option) =>
												option.props.children
													.toLowerCase()
													.indexOf(input.toLowerCase()) >= 0
											}
										>
											{fontFamilies.map(({ family }) => (
												<Option key={family} value={family}>
													{family}
												</Option>
											))}
										</FontFamilySelect>
									</MainInput>
								) : null
							}
						</FieldControl>
						<FieldControl strict={false} name="fontWeight">
							{(control) => {
								if (!control.value) {
									control.setValue(control.formState || '100');
								}
								return (
									<MainInput>
										<Label>Font Weight</Label>
										<Select
											css="width : 50%"
											showSearch
											value={control.value}
											placeholder="Select Font Weight"
											onChange={control.onChange}
										>
											{fontWeights.map((weight) => {
												let fontWeight = 'lighter';
												if (weight.value > 200) {
													fontWeight = 'regular';
												}
												if (weight.value > 600) {
													fontWeight = 'bold';
												}
												return (
													<Option
														style={{ fontWeight }}
														key={weight.value}
														value={weight.value}
													>
														{weight.label}
													</Option>
												);
											})}
										</Select>
									</MainInput>
								);
							}}
						</FieldControl>
					</InputContainer>
				</Section>
				<Section lg={12} md={24}>
					<ThemePreview />
				</Section>
				{/* <Col md={12} sm={24}>
					{fontFamilyLink ? <Helmet>{fontFamilyLink}</Helmet> : null}
					<ReactiveBase app={app} credentials={credentials} theme={themeConfig}>
						<CategorySearch
							componentId="search"
							filterLabel="Search"
							dataField={[
								'title',
								'title.keyword',
								'title.search',
								'title.autosuggest',
								'body_html',
								'body_html.keyword',
								'body_html.autosuggest',
								'body_html.search',
								'vendor',
								'title.keyword',
								'title.search',
								'title.autosuggest',
							]}
							ref={inputRef}
							className="search"
							placeholder="Search for products..."
							iconPosition="right"
							css={{
								marginBottom: 20,
								position: 'sticky',
								top: '10px',
								zIndex: 4,
							}}
							downShiftProps={{ isOpen: true, disabled: true }}
							render={({
								value,
								categories,
								rawSuggestions,
								downshiftProps,
								loading,
							}) => {
								return (
									downshiftProps.isOpen && (
										<SuggestionsRenderer
											currentValue="shoe"
											categories={categories}
											customMessage={preferences.customMessage || {}}
											getItemProps={downshiftProps.getItemProps}
											highlightedIndex={downshiftProps.highlightedIndex}
											loading={loading}
											parsedSuggestions={
												rawSuggestions.length > 0
													? rawSuggestions.filter(
															(suggestion) =>
																suggestion._source.type !==
																'collections',
													  )
													: [
															{
																value: 'Shoe-1',
																_source: {
																	body_html:
																		"Make a statement with the Dr Marten's Cavendish 3-Eye shoe. Stamped with Docs trademade look, this lace-up shoe is crafted with high-quality, durable smooth leather, and has been made to last. This un…",
																	image: {
																		src:
																			'https://cdn.shopify.com/s/files/1/0006/7724/9089/products/8d7a6c39d295441c940cb2bacfd34794.jpg?v=1522333991',
																	},
																	title: 'Shoe',
																	variants: [
																		{
																			price: 240,
																		},
																	],
																},
															},
															{
																value: 'Shoe-2',
																_source: {
																	body_html:
																		"Make a statement with the Dr Marten's Cavendish 3-Eye shoe. Stamped with Docs trademade look, this lace-up shoe is crafted with high-quality, durable smooth leather, and has been made to last. This un…",
																	image: {
																		src:
																			'https://cdn.shopify.com/s/files/1/0006/7724/9089/products/8d7a6c39d295441c940cb2bacfd34794.jpg?v=1522333991',
																	},
																	title: 'Black Shoe',
																	variants: [
																		{
																			price: 140,
																		},
																	],
																},
															},
													  ]
											}
											themeConfig={themeConfig}
											currency={
												preferences &&
												preferences._store &&
												preferences._store.currency
											}
											customSuggestions={get(
												preferences,
												'default.search.customSuggestions',
												'',
											)}
										/>
									)
								);
							}}
							categoryField="product_type.keyword"
						/>
					</ReactiveBase>
				</Col> */}
			</Row>
		);
	}
}

StylePresets.propTypes = {};

export default StylePresets;
