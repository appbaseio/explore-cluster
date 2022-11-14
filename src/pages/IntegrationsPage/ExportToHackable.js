import React from 'react';
import { func, object, bool, number, oneOfType, string } from 'prop-types';
import { CopyOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getCSBScript, getRecommendationScript } from './utils';

const copyToClipboard = () => {
	message.success('Copied to clipboard', 5);
};

const ctaChange = `<div id="reactivesearch-shopify" openAsPage="true"></div>`;

const ExportToHackable = ({ control, preferences, isRecommendation, widgetId }) => {
	// Override user credentials to API credentials selected by user
	const credentials = control.get('credentials') ? control.get('credentials').value : undefined;
	const installationHeadScript = getCSBScript(preferences(), credentials, isRecommendation);
	const ctaScript = `<div id="reactivesearch-shopify"></div>`;
	const recommendationScript = getRecommendationScript(widgetId);
	return (
		<React.Fragment>
			<h2>Export to CodeSandbox</h2>
			<div
				style={{
					position: 'relative',
					marginBottom: 25,
				}}
			>
				Open the CodeSandbox{' '}
				<a
					target="blank"
					href="https://codesandbox.io/s/github/appbaseio/recommendations-template/tree/main?file=/public/index.html"
				>
					link here
				</a>
				.
			</div>
			<div>
				Add this snippet within the <strong>head</strong> tag of the{' '}
				<strong>index.html</strong> file to apply the preferences.
			</div>
			<div
				style={{
					position: 'relative',
					marginBottom: 25,
				}}
			>
				<CopyToClipboard text={installationHeadScript} onCopy={copyToClipboard}>
					<Button
						icon={<CopyOutlined />}
						shape="circle"
						css={{
							position: 'absolute',
							right: 10,
							top: 10,
						}}
					/>
				</CopyToClipboard>

				<pre
					style={{
						background: '#eee',
						padding: '0 20px',
						margin: '20px 0',
					}}
				>
					{installationHeadScript}
				</pre>
			</div>
			{isRecommendation ? (
				<div>
					Add the following snippet into <strong>body</strong> tag of{' '}
					<strong>index.html</strong> file.
					<div
						style={{
							position: 'relative',
							marginBottom: 25,
						}}
					>
						<CopyToClipboard text={recommendationScript} onCopy={copyToClipboard}>
							<Button
								icon={<CopyOutlined />}
								shape="circle"
								css={{
									position: 'absolute',
									right: 10,
									top: 10,
								}}
							/>
						</CopyToClipboard>
						<div>
							<pre
								style={{
									background: '#eee',
									padding: '20px 20px',
									margin: '20px 0',
								}}
							>
								{recommendationScript}
							</pre>
						</div>
					</div>
					<strong>Note:</strong> After applying the changes, save and reload the
					CodeSandbox to have them take effect.
				</div>
			) : (
				<FieldGroup control={control}>
					{() => (
						<FieldControl name="openAsPage">
							{({ value }) =>
								!value ? (
									<div>
										<div>
											Add the following snippet in <strong>index.html</strong>{' '}
											that controls the positioning of the search CTA.
										</div>

										<div
											style={{
												position: 'relative',
												marginBottom: 25,
											}}
										>
											<CopyToClipboard
												text={ctaScript}
												onCopy={copyToClipboard}
											>
												<Button
													icon={<CopyOutlined />}
													shape="circle"
													style={{
														position: 'absolute',
														right: 10,
														top: 10,
													}}
												/>
											</CopyToClipboard>
											<div>
												<pre
													style={{
														background: '#eee',
														padding: '20px 20px',
														margin: '20px 0',
													}}
												>
													{ctaScript}
												</pre>
											</div>
										</div>
										<div>
											By default, the above CTA is relatively positioned. If
											you wish it to position it absolutely, add a style
											attribute. For example, the following snippet positions
											it to the top left.
										</div>
										<div>
											<pre
												style={{
													background: '#eee',
													padding: '20px 20px',
													margin: '20px 0',
												}}
											>
												{`<div id="reactivesearch-shopify" style="position:absolute;top:10px;left:10px;" />`}
											</pre>
										</div>
									</div>
								) : (
									<div>
										Add the following snippet into <strong>body</strong> tag of{' '}
										<strong>index.html</strong> file.
										<div
											style={{
												position: 'relative',
												marginBottom: 25,
											}}
										>
											<CopyToClipboard
												text={ctaChange}
												onCopy={copyToClipboard}
											>
												<Button
													icon={<CopyOutlined />}
													shape="circle"
													style={{
														position: 'absolute',
														right: 10,
														top: 10,
													}}
												/>
											</CopyToClipboard>
											<div>
												<pre
													style={{
														background: '#eee',
														padding: '20px 20px',
														margin: '20px 0',
													}}
												>
													{ctaChange}
												</pre>
											</div>
										</div>
										<strong>Note:</strong> After applying the changes, save and
										reload the CodeSandbox to have them take effect.
									</div>
								)
							}
						</FieldControl>
					)}
				</FieldGroup>
			)}
		</React.Fragment>
	);
};
ExportToHackable.defaultProps = {
	isRecommendation: false,
	widgetId: undefined,
};

ExportToHackable.propTypes = {
	preferences: func.isRequired,
	control: object.isRequired,
	isRecommendation: bool,
	widgetId: oneOfType([number, string]),
};

export default ExportToHackable;
