import { Button, Card, Tooltip, Typography } from 'antd';
import React, { useContext, useState } from 'react';
import styled from 'react-emotion';
import { FormContext } from '../../../../utils/utils';

const Root = styled.div`
	border: 1px solid black;
	& .ant-tooltip-open {
		border: 2px dashed #999;
	}
`;
const Navbar = styled.div`
	padding: 10px;
	background-color: blue;
`;
const LoginButton = styled(Button)`
	display: block;
	margin-left: auto;
`;
const Content = styled.div`
	padding: 30px;
	padding-bottom: 100px;
`;
const ResultCard = styled(Card)``;
const PreviewLink = styled.div`
	user-select: none;
	cursor: pointer;
	text-decoration: underline;
`;

const defaultTooltipState = {
	root: {
		value: false,
		navbar: {
			value: false,
			loginButton: { value: false },
		},
		content: {
			value: false,
			resultCard: {
				value: false,
				title: { value: false },
				description: { value: false },
				link: { value: false },
			},
		},
	},
};

const ThemePreview = () => {
	const form = useContext(FormContext);
	const [tooltipState, setTooltipState] = useState(defaultTooltipState);
	const fontFamily = form.value.fontFamily || '';
	const googleFontWeight = form.value.fontWeight ? `:wght@${form.value.fontWeight}` : '';
	const googleFont = fontFamily + googleFontWeight;
	const safeFontFamily = fontFamily ? `${fontFamily} sans-serif` : 'sans-serif';

	const handleTooltipChange = (nestedPropertyString, value) => {
		const propArr = nestedPropertyString.split('.');
		const clonedState = JSON.parse(JSON.stringify(defaultTooltipState));
		let current = clonedState;
		let parent = null;
		for (let i = 0; i < propArr.length; i += 1) {
			const prop = propArr[i];
			if (Object.hasOwn(current, prop)) {
				parent = current;
				current = current[prop];
			}
		}
		if (!value && parent) {
			parent.value = true;
		}
		current.value = value;
		setTooltipState(clonedState);
	};

	return (
		<div>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
			<link
				href={`https://fonts.googleapis.com/css2?family=${googleFont}&display=swap`}
				rel="stylesheet"
			/>
			<h2>Design Preview</h2>
			<Typography.Paragraph>
				Hover over an element to see the style preset being applied to it.
			</Typography.Paragraph>
			<Root
				style={{
					backgroundColor: form.value.bodyBackgroundColor,
					color: form.value.textColor,
					fontFamily: form.value.fontFamily,
					fontWeight: safeFontFamily,
				}}
			>
				<Tooltip
					onVisibleChange={(visible) => handleTooltipChange('root.navbar', visible)}
					open={tooltipState.root.navbar.value}
					title="Navbar color"
				>
					<Navbar style={{ backgroundColor: form.value.navbarBackgroundColor }}>
						<Tooltip
							onVisibleChange={(visible) =>
								handleTooltipChange('root.navbar.loginButton', visible)
							}
							open={tooltipState.root.navbar.loginButton.value}
							title="Accent color"
							placement="topRight"
						>
							<LoginButton
								style={{
									backgroundColor: form.value.primaryColor,
									color: form.value.textColor,
								}}
							>
								User
							</LoginButton>
						</Tooltip>
					</Navbar>
				</Tooltip>
				<Tooltip
					onVisibleChange={(visible) => handleTooltipChange('root.content', visible)}
					open={tooltipState.root.content.value}
					title="Body background color"
					placement="bottom"
				>
					<Content>
						<Tooltip
							onVisibleChange={(visible) =>
								handleTooltipChange('root.content.resultCard', visible)
							}
							open={tooltipState.root.content.resultCard.value}
							title="Font family, title color gets applied here"
							placement="bottom"
						>
							<ResultCard>
								<Tooltip
									onVisibleChange={(visible) =>
										handleTooltipChange(
											'root.content.resultCard.title',
											visible,
										)
									}
									open={tooltipState.root.content.resultCard.title.value}
									title="Title color"
									placement="topLeft"
								>
									<Typography.Title
										level={3}
										style={{ color: form.value.titleColor }}
									>
										iPhone 14
									</Typography.Title>
								</Tooltip>
								<Tooltip
									onVisibleChange={(visible) =>
										handleTooltipChange(
											'root.content.resultCard.description',
											visible,
										)
									}
									open={tooltipState.root.content.resultCard.description.value}
									title="Text color"
									placement="bottom"
								>
									<p style={{ color: form.value.textColor }}>
										iPhone 14 and iPhone 14 plus introduce{' '}
										<b>a new standard for photo and video capture</b>
									</p>
								</Tooltip>
								<Tooltip
									onVisibleChange={(visible) =>
										handleTooltipChange('root.content.resultCard.link', visible)
									}
									open={tooltipState.root.content.resultCard.link.value}
									title="Link color"
									placement="topLeft"
								>
									<PreviewLink
										style={{
											color: form.value.linkColor,
										}}
									>
										View URL
									</PreviewLink>
								</Tooltip>
							</ResultCard>
						</Tooltip>
					</Content>
				</Tooltip>
			</Root>
		</div>
	);
};

export default ThemePreview;
